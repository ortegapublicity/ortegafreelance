#!/usr/bin/env node
// Genera las portadas ES y EN (1680×945, JPG) de un borrador de la bitácora.
//
//   node .claude/scripts/portada-blog.mjs <borrador.json>
//
// El borrador debe traer, además de title/excerpt/body, un objeto "cover":
//   {
//     "title_en": "English title",
//     "steps": [ { "icon": "correo", "es": "RECIBIR", "en": "RECEIVE" }, … ],  // 3–5
//     "chips": [ { "step": 2, "text": "Resend" } ],                          // 0–3, opcional
//     "stepWord": { "es": "PASO", "en": "STEP" }                               // opcional
//   }
// Iconos: ver ICONS más abajo (mismos que portada-blog.html).
//
// Salida: contenido-blog/<nombre-del-borrador>/portada-es.jpg y portada-en.jpg,
// más LEEME.txt. La carpeta no se sube a git (repo público). Imprime la ruta
// en una línea «Imágenes: …» para que la bitácora la muestre siempre.

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

export const ICONS = [
  "anuncio", "pagina", "pago", "descarga", "correo", "calendario", "grafico", "codigo",
  "movil", "rayo", "escudo", "archivo", "usuario", "buscar", "carrito", "editar", "check",
];

const BLOG_REPO = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const TEMPLATE = join(BLOG_REPO, ".claude/scripts/portada-blog.html");
const OUT_ROOT = join(BLOG_REPO, "contenido-blog");
const CHROME = process.env.CHROME_BIN || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const LABEL_MAX = 14;

const SVG_MAX = 60000;

/**
 * Ilustración propia del post: el CONTENIDO de un <svg viewBox="0 0 1008 945">
 * (sin la etiqueta <svg>). Se rechaza todo lo que pueda ejecutar código o
 * cargar recursos externos: la portada se renderiza en Chrome local.
 */
export function svgProblems(svg) {
  const errors = [];
  if (typeof svg !== "string" || svg.length < 200) return ["cover.svg está vacío o es demasiado corto."];
  if (svg.length > SVG_MAX) errors.push(`cover.svg pasa de ${SVG_MAX} caracteres.`);
  if (/<\s*(script|foreignObject|iframe|image|style|a|svg)\b/i.test(svg))
    errors.push("cover.svg no puede llevar <script>, <foreignObject>, <iframe>, <image>, <style>, <a> ni otro <svg>.");
  if (/\son[a-z]+\s*=/i.test(svg)) errors.push("cover.svg no puede llevar atributos on…=.");
  if (/javascript:|https?:\/\/(?!www\.w3\.org)|href\s*=\s*["'](?!#)/i.test(svg))
    errors.push("cover.svg solo puede enlazar a sus propios ids (href=\"#…\"), sin URLs.");
  return errors;
}

export function validateCover(cover) {
  const errors = [];
  if (!cover || typeof cover !== "object") return ['Falta "cover" (datos de la portada).'];
  // Con ilustración propia, los pasos sobran: solo se valida el SVG.
  if (cover.svg !== undefined) {
    if (typeof cover.title_en !== "string" || !cover.title_en.trim()) errors.push('cover: falta "title_en".');
    return [...errors, ...svgProblems(cover.svg)];
  }
  if (typeof cover.title_en !== "string" || !cover.title_en.trim()) errors.push('cover: falta "title_en".');
  else if (cover.title_en.length > 110) errors.push("cover.title_en pasa de 110 caracteres.");
  const steps = Array.isArray(cover.steps) ? cover.steps : [];
  if (steps.length < 3 || steps.length > 5) errors.push("cover.steps necesita entre 3 y 5 pasos.");
  steps.forEach((s, i) => {
    if (!ICONS.includes(s?.icon)) errors.push(`cover.steps[${i}].icon no válido (${s?.icon}). Usa: ${ICONS.join(", ")}.`);
    for (const l of ["es", "en"]) {
      if (typeof s?.[l] !== "string" || !s[l].trim()) errors.push(`cover.steps[${i}] sin texto "${l}".`);
      else if (s[l].length > LABEL_MAX) errors.push(`cover.steps[${i}].${l} pasa de ${LABEL_MAX} caracteres.`);
    }
  });
  const chips = cover.chips ?? [];
  if (!Array.isArray(chips) || chips.length > 3) errors.push("cover.chips: máximo 3.");
  else chips.forEach((c, i) => {
    if (!Number.isInteger(c?.step) || c.step < 1 || c.step > steps.length) errors.push(`cover.chips[${i}].step fuera de rango.`);
    if (typeof c?.text !== "string" || !c.text.trim() || c.text.length > 12) errors.push(`cover.chips[${i}].text vacío o de más de 12 caracteres.`);
  });
  return errors;
}

export function renderCovers(draftFile) {
  const draft = JSON.parse(readFileSync(draftFile, "utf8"));
  // El título inglés de la versión "en" manda sobre cover.title_en.
  if (draft.cover && draft.en?.title) draft.cover.title_en = draft.en.title;
  const errors = validateCover(draft.cover);
  if (errors.length) throw new Error(`Portada no válida:\n  - ${errors.join("\n  - ")}`);
  if (!existsSync(CHROME)) throw new Error(`No encuentro Chrome en ${CHROME}.`);

  const outDir = join(OUT_ROOT, basename(draftFile).replace(/\.json$/i, ""));
  mkdirSync(outDir, { recursive: true });
  const data = {
    title: { es: draft.title, en: draft.cover.title_en },
    steps: draft.cover.steps || [],
    svg: draft.cover.svg,
    chips: draft.cover.chips || [],
    stepWord: draft.cover.stepWord,
  };
  const hash = encodeURIComponent(JSON.stringify(data));
  const profile = mkdtempSync(join(tmpdir(), "portada-chrome-"));
  const files = [];
  try {
    // Copia de la plantilla con el isotipo incrustado (ver __ISOTIPO__).
    const isotipo = readFileSync(join(BLOG_REPO, "src/assets/img/logo/favicon.png")).toString("base64");
    const page = join(profile, "portada.html");
    writeFileSync(page, readFileSync(TEMPLATE, "utf8").replaceAll("__ISOTIPO__", `data:image/png;base64,${isotipo}`));
    for (const lang of ["es", "en"]) {
      const png = join(profile, `${lang}.png`);
      const url = `${pathToFileURL(page).href}?lang=${lang}#${hash}`;
      execFileSync(CHROME, [
        "--headless=new", "--disable-gpu", "--hide-scrollbars", "--no-first-run",
        `--user-data-dir=${profile}`, "--window-size=1680,945", "--force-device-scale-factor=1",
        "--virtual-time-budget=10000", `--screenshot=${png}`, url,
      ], { stdio: "ignore", timeout: 60000 });
      const jpg = join(outDir, `portada-${lang}.jpg`);
      execFileSync("sips", ["-s", "format", "jpeg", "-s", "formatOptions", "86", png, "--out", jpg], { stdio: "ignore" });
      files.push(jpg);
    }
  } finally {
    rmSync(profile, { recursive: true, force: true });
  }

  writeFileSync(
    join(outDir, "LEEME.txt"),
    [
      `Portadas del post (1680×945): súbelas como imagen destacada en Contentful.`,
      ``,
      `ES: ${draft.title}`,
      `    portada-es.jpg`,
      `EN: ${draft.cover.title_en}`,
      `    portada-en.jpg`,
      ``,
      `Borrador: ${draftFile}`,
      ``,
    ].join("\n")
  );
  return { outDir, files };
}

// Uso directo por línea de comandos
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const file = process.argv[2];
  if (!file) {
    console.error("Uso: node .claude/scripts/portada-blog.mjs <borrador.json>");
    process.exit(64);
  }
  try {
    const { outDir } = renderCovers(resolve(file));
    console.log(`Imágenes: ${pathToFileURL(outDir).href}`);
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }
}
