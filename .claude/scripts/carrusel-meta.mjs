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

import { execFileSync, spawn, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { cpus, homedir, tmpdir } from "node:os";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { svgProblems } from "./portada-blog.mjs";
import { CONFIG } from "./redes-agenda.mjs";

const BLOG_REPO = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const TEMPLATE = join(BLOG_REPO, ".claude/scripts/carrusel-meta.html");
const STORY_TEMPLATE = join(BLOG_REPO, ".claude/scripts/historia-meta.html");
const REEL_BG = join(BLOG_REPO, ".claude/scripts/reel-fondo.html");
const FFMPEG = process.env.FFMPEG_BIN || ["/opt/homebrew/bin/ffmpeg", "/usr/local/bin/ffmpeg"].find((f) => existsSync(f)) || "ffmpeg";
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

/**
 * Historia de Instagram (1080×1920) del post: portada + título + extracto y
 * el botón hacia «Mis Blogs». Sirve también para los posts sin carrusel.
 * Deja contenido-blog/<borrador>/meta/historia.jpg.
 */
export function renderStory(draftFile, { enlace = false } = {}) {
  const draft = JSON.parse(readFileSync(draftFile, "utf8"));
  const name = basename(draftFile).replace(/\.json$/i, "");
  const dir = join(OUT_ROOT, name, "meta");
  mkdirSync(dir, { recursive: true });
  const profile = mkdtempSync(join(tmpdir(), "historia-chrome-"));
  const jpg = join(dir, "historia.jpg");
  try {
    const dataUri = (file, type) => (existsSync(file) ? `data:${type};base64,${readFileSync(file).toString("base64")}` : "");
    const page = join(profile, "historia.html");
    writeFileSync(
      page,
      readFileSync(STORY_TEMPLATE, "utf8")
        .replaceAll("__ISOTIPO__", dataUri(join(BLOG_REPO, "src/assets/img/logo/favicon.png"), "image/png"))
        .replaceAll("__PORTADA__", dataUri(join(OUT_ROOT, name, "portada-es.jpg"), "image/jpeg"))
    );
    const cut = (t, n) => (t.length > n ? t.slice(0, n - 1).replace(/\s+\S*$/, "").replace(/[.,;:]+$/, "") + "…" : t);
    // El extracto, salvo que repita el gancho (mismas primeras palabras): entonces
    // su segunda frase, o nada.
    const textoHistoria = (g, ex) => {
      const norm = (t) => t.toLowerCase().normalize("NFD").replace(/[^a-z0-9 ]/g, "").split(/\s+/).slice(0, 4).join(" ");
      if (!g || norm(g) !== norm(ex)) return cut(ex, 150);
      const resto = ex.split(/(?<=[.!?])\s+/).slice(1).join(" ");
      return resto ? cut(resto, 150) : "";
    };
    // La portada ya lleva el título del post: el texto grande es el gancho
    // (primera línea del caption de LinkedIn, que habla del dolor del lector).
    const gancho = String(draft.linkedin?.es || "").split("\n")[0].trim();
    const data = {
      etiqueta: "Nuevo en el blog",
      titulo: cut(gancho || draft.title, 110),
      texto: textoHistoria(gancho, draft.excerpt || ""),
      // Con enlace: el botón señala hacia abajo, donde va el sticker de enlace
      // que se pone a mano (la API de Instagram no publica stickers).
      boton: enlace ? "Toca el enlace de abajo" : "Léelo en «Mis Blogs»",
      flecha: enlace ? "↓" : "↗",
    };
    const png = join(profile, "historia.png");
    execFileSync(CHROME, [
      "--headless=new", "--disable-gpu", "--hide-scrollbars", "--no-first-run", `--user-data-dir=${profile}`,
      "--window-size=1080,1920", "--force-device-scale-factor=1", "--virtual-time-budget=10000", `--screenshot=${png}`,
      `${pathToFileURL(page).href}#${encodeURIComponent(JSON.stringify(data))}`,
    ], { stdio: "ignore", timeout: 60000 });
    execFileSync("sips", ["-s", "format", "jpeg", "-s", "formatOptions", "88", png, "--out", jpg], { stdio: "ignore" });
  } finally {
    rmSync(profile, { recursive: true, force: true });
  }
  return jpg;
}

// ---------- Música del reel ----------

/** Carpeta de música (instagram.musica en redes.config.json). */
export const carpetaMusica = () => CONFIG.instagram.musica.replace(/^~(?=\/)/, homedir());

/**
 * Pistas disponibles en la carpeta de música (mp3, m4a, aac, wav). Las que
 * iCloud dejó solo en la nube («.nombre.mp3.icloud») se piden con brctl y se
 * usan la próxima vez.
 */
export function pistasMusica() {
  const dir = carpetaMusica();
  if (!dir || !existsSync(dir)) return [];
  const out = [];
  for (const f of readdirSync(dir)) {
    const nube = f.match(/^\.(.+\.(mp3|m4a|aac|wav))\.icloud$/i);
    if (nube) {
      spawnSync("brctl", ["download", join(dir, nube[1])], { stdio: "ignore", timeout: 20000 });
      continue;
    }
    if (/\.(mp3|m4a|aac|wav)$/i.test(f) && !f.startsWith(".")) out.push(join(dir, f));
  }
  return out.sort();
}

/** Pista para un reel: estable por semilla y, si se puede, distinta de `evitar`. */
export function elegirPista(semilla, evitar = []) {
  const todas = pistasMusica();
  const libres = todas.filter((p) => !evitar.includes(basename(p)));
  const lista = libres.length ? libres : todas;
  if (!lista.length) return null;
  let h = 2166136261;
  for (const ch of String(semilla)) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return lista[(h >>> 0) % lista.length];
}

// ---------- Fotogramas con Chrome ----------

/** Fuentes de Google en data URI (una vez por máquina): sin red en cada fotograma. */
async function fuentesEnLinea() {
  const cache = join(tmpdir(), "carrusel-meta-fuentes.css");
  if (existsSync(cache)) return readFileSync(cache, "utf8");
  const ua = { "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36" };
  let css = await (await fetch("https://fonts.googleapis.com/css2?family=Exo+2:wght@600;700;800&family=Inter:wght@400;500;600;700&display=block", { headers: ua })).text();
  for (const url of [...new Set(css.match(/https:\/\/fonts\.gstatic\.com\/[^)]+/g) || [])])
    css = css.replaceAll(url, `data:font/woff2;base64,${Buffer.from(await (await fetch(url)).arrayBuffer()).toString("base64")}`);
  writeFileSync(cache, css);
  return css;
}

/** Captura cada trabajo { url, png } con varios Chrome a la vez y reintentos. */
async function capturar(trabajos, profile, size) {
  const workers = Math.max(2, Math.min(8, cpus().length - 1));
  let i = 0;
  const una = (w, j) =>
    new Promise((ok) => {
      const c = spawn(CHROME, [
        "--headless=new", "--disable-gpu", "--hide-scrollbars", "--no-first-run", `--user-data-dir=${join(profile, `chrome-${w}`)}`,
        `--window-size=${size}`, "--force-device-scale-factor=1", "--virtual-time-budget=3000", `--screenshot=${j.png}`, j.url,
      ], { stdio: "ignore" });
      const reloj = setTimeout(() => c.kill("SIGKILL"), 60000);
      c.on("close", () => { clearTimeout(reloj); ok(existsSync(j.png)); });
    });
  await Promise.all(
    Array.from({ length: workers }, async (_, w) => {
      for (let j = trabajos[i++]; j; j = trabajos[i++]) {
        let hecho = false;
        for (let intento = 1; intento <= 4 && !hecho; intento++) hecho = await una(w, j);
        if (!hecho) throw new Error(`Chrome no generó ${basename(j.png)} tras 4 intentos`);
      }
    })
  );
}

/**
 * Reel de Instagram (1080×1920, MP4 H.264, unos 17 s) a partir de las
 * diapositivas del carrusel, ANIMADAS: titulares palabra a palabra, textos que
 * suben, número y botón con rebote, ilustración que entra y respira (modo
 * ?reel=1&t= de carrusel-meta.html, un fotograma por instante a 30 fps).
 * Entre diapositivas, transiciones distintas (deslizar, círculo, barrido).
 * Música: una pista de la carpeta `instagram.musica` (rotando, con fundido y
 * volumen normalizado); sin pistas, audio en silencio y quien publique añade
 * la música en Instagram. Deja contenido-blog/<borrador>/meta/reel.mp4.
 * Devuelve { mp4, pista } (pista = nombre del archivo o null).
 */
export async function renderReel(draftFile, { pista = undefined, fps = 30, fundido = 0.5 } = {}) {
  const draft = JSON.parse(readFileSync(draftFile, "utf8"));
  const errors = validateMeta(draft.meta);
  if (errors.length) throw new Error(`Reel no válido (usa el carrusel):\n  - ${errors.join("\n  - ")}`);
  const name = basename(draftFile).replace(/\.json$/i, "");
  const dir = join(OUT_ROOT, name, "meta");
  mkdirSync(dir, { recursive: true });
  if (pista === undefined) pista = elegirPista(name);
  const profile = mkdtempSync(join(tmpdir(), "reel-"));
  const mp4 = join(dir, "reel.mp4");
  try {
    const iso = `data:image/png;base64,${readFileSync(join(BLOG_REPO, "src/assets/img/logo/favicon.png")).toString("base64")}`;
    const fuentes = await fuentesEnLinea().catch(() => "");
    let html = readFileSync(TEMPLATE, "utf8").replaceAll("__ISOTIPO__", iso);
    if (fuentes) html = html.replace(/<link href="https:\/\/fonts\.googleapis\.com[^>]*>/, `<style>${fuentes}</style>`);
    const slidePage = join(profile, "slide.html");
    writeFileSync(slidePage, html);

    const slides = draft.meta.slides;
    const n = slides.length;
    const dur = slides.map((sl) => (sl.tipo === "gancho" ? 4.2 : sl.tipo === "cierre" ? 4.0 : 3.6));
    const trabajos = [];
    slides.forEach((sl, i) => {
      mkdirSync(join(profile, `s${i}`));
      const frames = Math.round(dur[i] * fps);
      for (let f = 0; f < frames; f++) {
        trabajos.push({
          png: join(profile, `s${i}`, `${String(f).padStart(4, "0")}.png`),
          url: `${pathToFileURL(slidePage).href}?n=${i + 1}&total=${n}&reel=1&t=${(f / fps).toFixed(4)}#${encodeURIComponent(JSON.stringify({ ...sl, numero: i }))}`,
        });
      }
    });
    await capturar(trabajos, profile, "1080,1350");

    const page = join(profile, "fondo.html");
    writeFileSync(page, readFileSync(REEL_BG, "utf8").replaceAll("__ISOTIPO__", iso));
    const fondo = join(profile, "fondo.png");
    await capturar([{ png: fondo, url: pathToFileURL(page).href }], profile, "1080,1920");

    const total = dur.reduce((a, b) => a + b, 0) - (n - 1) * fundido;
    const inputs = ["-loop", "1", "-framerate", String(fps), "-i", fondo];
    slides.forEach((_, i) => inputs.push("-framerate", String(fps), "-i", join(profile, `s${i}`, "%04d.png")));
    if (pista) inputs.push("-stream_loop", "-1", "-i", pista);
    else inputs.push("-f", "lavfi", "-i", "anullsrc=r=44100:cl=stereo");
    const parts = [`[0:v]split=${n}${slides.map((_, i) => `[b${i}]`).join("")}`];
    slides.forEach((_, i) => parts.push(`[b${i}][${i + 1}:v]overlay=0:285:shortest=1,format=yuv420p,setsar=1,settb=1/${fps},setpts=PTS-STARTPTS[v${i}]`));
    const transiciones = ["slideleft", "circleopen", "smoothup", "wipeleft", "slideup", "radial"];
    let last = "v0";
    let offset = 0;
    for (let i = 1; i < n; i++) {
      offset += dur[i - 1] - fundido;
      const out = i === n - 1 ? "out" : `x${i}`;
      parts.push(`[${last}][v${i}]xfade=transition=${transiciones[(i - 1) % transiciones.length]}:duration=${fundido}:offset=${offset.toFixed(3)}[${out}]`);
      last = out;
    }
    if (n === 1) parts.push("[v0]copy[out]");
    const a = n + 1;
    parts.push(
      pista
        ? `[${a}:a]atrim=0:${total.toFixed(2)},asetpts=PTS-STARTPTS,afade=t=in:d=0.4,afade=t=out:st=${(total - 1.6).toFixed(2)}:d=1.6,loudnorm=I=-16:TP=-1.5:LRA=11,aresample=44100[aout]`
        : `[${a}:a]atrim=0:${total.toFixed(2)}[aout]`
    );
    execFileSync(FFMPEG, [
      "-y", "-hide_banner", "-loglevel", "error", ...inputs,
      "-filter_complex", parts.join(";"), "-map", "[out]", "-map", "[aout]",
      "-t", total.toFixed(2), "-r", String(fps), "-c:v", "libx264", "-profile:v", "high", "-preset", "medium", "-crf", "20",
      "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "160k", "-ar", "44100", "-movflags", "+faststart", mp4,
    ], { stdio: ["ignore", "ignore", "pipe"], timeout: 600000 });
  } finally {
    rmSync(profile, { recursive: true, force: true });
  }
  return { mp4, pista: pista ? basename(pista) : null };
}

/**
 * Publicación simple: la diapositiva del gancho sola, sin contador ni
 * «Desliza» (1080×1350). Deja contenido-blog/<borrador>/meta/imagen.jpg.
 */
export function renderImagen(draftFile) {
  const draft = JSON.parse(readFileSync(draftFile, "utf8"));
  const errors = validateMeta(draft.meta);
  if (errors.length) throw new Error(`Imagen no válida (usa el carrusel):\n  - ${errors.join("\n  - ")}`);
  const dir = join(OUT_ROOT, basename(draftFile).replace(/\.json$/i, ""), "meta");
  mkdirSync(dir, { recursive: true });
  const profile = mkdtempSync(join(tmpdir(), "imagen-chrome-"));
  const jpg = join(dir, "imagen.jpg");
  try {
    const iso = readFileSync(join(BLOG_REPO, "src/assets/img/logo/favicon.png")).toString("base64");
    const page = join(profile, "slide.html");
    writeFileSync(page, readFileSync(TEMPLATE, "utf8").replaceAll("__ISOTIPO__", `data:image/png;base64,${iso}`));
    const png = join(profile, "imagen.png");
    const sl = draft.meta.slides[0];
    execFileSync(CHROME, [
      "--headless=new", "--disable-gpu", "--hide-scrollbars", "--no-first-run", `--user-data-dir=${profile}`,
      "--window-size=1080,1350", "--force-device-scale-factor=1", "--virtual-time-budget=10000", `--screenshot=${png}`,
      `${pathToFileURL(page).href}?n=1&total=1&reel=1#${encodeURIComponent(JSON.stringify({ ...sl, numero: 0 }))}`,
    ], { stdio: "ignore", timeout: 60000 });
    execFileSync("sips", ["-s", "format", "jpeg", "-s", "formatOptions", "90", png, "--out", jpg], { stdio: "ignore" });
  } finally {
    rmSync(profile, { recursive: true, force: true });
  }
  return jpg;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (process.argv[2] === "--reel" && process.argv[3]) {
    const { mp4, pista } = await renderReel(resolve(process.argv[3]), process.argv.includes("--sin-musica") ? { pista: null } : {});
    console.log(`Reel: ${pathToFileURL(mp4).href}\nMúsica: ${pista || `ninguna (pon pistas en ${carpetaMusica()})`}`);
    process.exit(0);
  }
  if (process.argv[2] === "--imagen" && process.argv[3]) {
    console.log(`Imagen: ${pathToFileURL(renderImagen(resolve(process.argv[3]))).href}`);
    process.exit(0);
  }
  if (process.argv[2] === "--historia" && process.argv[3]) {
    console.log(`Historia: ${pathToFileURL(renderStory(resolve(process.argv[3]))).href}`);
    process.exit(0);
  }
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
