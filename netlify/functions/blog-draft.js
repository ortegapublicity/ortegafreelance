// Netlify Function: recibe un artículo YA ESCRITO (por la sesión de Claude
// Code del propio Raúl, con su suscripción) y lo crea como BORRADOR en
// Contentful. No llama a ninguna IA, así que no gasta cuota ni necesita
// claves de modelos.
//
// Lo usan:
//   - .claude/scripts/blog-borrador.mjs (skill /bitacora), que lee la frase
//     de administración del Llavero de macOS sin mostrarla.
//   - /admin-blog, pestaña «Pegar artículo de Claude».
//
// Variables de entorno (las mismas que generate-article.js, ya en Netlify):
//   BLOG_ADMIN_SECRET, CONTENTFUL_SPACE_ID, CONTENTFUL_MANAGEMENT_TOKEN,
//   CONTENTFUL_ENVIRONMENT_ID (opcional), CONTENTFUL_BLOG_POST_TYPE (opcional)
//
// Nunca publica: la entrada queda en borrador y Raúl la revisa y publica en
// Contentful (00-CONSTITUCION.md: no se publican datos de clientes sin permiso).

import { timingSafeEqual } from "node:crypto";
import { blocksToRichText } from "./lib/richText.js";
import { createDraftBlogEntry } from "./lib/contentful.js";
import { validateArticleDraft, draftSummary } from "./lib/articleDraft.js";

const MAX_BODY_BYTES = 200_000;

const jsonResponse = (status, body) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });

function sameSecret(given, expected) {
  const a = Buffer.from(String(given ?? ""));
  const b = Buffer.from(String(expected));
  return a.length === b.length && timingSafeEqual(a, b);
}

export default async (req) => {
  if (req.method !== "POST") {
    return jsonResponse(405, { error: "Método no permitido." });
  }

  const adminSecret = process.env.BLOG_ADMIN_SECRET;
  if (!adminSecret) {
    return jsonResponse(500, {
      error: "Falta BLOG_ADMIN_SECRET en las variables de entorno de la función.",
    });
  }
  if (!sameSecret(req.headers.get("x-admin-secret"), adminSecret)) {
    return jsonResponse(401, { error: "No autorizado." });
  }

  const raw = await req.text();
  if (raw.length > MAX_BODY_BYTES) {
    return jsonResponse(413, { error: "El artículo es demasiado grande." });
  }

  let payload;
  try {
    payload = JSON.parse(raw);
  } catch {
    return jsonResponse(400, { error: "Body inválido, se esperaba JSON." });
  }

  const check = validateArticleDraft(payload);
  if (!check.ok) {
    return jsonResponse(422, { error: "El artículo no cumple la plantilla.", details: check.errors });
  }
  const { article } = check;

  try {
    const contentful = await createDraftBlogEntry({
      title: article.title,
      richTextBody: blocksToRichText(article.body),
    });
    return jsonResponse(200, {
      ok: true,
      title: article.title,
      excerpt: article.excerpt,
      ...draftSummary(article),
      contentful,
    });
  } catch (error) {
    return jsonResponse(502, {
      error: `Falló al crear el borrador en Contentful: ${error.message}`,
    });
  }
};

export const config = {
  path: "/api/blog-draft",
};
