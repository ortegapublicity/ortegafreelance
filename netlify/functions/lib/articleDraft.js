// Validación del artículo YA ESCRITO que llega a /api/blog-draft.
//
// Sin dependencias a propósito: la importan la función de Netlify y el script
// local .claude/scripts/blog-borrador.mjs, para que ambos apliquen las mismas
// reglas y un borrador que pasa en local no lo rechace el servidor.
//
// El formato de bloques es el mismo que entiende lib/richText.js:
//   { type: "paragraph", text }
//   { type: "heading", level: 2|3, text }   → forma el índice del post
//   { type: "bulletList", items: [...] }
//   { type: "quote", text }

export const LIMITS = {
  titleMax: 110,
  excerptMax: 320,
  blocksMin: 4,
  blocksMax: 60,
  textMax: 4000,
  itemsMax: 12,
  headingsMin: 2,
};

const BLOCK_TYPES = new Set(["paragraph", "heading", "bulletList", "quote"]);

const isText = (v) => typeof v === "string" && v.trim().length > 0;

/**
 * Devuelve { ok: true, article } con el artículo normalizado, o
 * { ok: false, errors: [...] } con todos los problemas a la vez (así quien lo
 * escribió corrige en una sola pasada).
 */
export function validateArticleDraft(input) {
  const errors = [];
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return { ok: false, errors: ["Se esperaba un objeto JSON con title y body."] };
  }

  const title = isText(input.title) ? input.title.trim() : "";
  const excerpt = isText(input.excerpt) ? input.excerpt.trim() : "";

  if (!title) errors.push('Falta "title".');
  else if (title.length > LIMITS.titleMax)
    errors.push(`"title" pasa de ${LIMITS.titleMax} caracteres (${title.length}).`);

  if (excerpt.length > LIMITS.excerptMax)
    errors.push(`"excerpt" pasa de ${LIMITS.excerptMax} caracteres.`);

  if (!Array.isArray(input.body)) {
    errors.push('Falta "body" (array de bloques).');
    return { ok: false, errors };
  }

  const body = [];
  input.body.forEach((block, i) => {
    const where = `body[${i}]`;
    if (!block || !BLOCK_TYPES.has(block.type)) {
      errors.push(`${where}: tipo no válido (${block?.type}). Usa paragraph, heading, bulletList o quote.`);
      return;
    }
    if (block.type === "bulletList") {
      const items = Array.isArray(block.items) ? block.items.filter(isText) : [];
      if (items.length === 0) errors.push(`${where}: la lista no tiene elementos.`);
      if (items.length > LIMITS.itemsMax) errors.push(`${where}: más de ${LIMITS.itemsMax} elementos.`);
      if (items.some((t) => t.length > LIMITS.textMax)) errors.push(`${where}: un elemento es demasiado largo.`);
      body.push({ type: "bulletList", items: items.map((t) => t.trim()) });
      return;
    }
    if (!isText(block.text)) {
      errors.push(`${where}: falta "text".`);
      return;
    }
    if (block.text.length > LIMITS.textMax) errors.push(`${where}: texto demasiado largo.`);
    if (block.type === "heading") {
      body.push({ type: "heading", level: block.level === 2 ? 2 : 3, text: block.text.trim() });
    } else {
      body.push({ type: block.type, text: block.text.trim() });
    }
  });

  if (body.length < LIMITS.blocksMin) errors.push(`"body" necesita al menos ${LIMITS.blocksMin} bloques.`);
  if (body.length > LIMITS.blocksMax) errors.push(`"body" pasa de ${LIMITS.blocksMax} bloques.`);

  const headings = body.filter((b) => b.type === "heading");
  if (headings.length < LIMITS.headingsMin)
    errors.push(`Hacen falta al menos ${LIMITS.headingsMin} títulos de sección: forman el índice del post.`);
  if (headings[0] && headings[0].text.toLowerCase() === title.toLowerCase())
    errors.push("El primer título de sección repite el título del post.");

  // El iframe en un párrafo se renderiza como HTML en BlogDetails.jsx: aquí no
  // se acepta, para que un borrador nunca pueda inyectar HTML en la página.
  const allText = body.flatMap((b) => (b.items ? b.items : [b.text])).join("\n");
  if (/<\s*(iframe|script|style|img|a)\b/i.test(allText))
    errors.push("El texto contiene etiquetas HTML; usa solo texto con **negrita** y *cursiva*.");

  if (errors.length) return { ok: false, errors };
  return { ok: true, article: { title, excerpt, body } };
}

/** Datos para la vista previa: índice y minutos de lectura (≈200 palabras/min). */
export function draftSummary(article) {
  const words = article.body
    .flatMap((b) => (b.items ? b.items : [b.text]))
    .join(" ")
    .split(/\s+/)
    .filter(Boolean).length;
  return {
    words,
    readingMinutes: Math.max(1, Math.round(words / 200)),
    toc: article.body.filter((b) => b.type === "heading").map((b) => b.text),
  };
}
