// Netlify Function: recibe un artículo YA ESCRITO en español e inglés (por
// la sesión de Claude Code de Raúl, con su suscripción) y lo guarda como
// BORRADOR en Contentful: español en es-ES, inglés en en-US y, si llegan,
// las portadas como imagen destacada de cada idioma. No llama a ninguna IA.
//
// Body: {
//   es: { title, excerpt, body: [bloques] },
//   en: { title, excerpt, body: [bloques] },
//   covers?: { es: assetId, en: assetId },   // de /api/blog-asset
//   entryId?: "…",                           // actualiza ese borrador
//   recommended?: ["entryId", …],            // posts publicados a recomendar
//   onlyCovers?: true                        // con entryId + covers: solo cambia las portadas
// }
//
// Lo usan .claude/scripts/blog-borrador.mjs (skill /bitacora y la tarea
// nocturna) y /admin-blog («Pegar artículo de Claude»).
// Variables: BLOG_ADMIN_SECRET y las CONTENTFUL_* de siempre.

import { blocksToRichText } from "./lib/richText.js";
import { saveBlogDraft } from "./lib/contentful.js";
import { validateArticleDraft, draftSummary } from "./lib/articleDraft.js";
import { checkAdmin, contentfulErrorMessage, jsonResponse, readJsonBody } from "./lib/adminRequest.js";

const ID_RE = /^[A-Za-z0-9_-]{1,64}$/;

export default async (req) => {
  const denied = checkAdmin(req);
  if (denied) return denied;

  const parsed = await readJsonBody(req, 400_000);
  if (parsed.error) return parsed.error;
  const payload = parsed.data;

  const { covers, entryId, recommended, onlyCovers } = payload || {};

  // Solo portadas: cambia la imagen destacada de un borrador y nada más.
  if (onlyCovers === true) {
    if (!ID_RE.test(entryId || "") || !ID_RE.test(covers?.es || "") || (covers?.en && !ID_RE.test(covers.en))) {
      return jsonResponse(422, { error: "onlyCovers necesita entryId y covers.es (y covers.en)." });
    }
    try {
      const contentful = await saveBlogDraft({ entryId, covers, onlyCovers: true, es: {}, en: {} });
      return jsonResponse(200, { ok: true, contentful });
    } catch (error) {
      return jsonResponse(502, { error: `Falló al cambiar las portadas: ${contentfulErrorMessage(error)}` });
    }
  }

  if (!payload?.es || !payload?.en) {
    return jsonResponse(422, {
      error: 'El artículo necesita las dos versiones: { "es": {…}, "en": {…} }.',
    });
  }

  const errors = [];
  const versions = {};
  for (const lang of ["es", "en"]) {
    const check = validateArticleDraft(payload[lang]);
    if (check.ok) versions[lang] = check.article;
    else errors.push(...check.errors.map((e) => `[${lang}] ${e}`));
  }
  if (recommended !== undefined && (!Array.isArray(recommended) || recommended.length > 3 || !recommended.every((id) => ID_RE.test(id)))) {
    errors.push("recommended debe ser una lista de hasta 3 IDs de entradas.");
  }
  if (covers && (!ID_RE.test(covers.es || "") || (covers.en && !ID_RE.test(covers.en)))) {
    errors.push("covers.es / covers.en deben ser IDs de asset de Contentful.");
  }
  if (entryId !== undefined && !ID_RE.test(entryId)) errors.push("entryId no válido.");
  if (errors.length) {
    return jsonResponse(422, { error: "El artículo no cumple la plantilla.", details: errors });
  }

  try {
    const contentful = await saveBlogDraft({
      es: { ...versions.es, richTextBody: blocksToRichText(versions.es.body) },
      en: { ...versions.en, richTextBody: blocksToRichText(versions.en.body) },
      covers,
      entryId,
      recommended,
    });
    return jsonResponse(200, {
      ok: true,
      title: versions.es.title,
      titleEn: versions.en.title,
      excerpt: versions.es.excerpt,
      ...draftSummary(versions.es),
      contentful,
    });
  } catch (error) {
    return jsonResponse(502, {
      error: `Falló al guardar el borrador en Contentful: ${contentfulErrorMessage(error)}`,
    });
  }
};

export const config = {
  path: "/api/blog-draft",
};
