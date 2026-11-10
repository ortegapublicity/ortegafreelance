// Variedad de la bitácora: que los posts no salgan todos con el mismo molde.
//
// Nace de una corrección de Raúl (2026-11-10): cinco posts seguidos se
// titulaban «De X a Y: …», con la segunda sección «La regla: …» y el mismo
// cierre. Sus posts anteriores usan muchas fórmulas distintas (pregunta,
// «Cómo…», «Más allá de…», tesis, «El poder de…»). Este módulo clasifica cada
// título por su fórmula y rechaza las repeticiones, para que la regla de la
// plantilla (.claude/docs/plantilla-blog.md, «Variedad») se cumpla sola.
//
// Sin dependencias: lo importan bitacora-nocturna.mjs y blog-borrador.mjs.

import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const plain = (s = "") => s.trim().toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

/** Nombre legible de cada fórmula, para los mensajes y el prompt. */
export const FAMILIES = {
  "de-a": "«De X a Y» / «From X to Y»",
  pregunta: "pregunta («¿Es momento de…?»)",
  "mas-alla": "«Más allá de…» / «Beyond…»",
  como: "«Cómo…» / «How…»",
  "por-que": "«Por qué…» / «Why…»",
  numero: "empieza con un número («3 decisiones…»)",
  "el-poder": "«El poder de…» / «The power of…»",
  "tema-como": "«Tema: cómo…»",
  "tema-dos-puntos": "«Tema: desarrollo»",
  afirmacion: "afirmación o tesis sin dos puntos",
};

// Fórmulas concretas: no se repiten en los 2 posts anteriores. Las dos
// últimas de FAMILIES son cajones amplios y sí pueden repetirse.
const SPECIFIC = new Set(["pregunta", "mas-alla", "como", "por-que", "numero", "el-poder", "tema-como"]);
// «De X a Y» se gastó: como mucho una vez cada 6 posts.
const DE_A_WINDOW = 6;

export function titleFamily(title = "") {
  const t = plain(title);
  const head = `${t.split(/[:?]/)[0]} `;
  if (/^(de|del|desde)\s.+\s(a|al|hasta)\s/.test(head) || /^from\s.+\sto\s/.test(head)) return "de-a";
  if (title.trim().startsWith("¿") || /^(is|are|can|should|do|does|what|when|who|where)\b[^:]*\?/.test(t)) return "pregunta";
  if (/^(mas alla|beyond)\b/.test(t)) return "mas-alla";
  if (/^(como|how)\b/.test(t)) return "como";
  if (/^(por que|why)\b/.test(t)) return "por-que";
  if (/^\d/.test(t)) return "numero";
  if (/^(el poder|the power)\b/.test(t)) return "el-poder";
  if (/:\s*(como|how)\b/.test(t)) return "tema-como";
  if (t.includes(":")) return "tema-dos-puntos";
  return "afirmacion";
}

/** Fórmulas que el próximo título NO puede usar, dadas los títulos recientes (del más nuevo al más viejo). */
export function bannedFamilies(recentTitles = []) {
  const fams = recentTitles.map(titleFamily);
  const banned = new Set(fams.slice(0, 2).filter((f) => SPECIFIC.has(f)));
  if (fams.slice(0, DE_A_WINDOW).includes("de-a")) banned.add("de-a");
  return [...banned];
}

// Frases y encabezados ya gastados en los posts de la bitácora.
const WORN_HEADINGS = [[/^la regla\s*:/, "«La regla: …»"], [/^the rule\s*:/, "«The rule: …»"]];
const WORN_PHRASES = [
  [/ahi es donde empezaria a (auditar|revisar)/, "«ahí es donde empezaría a auditar/revisar»"],
  [/that'?s where i'?d start (auditing|looking)/, "«that's where I'd start auditing/looking»"],
];

const blocksText = (body = []) => body.flatMap((b) => (b.items ? b.items : [b.text || ""]));

/**
 * Errores de variedad de un borrador frente a lo reciente.
 *   recentTitles: títulos en español, del más nuevo al más viejo.
 *   recentDrafts: borradores locales recientes (con body), del más nuevo al más viejo.
 */
export function varietyProblems(draft, { recentTitles = [], recentDrafts = [] } = {}) {
  const errors = [];
  const banned = bannedFamilies(recentTitles);
  for (const [lang, title] of [["es", draft.title], ["en", draft.en?.title]]) {
    if (!title) continue;
    const fam = titleFamily(title);
    if (banned.includes(fam)) {
      errors.push(
        `[${lang}] El título usa la fórmula ${FAMILIES[fam]}, repetida en los posts recientes. Usa otra: ` +
          Object.keys(FAMILIES).filter((f) => !banned.includes(f)).map((f) => FAMILIES[f]).join("; ") + "."
      );
    }
  }

  const headings = (d) => (d.body || []).filter((b) => b.type === "heading").map((b) => plain(b.text));
  const recentHeadings = recentDrafts.slice(0, 3).flatMap(headings);
  for (const [lang, d] of [["es", draft], ["en", draft.en || {}]]) {
    for (const h of headings(d)) {
      for (const [re, label] of WORN_HEADINGS) {
        if (re.test(h) && recentHeadings.some((x) => re.test(x))) {
          errors.push(`[${lang}] La sección ${label} ya salió en los posts recientes: titula esa sección de otra forma.`);
        }
      }
    }
    const text = plain(blocksText(d.body).join(" "));
    for (const [re, label] of WORN_PHRASES) {
      if (re.test(text)) errors.push(`[${lang}] El cierre ${label} está gastado: cierra de otra manera.`);
    }
  }
  return errors;
}

/** Borradores locales (objetos con title/body), del más nuevo al más viejo. */
export function localDrafts(draftsDir, excludeFile = "") {
  if (!existsSync(draftsDir)) return [];
  return readdirSync(draftsDir)
    .filter((f) => f.endsWith(".json") && !f.endsWith(".contentful.json") && join(draftsDir, f) !== excludeFile)
    .sort()
    .reverse()
    .map((f) => {
      try {
        return JSON.parse(readFileSync(join(draftsDir, f), "utf8"));
      } catch {
        return null;
      }
    })
    .filter((d) => d?.title);
}

/** Títulos recientes sin duplicados: primero los borradores locales, luego los publicados. */
export function mergeRecentTitles(drafts = [], publishedTitles = []) {
  const seen = new Set();
  return [...drafts.map((d) => d.title), ...publishedTitles].filter((t) => {
    const k = plain(t);
    if (!k || seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}
