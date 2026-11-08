#!/usr/bin/env node
// Envía un borrador de la bitácora a Contentful: español en es-ES, inglés en
// en-US y las portadas ES/EN como imagen destacada. Nunca publica.
//
//   node .claude/scripts/blog-borrador.mjs <borrador.json> [--dry-run] [--entry ID] [--no-images] [--base URL]
//
// --dry-run    valida y muestra los índices sin enviar nada.
// --entry ID   actualiza ese borrador de Contentful en vez de crear otro.
// --no-images  no sube las portadas.
// --base URL   por defecto https://ortegafreelance.com (local: http://localhost:8888)
//
// Formato del borrador (ver .claude/docs/plantilla-blog.md):
//   { title, excerpt, body, cover, en: { title, excerpt, body } }
// Portadas: contenido-blog/<borrador>/portada-es.jpg y portada-en.jpg
// (las genera portada-blog.mjs). Lo enviado se recuerda en
// <borrador>.contentful.json: reenviar actualiza la misma entrada y no
// vuelve a subir las imágenes.
//
// La frase BLOG_ADMIN_SECRET se lee del Llavero de macOS (servicio
// "ortegafreelance-blog-admin") y nunca se imprime ni se guarda en disco.
// Raúl la guarda una vez con:
//   security add-generic-password -a "$USER" -s ortegafreelance-blog-admin -w

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { validateArticleDraft, draftSummary } from "../../netlify/functions/lib/articleDraft.js";

const KEYCHAIN_SERVICE = "ortegafreelance-blog-admin";
const BLOG_REPO = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

const args = process.argv.slice(2);
const flag = (name) => args.includes(name);
const option = (name) => (args.indexOf(name) >= 0 ? args[args.indexOf(name) + 1] : undefined);
const dryRun = flag("--dry-run");
const noImages = flag("--no-images");
const base = (option("--base") || "https://ortegafreelance.com").replace(/\/$/, "");
const forcedEntry = option("--entry");
const optionValues = new Set([option("--base"), option("--entry")].filter(Boolean));
const file = args.find((a) => !a.startsWith("--") && !optionValues.has(a));

if (!file) {
  console.error("Uso: node .claude/scripts/blog-borrador.mjs <borrador.json> [--dry-run] [--entry ID] [--no-images] [--base URL]");
  process.exit(64);
}

let draft;
try {
  draft = JSON.parse(readFileSync(file, "utf8"));
} catch (e) {
  console.error(`No pude leer ${file} como JSON: ${e.message}`);
  process.exit(65);
}

const es = validateArticleDraft(draft);
const en = draft.en ? validateArticleDraft(draft.en) : { ok: false, errors: ['Falta "en" (la versión en inglés).'] };
if (!es.ok || !en.ok) {
  console.error("El borrador no cumple la plantilla:");
  for (const e of es.ok ? [] : es.errors) console.error(`  - [es] ${e}`);
  for (const e of en.ok ? [] : en.errors) console.error(`  - [en] ${e}`);
  process.exit(65);
}

for (const [lang, art] of [["ES", es.article], ["EN", en.article]]) {
  const s = draftSummary(art);
  console.log(`${lang}: ${art.title}`);
  console.log(`    ${s.words} palabras · ${s.readingMinutes} min · índice: ${s.toc.join(" | ")}`);
}

const name = basename(file).replace(/\.json$/i, "");
const imagesDir = join(BLOG_REPO, "contenido-blog", name);
const images = { es: join(imagesDir, "portada-es.jpg"), en: join(imagesDir, "portada-en.jpg") };
const haveImages = !noImages && existsSync(images.es) && existsSync(images.en);
console.log(haveImages ? `Portadas: ${imagesDir}` : "Portadas: no se suben (no existen o --no-images).");

if (dryRun) {
  console.log("\n--dry-run: no se envió nada.");
  process.exit(0);
}

const stateFile = file.replace(/\.json$/i, ".contentful.json");
let state = {};
try {
  state = JSON.parse(readFileSync(stateFile, "utf8"));
} catch {
  /* primer envío */
}
if (forcedEntry) state.entryId = forcedEntry;

let secret;
try {
  secret = execFileSync("security", ["find-generic-password", "-s", KEYCHAIN_SERVICE, "-w"], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"],
  }).trim();
} catch {
  console.error(
    `\nNo encontré la frase de administración en el Llavero (servicio "${KEYCHAIN_SERVICE}").\n` +
      `Raúl la guarda una sola vez con:\n  security add-generic-password -a "$USER" -s ${KEYCHAIN_SERVICE} -w`
  );
  process.exit(77);
}

async function post(path, body) {
  let res;
  try {
    res = await fetch(`${base}${path}`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-admin-secret": secret },
      body: JSON.stringify(body),
    });
  } catch (e) {
    console.error(`\nNo pude conectar con ${base}${path}: ${e.message}`);
    process.exit(69);
  }
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = { error: `Respuesta no JSON (${res.status}). ¿Está desplegada ${path}?` };
  }
  if (!res.ok || !data.ok) {
    console.error(`\nError ${res.status} en ${path}: ${data.error || "desconocido"}`);
    for (const d of data.details || []) console.error(`  - ${d}`);
    process.exit(1);
  }
  return data;
}

if (haveImages && !(state.covers?.es && state.covers?.en)) {
  state.covers = {};
  for (const lang of ["es", "en"]) {
    const art = lang === "es" ? es.article : en.article;
    const data = await post("/api/blog-asset", {
      title: `Portada · ${art.title}`.slice(0, 200),
      fileName: `${name.replace(/[^a-z0-9-]/gi, "-").slice(0, 80)}-${lang}.jpg`,
      dataBase64: readFileSync(images[lang]).toString("base64"),
    });
    state.covers[lang] = data.assetId;
    console.log(`Portada ${lang.toUpperCase()} subida (asset ${data.assetId}).`);
  }
  writeFileSync(stateFile, JSON.stringify(state, null, 2) + "\n");
}

const updating = Boolean(state.entryId);
const data = await post("/api/blog-draft", {
  es: es.article,
  en: en.article,
  ...(state.covers ? { covers: state.covers } : {}),
  ...(state.entryId ? { entryId: state.entryId } : {}),
});
state.entryId = data.contentful.entryId;
state.editUrl = data.contentful.editUrl;
writeFileSync(stateFile, JSON.stringify(state, null, 2) + "\n");

const c = data.contentful;
console.log(
  `\nBorrador ${updating ? "actualizado" : "creado"} en Contentful (sin publicar): ` +
    `español → ${c.locales.es}, inglés → ${c.locales.en}` +
    (c.imageField && state.covers ? `, portadas en «${c.imageField}»` : "") + "."
);
console.log(`Revisar y publicar: ${data.contentful.editUrl}`);
