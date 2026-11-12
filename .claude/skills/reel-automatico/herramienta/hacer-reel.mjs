#!/usr/bin/env node
// Reel vertical (1080×1920) automático a partir de clips y activos de marca.
//
//   node hacer-reel.mjs <guion.json>            reel completo
//   node hacer-reel.mjs <guion.json> --prueba   hoja con fotogramas clave (segundos)
//
// Las rutas del guion (carpetaVideos, logo, salida) son relativas al guion.
// Formato del guion: ver ../SKILL.md, sección «El guion».
//
// 1. Piezas animadas (intro, textos, cierre): plantillas/pieza.html abierta
//    en Chrome headless una vez por fotograma (?t=segundos), con cada
//    animación CSS congelada en ese instante. En paralelo.
// 2. Cada toma: recorte vertical + su texto animado.
// 3. Montaje con ffmpeg: transiciones (xfade) + cruce de audio
//    (acrossfade), logo flotante encima de las tomas, fundido a negro final.
// Salida: <nombre>-con-sonido.mp4, <nombre>-sin-audio.mp4, <nombre>-portada.jpg
// Necesita: Google Chrome, ffmpeg (brew install ffmpeg) y Node 18+.

import { execFileSync, spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { cpus, tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const AQUI = dirname(fileURLToPath(import.meta.url));
const CHROME = process.env.CHROME_BIN || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const FFMPEG = process.env.FFMPEG_BIN || ["/opt/homebrew/bin/ffmpeg", "/usr/local/bin/ffmpeg"].find((f) => existsSync(f)) || "ffmpeg";
const FFPROBE = FFMPEG.replace(/ffmpeg$/, "ffprobe");
const FPS = 30;
const TRANSICIONES = ["circleopen", "smoothleft", "slideup", "radial", "smoothright", "fadewhite", "circleclose", "slidedown"];

const args = process.argv.slice(2);
const guionFile = resolve(args.find((a) => a.endsWith(".json")) || "");
if (!existsSync(guionFile)) {
  console.error("Uso: node hacer-reel.mjs <guion.json> [--prueba]");
  process.exit(64);
}
const PRUEBA = args.includes("--prueba");
const g = JSON.parse(readFileSync(guionFile, "utf8"));
const base = dirname(guionFile);
const videos = resolve(base, g.carpetaVideos || ".");
const salida = resolve(base, g.salida || ".");
const nombre = g.nombre || "reel";
const TRANS = g.duracionTransicion ?? 0.45;
const transiciones = g.transiciones?.length ? g.transiciones : TRANSICIONES;
const tema = g.tema || {};
const marca = g.marca || {};
mkdirSync(salida, { recursive: true });
const tmp = mkdtempSync(join(tmpdir(), "reel-"));

const ff = (a) => execFileSync(FFMPEG, ["-y", "-hide_banner", "-loglevel", "error", ...a], { stdio: ["ignore", "ignore", "inherit"], timeout: 900000 });
const enc = ["-c:v", "libx264", "-preset", "medium", "-crf", "18", "-pix_fmt", "yuv420p", "-r", String(FPS), "-c:a", "aac", "-b:a", "160k", "-ar", "44100", "-ac", "2"];
const tieneAudio = (f) => execFileSync(FFPROBE, ["-v", "error", "-select_streams", "a", "-show_entries", "stream=index", "-of", "csv=p=0", f], { encoding: "utf8" }).trim() !== "";

function validar() {
  const e = [];
  if (!marca.logo) e.push('Falta "marca.logo" (PNG con fondo transparente).');
  else if (!existsSync(resolve(base, marca.logo))) e.push(`No encuentro el logo: ${resolve(base, marca.logo)}`);
  if (!Array.isArray(g.clips) || !g.clips.length) e.push('Falta "clips" (al menos uno).');
  (g.clips || []).forEach((c, i) => {
    if (!existsSync(join(videos, c.archivo || ""))) e.push(`clips[${i}]: no encuentro ${join(videos, c.archivo || "")}`);
    if (!(c.hasta > c.desde)) e.push(`clips[${i}]: "hasta" tiene que ser mayor que "desde".`);
    else if (c.hasta - c.desde < TRANS * 2 + 0.6) e.push(`clips[${i}]: dura ${(c.hasta - c.desde).toFixed(1)} s; mínimo ${(TRANS * 2 + 0.6).toFixed(1)} s.`);
    if (c.texto && c.texto.replace(/\*\*/g, "").length > 60) e.push(`clips[${i}]: texto de más de 60 caracteres (no se lee en 3 s).`);
  });
  if (e.length) throw new Error(`Guion no válido:\n  - ${e.join("\n  - ")}`);
}

// Fuentes de Google en data URI, en caché junto a la salida.
async function fuentes() {
  const fams = [tema.fuenteTitulo || "Great Vibes", tema.fuenteTexto || "Montserrat"];
  const dir = join(salida, ".reel-cache");
  mkdirSync(dir, { recursive: true });
  const cache = join(dir, `fuentes-${createHash("md5").update(fams.join("|")).digest("hex").slice(0, 8)}.css`);
  if (existsSync(cache)) return readFileSync(cache, "utf8");
  const q = `family=${encodeURIComponent(fams[0]).replace(/%20/g, "+")}&family=${encodeURIComponent(fams[1]).replace(/%20/g, "+")}:wght@600;800`;
  const ua = { "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36" };
  const res = await fetch(`https://fonts.googleapis.com/css2?${q}&display=block`, { headers: ua });
  if (!res.ok) throw new Error(`Google Fonts no tiene «${fams.join("» o «")}» (${res.status}). Revisa tema.fuenteTitulo / tema.fuenteTexto.`);
  let css = await res.text();
  for (const url of [...new Set(css.match(/https:\/\/fonts\.gstatic\.com\/[^)]+/g) || [])]) {
    css = css.replaceAll(url, `data:font/woff2;base64,${Buffer.from(await (await fetch(url)).arrayBuffer()).toString("base64")}`);
  }
  writeFileSync(cache, css);
  return css;
}

let PAGE, LOGO_PNG;
async function preparar() {
  // Logo reducido a 1000 px (un PNG de 50 MB en cada fotograma haría el render eterno).
  LOGO_PNG = join(tmp, "logo.png");
  ff(["-i", resolve(base, marca.logo), "-vf", "scale='min(1000,iw)':-1", LOGO_PNG]);
  const logo = `data:image/png;base64,${readFileSync(LOGO_PNG).toString("base64")}`;
  PAGE = join(tmp, "pieza.html");
  writeFileSync(PAGE, readFileSync(join(AQUI, "plantillas/pieza.html"), "utf8").replaceAll("__LOGO__", logo).replaceAll("__FUENTES__", await fuentes()));
}

async function renderizar(trabajos) {
  const workers = Math.max(2, Math.min(8, cpus().length - 1));
  let i = 0, hechos = 0;
  const uno = (w) => new Promise((ok, ko) => {
    const j = trabajos[i++];
    if (!j) return ok(false);
    const c = spawn(CHROME, [
      "--headless=new", "--disable-gpu", "--hide-scrollbars", "--no-first-run", `--user-data-dir=${join(tmp, `chrome-${w}`)}`,
      "--window-size=1080,1920", "--force-device-scale-factor=1", "--virtual-time-budget=3000",
      ...(j.transparente ? ["--default-background-color=00000000"] : []),
      `--screenshot=${j.png}`, `${pathToFileURL(PAGE).href}?t=${j.t.toFixed(4)}#${encodeURIComponent(JSON.stringify(j.datos))}`,
    ], { stdio: "ignore" });
    c.on("close", () => (existsSync(j.png) ? ok(true) : ko(new Error(`Chrome no generó ${j.png}`))));
  });
  await Promise.all(Array.from({ length: workers }, async (_, w) => {
    while (await uno(w)) if (++hechos % 60 === 0) console.log(`  ${hechos}/${trabajos.length} fotogramas`);
  }));
}

const datos = (tipo, extra) => ({ tipo, tema, marca, ...extra });
function secuencia(id, d, segundos, transparente = false) {
  const dir = join(tmp, id);
  mkdirSync(dir, { recursive: true });
  const n = Math.round(segundos * FPS);
  return {
    patron: join(dir, "f%04d.png"),
    trabajos: Array.from({ length: n }, (_, k) => ({ png: join(dir, `f${String(k + 1).padStart(4, "0")}.png`), t: k / FPS, datos: d, transparente })),
  };
}

function placa(seq, segundos, mp4, fadeOut = 0) {
  const vf = [`fps=${FPS}`, "format=yuv420p"];
  if (fadeOut) vf.push(`fade=t=out:st=${(segundos - fadeOut).toFixed(2)}:d=${fadeOut}`);
  ff(["-framerate", String(FPS), "-i", seq.patron, "-f", "lavfi", "-i", "anullsrc=r=44100:cl=stereo",
    "-vf", vf.join(","), "-map", "0:v", "-map", "1:a", "-t", segundos.toFixed(2), ...enc, mp4]);
  return mp4;
}

function toma(clip, i, seq) {
  const archivo = join(videos, clip.archivo);
  const dur = clip.hasta - clip.desde;
  const mp4 = join(tmp, `toma-${i}.mp4`);
  const entra = TRANS * 0.8;
  const sale = Math.max(entra + 1, dur - TRANS - 0.25);
  const audio = tieneAudio(archivo);
  const f = [`[0:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,fps=${FPS},setsar=1,format=yuv420p[v]`];
  if (seq) {
    f.push(`[1:v]format=rgba,tpad=start_duration=${entra}:start_mode=add:color=black@0:stop_mode=clone:stop_duration=${dur},fade=t=out:st=${sale.toFixed(2)}:d=0.25:alpha=1[t]`);
    f.push(`[v][t]overlay=0:0:eof_action=pass,format=yuv420p,trim=duration=${dur.toFixed(2)}[out]`);
  } else f.push(`[v]trim=duration=${dur.toFixed(2)}[out]`);
  const aIn = audio ? "[0:a:0]" : `[${seq ? 2 : 1}:a]`;
  f.push(`${aIn}aresample=44100,aformat=channel_layouts=stereo,apad,atrim=duration=${dur.toFixed(2)}[a]`);
  ff([
    "-ss", String(clip.desde), "-t", dur.toFixed(2), "-i", archivo,
    ...(seq ? ["-framerate", String(FPS), "-i", seq.patron] : []),
    ...(audio ? [] : ["-f", "lavfi", "-i", "anullsrc=r=44100:cl=stereo"]),
    "-filter_complex", f.join(";"), "-map", "[out]", "-map", "[a]", ...enc, mp4,
  ]);
  return mp4;
}

async function prueba() {
  // Fotogramas clave: intro (inicio, mitad, final), un texto y el cierre.
  const ti = g.intro.segundos, to = g.outro.segundos;
  const casos = [
    [datos("intro", g.intro), 0.3], [datos("intro", g.intro), 1.2], [datos("intro", g.intro), ti - 0.05],
    ...g.clips.filter((c) => c.texto).slice(0, 2).map((c) => [datos("texto", { texto: c.texto }), 1.15, true]),
    [datos("outro", g.outro), to - 0.05],
  ];
  const trabajos = casos.map(([d, t, tr], k) => ({ png: join(tmp, `p${k}.png`), t, datos: d, transparente: !!tr }));
  await renderizar(trabajos);
  // Los textos van sobre un fotograma real de su toma.
  const pngs = [];
  for (const [k, j] of trabajos.entries()) {
    if (!j.transparente) { pngs.push(j.png); continue; }
    const c = g.clips.filter((x) => x.texto)[k - 3];
    const fondo = join(tmp, `fondo${k}.png`);
    ff(["-ss", String(c.desde + 1), "-i", join(videos, c.archivo), "-frames:v", "1", "-vf", "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920", fondo]);
    const out = join(tmp, `comp${k}.png`);
    ff(["-i", fondo, "-i", j.png, "-filter_complex", "[0][1]overlay", out]);
    pngs.push(out);
  }
  const hoja = join(salida, `${nombre}-prueba.jpg`);
  ff([...pngs.flatMap((p) => ["-i", p]), "-filter_complex", `${pngs.map((_, k) => `[${k}]scale=360:-1[s${k}]`).join(";")};${pngs.map((_, k) => `[s${k}]`).join("")}hstack=${pngs.length}`, hoja]);
  console.log(`Hoja de prueba: ${hoja}`);
}

try {
  validar();
  await preparar();
  if (PRUEBA) {
    await prueba();
  } else {
    const intro = secuencia("intro", datos("intro", g.intro), g.intro.segundos);
    const outro = secuencia("outro", datos("outro", g.outro), g.outro.segundos);
    const textos = g.clips.map((c, i) => (c.texto ? secuencia(`texto-${i}`, datos("texto", { texto: c.texto }), 1.2, true) : null));
    const trabajos = [intro, outro, ...textos.filter(Boolean)].flatMap((s) => s.trabajos);
    console.log(`Piezas animadas: ${trabajos.length} fotogramas…`);
    await renderizar(trabajos);

    const partes = [{ mp4: placa(intro, g.intro.segundos, join(tmp, "intro.mp4")), dur: g.intro.segundos }];
    g.clips.forEach((c, i) => {
      console.log(`Toma ${i + 1}/${g.clips.length}: ${c.archivo}`);
      partes.push({ mp4: toma(c, i, textos[i]), dur: c.hasta - c.desde });
    });
    partes.push({ mp4: placa(outro, g.outro.segundos, join(tmp, "outro.mp4"), 0.45), dur: g.outro.segundos });

    console.log("Montaje con transiciones…");
    const f = [];
    let largo = partes[0].dur, v = "0:v", a = "0:a", finTomas = 0;
    const inicioTomas = largo - TRANS;
    for (let k = 1; k < partes.length; k++) {
      const offset = largo - TRANS;
      if (k === partes.length - 1) finTomas = offset;
      f.push(`[${v}][${k}:v]xfade=transition=${transiciones[(k - 1) % transiciones.length]}:duration=${TRANS}:offset=${offset.toFixed(3)}[v${k}]`);
      f.push(`[${a}][${k}:a]acrossfade=d=${TRANS}:c1=tri:c2=tri[a${k}]`);
      v = `v${k}`; a = `a${k}`;
      largo += partes[k].dur - TRANS;
    }
    const n = partes.length;
    const extra = [];
    if (g.logoFlotante !== false) {
      extra.push("-loop", "1", "-framerate", String(FPS), "-i", LOGO_PNG);
      f.push(`[${n}:v]scale=200:-1,format=rgba,rotate='0.09*sin(2*PI*t/2.2)':c=none:ow=hypot(iw\\,ih):oh=ow,fade=t=in:st=${(inicioTomas + TRANS).toFixed(2)}:d=0.4:alpha=1,fade=t=out:st=${finTomas.toFixed(2)}:d=0.3:alpha=1[logo]`);
      f.push(`[${v}][logo]overlay=(W-w)/2:95:shortest=1,format=yuv420p[vf]`);
    } else f.push(`[${v}]format=yuv420p[vf]`);
    f.push(`[${a}]loudnorm=I=-16:TP=-1.5:LRA=11,aresample=44100[af]`);

    const conSonido = join(salida, `${nombre}-con-sonido.mp4`);
    ff([...partes.flatMap((p) => ["-i", p.mp4]), ...extra, "-filter_complex", f.join(";"), "-map", "[vf]", "-map", "[af]", "-t", largo.toFixed(2), ...enc, "-movflags", "+faststart", conSonido]);
    const sinAudio = join(salida, `${nombre}-sin-audio.mp4`);
    ff(["-i", conSonido, "-f", "lavfi", "-i", "anullsrc=r=44100:cl=stereo", "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-c:a", "aac", "-shortest", "-movflags", "+faststart", sinAudio]);
    const portada = join(salida, `${nombre}-portada.jpg`);
    execFileSync("sips", ["-s", "format", "jpeg", "-s", "formatOptions", "90", intro.trabajos[intro.trabajos.length - 1].png, "--out", portada], { stdio: "ignore" });
    console.log(`Listo (${largo.toFixed(1)} s):\n  ${conSonido}\n  ${sinAudio}\n  ${portada}`);
  }
} catch (e) {
  console.error(`Error: ${e.message}`);
  process.exitCode = 1;
} finally {
  rmSync(tmp, { recursive: true, force: true });
}
