#!/usr/bin/env node
// Carrusel para Instagram y Facebook (Meta) de un post de la bitácora.
//
//   node .claude/scripts/carrusel-meta.mjs <borrador.json>
//
// Lee el bloque "meta" del borrador (ver .claude/docs/plantilla-blog.md,
// sección «Instagram y Facebook»), exporta cada diapositiva a JPG 1080×1350
// con Chrome headless desde carrusel-meta.html y deja en
// contenido-blog/<borrador>/meta/:
//   slide-1.jpg … slide-N.jpg, caption.txt y meta.html (para publicar a mano:
//   copiar el texto, descargar las imágenes y los textos alternativos).
//
// Formato del bloque:
//   meta: {
//     tendencia: { tema, por_que, fuente },          // de dónde sale el gancho
//     slides: [ { tipo: "gancho", titulo, texto, svg },
//               { tipo: "punto", titulo, texto }, …,
//               { tipo: "cierre", titulo, texto, boton: "Mis Blogs" } ],
//     caption: "…",                                   // texto del post, SEO
//     hashtags: ["…"],
//     alt: ["…", …]                                   // texto alternativo por diapositiva
//   }

import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { svgProblems } from "./portada-blog.mjs";

const BLOG_REPO = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const TEMPLATE = join(BLOG_REPO, ".claude/scripts/carrusel-meta.html");
const OUT_ROOT = join(process.env.BITACORA_DATOS || BLOG_REPO, "contenido-blog");
const CHROME = process.env.CHROME_BIN || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

export const META_LIMITS = { slidesMin: 3, slidesMax: 7, captionMin: 300, captionMax: 2200, firstLineMax: 125, tagsMin: 3, tagsMax: 8 };

/** Errores del bloque "meta" del borrador. */
export function validateMeta(meta) {
  if (!meta || typeof meta !== "object") return ['Falta "meta" (carrusel para Instagram/Facebook).'];
  const errors = [];
  const t = meta.tendencia || {};
  if (!t.tema || !t.por_que) errors.push("meta.tendencia: falta tema o por_que (qué tendencia usas y por qué conecta con el post).");
  const slides = Array.isArray(meta.slides) ? meta.slides : [];
  if (slides.length < META_LIMITS.slidesMin || slides.length > META_LIMITS.slidesMax)
    errors.push(`meta.slides: entre ${META_LIMITS.slidesMin} y ${META_LIMITS.slidesMax} diapositivas.`);
  if (slides[0]?.tipo !== "gancho") errors.push('meta.slides: la primera es de tipo "gancho".');
  if (slides[slides.length - 1]?.tipo !== "cierre") errors.push('meta.slides: la última es de tipo "cierre".');
  slides.forEach((s, i) => {
    if (!["gancho", "punto", "cierre"].includes(s?.tipo)) errors.push(`meta.slides[${i}]: tipo no válido.`);
    if (!s?.titulo || s.titulo.length > 90) errors.push(`meta.slides[${i}]: titulo vacío o de más de 90 caracteres.`);
    if (s?.texto && s.texto.length > 220) errors.push(`meta.slides[${i}]: texto de más de 220 caracteres.`);
    if (s?.tipo === "gancho") errors.push(...svgProblems(s.svg).map((e) => `meta.slides[${i}]: ${e.replace("cover.svg", "svg")}`));
    if (/https?:\/\/|www\./i.test(`${s?.titulo} ${s?.texto}`)) errors.push(`meta.slides[${i}]: sin enlaces en las imágenes.`);
  });
  const c = typeof meta.caption === "string" ? meta.caption.trim() : "";
  if (c.length < META_LIMITS.captionMin || c.length > META_LIMITS.captionMax)
    errors.push(`meta.caption: ${c.length} caracteres; entre ${META_LIMITS.captionMin} y ${META_LIMITS.captionMax}.`);
  if ((c.split("\n")[0] || "").length > META_LIMITS.firstLineMax)
    errors.push(`meta.caption: la primera línea pasa de ${META_LIMITS.firstLineMax} caracteres (es lo que se ve antes de «más»).`);
  if (!/Mis Blogs/.test(c)) errors.push('meta.caption: la llamada a la acción tiene que llevar a «Mis Blogs» (enlace del perfil).');
  if (/https?:\/\/|www\./i.test(c)) errors.push("meta.caption: sin enlaces (en Instagram no son clicables); se manda al perfil.");
  if (/#\w/.test(c)) errors.push('meta.caption: sin hashtags en el texto; van en "hashtags".');
  const tags = Array.isArray(meta.hashtags) ? meta.hashtags : [];
  if (tags.length < META_LIMITS.tagsMin || tags.length > META_LIMITS.tagsMax || !tags.every((h) => /^[\p{L}\p{N}]{2,30}$/u.test(h)))
    errors.push(`meta.hashtags: ${META_LIMITS.tagsMin}–${META_LIMITS.tagsMax}, solo letras y números, sin #.`);
  if (!Array.isArray(meta.alt) || meta.alt.length !== slides.length || meta.alt.some((a) => !a || a.length > 300))
    errors.push("meta.alt: un texto alternativo (máx. 300 caracteres) por diapositiva.");
  return errors;
}

export const metaCaption = (meta) => `${meta.caption.trim()}\n\n${meta.hashtags.map((h) => `#${h}`).join(" ")}`;

function writeHelper(dir, draft, files) {
  const meta = draft.meta;
  const caption = metaCaption(meta);
  writeFileSync(join(dir, "caption.txt"), caption + "\n");
  const data = JSON.stringify({ caption, alt: meta.alt }).replace(/</g, "\\u003c");
  writeFileSync(
    join(dir, "meta.html"),
    `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><title>Instagram/Facebook · ${draft.title.replace(/[<&]/g, "")}</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  body { margin: 0; padding: 32px 16px; background: #f4f6fa; color: #1e2a47; font: 16px/1.55 -apple-system, "Inter", sans-serif; }
  main { max-width: 900px; margin: 0 auto; } h1 { font-size: 22px; margin: 0 0 6px; }
  h2 { font-size: 15px; text-transform: uppercase; letter-spacing: .05em; color: #4a6fa5; margin: 28px 0 8px; }
  p, ol { color: #5f6b7a; } pre { white-space: pre-wrap; background: #fff; border: 1px solid #e6e9ef; border-radius: 14px; padding: 18px; font: inherit; color: #1e2a47; }
  button { margin: 0 8px 8px 0; padding: 10px 18px; border-radius: 999px; border: 0; background: #1e2a47; color: #fff; font: inherit; font-weight: 600; cursor: pointer; }
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 14px; }
  figure { margin: 0; background: #fff; border: 1px solid #e6e9ef; border-radius: 14px; padding: 10px; }
  figure img { width: 100%; border-radius: 8px; display: block; } figcaption { font-size: 13px; color: #5f6b7a; margin-top: 8px; }
</style></head><body><main>
<h1>${draft.title.replace(/[<&]/g, "")}</h1>
<p>Carrusel para Instagram y Facebook. Tendencia usada: <b>${String(meta.tendencia.tema).replace(/[<&]/g, "")}</b>. ${String(meta.tendencia.por_que).replace(/[<&]/g, "")}</p>
<ol><li>En Instagram, crea una publicación y elige las ${files.length} imágenes <b>en orden</b> (slide-1, slide-2…).</li>
<li>Pega el texto (botón de abajo).</li><li>En «Configuración avanzada → Accesibilidad», pega el texto alternativo de cada imagen.</li>
<li>Activa «Compartir también en Facebook», o publícalo en tu página con el mismo texto.</li>
<li>Comprueba que tu perfil tiene el enlace «Mis Blogs» → https://ortegafreelance.com/all-blog</li></ol>
<h2>Texto</h2><pre id="cap"></pre><button id="copy">Copiar texto</button>
<h2>Imágenes</h2><div class="grid">${files
      .map((f, i) => `<figure><a href="${basename(f)}" download><img src="${basename(f)}" alt=""></a><figcaption>${i + 1}. <span data-alt="${i}"></span> <button data-copyalt="${i}">Copiar alt</button></figcaption></figure>`)
      .join("")}</div>
</main><script>
const D = ${data};
document.getElementById("cap").textContent = D.caption;
for (const s of document.querySelectorAll("[data-alt]")) s.textContent = D.alt[s.dataset.alt];
async function copy(t) { try { await navigator.clipboard.writeText(t); } catch { const a = document.createElement("textarea"); a.value = t; document.body.appendChild(a); a.select(); document.execCommand("copy"); a.remove(); } }
document.getElementById("copy").onclick = async (e) => { await copy(D.caption); e.target.textContent = "Copiado"; setTimeout(() => (e.target.textContent = "Copiar texto"), 1500); };
for (const b of document.querySelectorAll("[data-copyalt]")) b.onclick = async () => { await copy(D.alt[b.dataset.copyalt]); b.textContent = "Copiado"; setTimeout(() => (b.textContent = "Copiar alt"), 1500); };
</script></body></html>
`
  );
}

export function renderCarousel(draftFile) {
  const draft = JSON.parse(readFileSync(draftFile, "utf8"));
  const errors = validateMeta(draft.meta);
  if (errors.length) throw new Error(`Carrusel no válido:\n  - ${errors.join("\n  - ")}`);
  const dir = join(OUT_ROOT, basename(draftFile).replace(/\.json$/i, ""), "meta");
  mkdirSync(dir, { recursive: true });
  const profile = mkdtempSync(join(tmpdir(), "carrusel-chrome-"));
  const files = [];
  try {
    const isotipo = readFileSync(join(BLOG_REPO, "src/assets/img/logo/favicon.png")).toString("base64");
    const page = join(profile, "slide.html");
    writeFileSync(page, readFileSync(TEMPLATE, "utf8").replaceAll("__ISOTIPO__", `data:image/png;base64,${isotipo}`));
    const slides = draft.meta.slides;
    slides.forEach((s, i) => {
      const png = join(profile, `s${i + 1}.png`);
      const url = `${pathToFileURL(page).href}?n=${i + 1}&total=${slides.length}#${encodeURIComponent(JSON.stringify({ ...s, numero: i }))}`;
      execFileSync(CHROME, [
        "--headless=new", "--disable-gpu", "--hide-scrollbars", "--no-first-run", `--user-data-dir=${profile}`,
        "--window-size=1080,1350", "--force-device-scale-factor=1", "--virtual-time-budget=10000", `--screenshot=${png}`, url,
      ], { stdio: "ignore", timeout: 60000 });
      const jpg = join(dir, `slide-${i + 1}.jpg`);
      execFileSync("sips", ["-s", "format", "jpeg", "-s", "formatOptions", "88", png, "--out", jpg], { stdio: "ignore" });
      files.push(jpg);
    });
  } finally {
    rmSync(profile, { recursive: true, force: true });
  }
  writeHelper(dir, draft, files);
  return { dir, files };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const file = process.argv[2];
  if (!file) {
    console.error("Uso: node .claude/scripts/carrusel-meta.mjs <borrador.json>");
    process.exit(64);
  }
  try {
    const { dir, files } = renderCarousel(resolve(file));
    console.log(`Carrusel (${files.length} imágenes): ${pathToFileURL(join(dir, "meta.html")).href}`);
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }
}
