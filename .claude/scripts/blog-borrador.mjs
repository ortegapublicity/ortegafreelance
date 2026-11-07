#!/usr/bin/env node
// Envía un artículo ya escrito (JSON) a /api/blog-draft, que lo crea como
// BORRADOR en Contentful. Lo usa el skill /bitacora.
//
//   node .claude/scripts/blog-borrador.mjs <articulo.json> [--dry-run] [--endpoint URL]
//
// --dry-run   valida y muestra el índice sin enviar nada.
// --endpoint  por defecto https://ortegafreelance.com/api/blog-draft
//             (para probar en local: http://localhost:8888/api/blog-draft)
//
// La frase BLOG_ADMIN_SECRET se lee del Llavero de macOS (servicio
// "ortegafreelance-blog-admin"). El script NUNCA la imprime ni la escribe en
// disco: solo viaja en la cabecera de la petición. Raúl la guarda una vez con:
//   security add-generic-password -a "$USER" -s ortegafreelance-blog-admin -w
// (pide el valor por teclado; no lo escribas en la línea de comandos).

import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { validateArticleDraft, draftSummary } from "../../netlify/functions/lib/articleDraft.js";

const KEYCHAIN_SERVICE = "ortegafreelance-blog-admin";
const DEFAULT_ENDPOINT = "https://ortegafreelance.com/api/blog-draft";

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const endpointIdx = args.indexOf("--endpoint");
const endpoint = endpointIdx >= 0 ? args[endpointIdx + 1] : DEFAULT_ENDPOINT;
const file = args.find((a, i) => !a.startsWith("--") && args[i - 1] !== "--endpoint");

if (!file) {
  console.error("Uso: node .claude/scripts/blog-borrador.mjs <articulo.json> [--dry-run] [--endpoint URL]");
  process.exit(64);
}

let input;
try {
  input = JSON.parse(readFileSync(file, "utf8"));
} catch (e) {
  console.error(`No pude leer ${file} como JSON: ${e.message}`);
  process.exit(65);
}

const check = validateArticleDraft(input);
if (!check.ok) {
  console.error("El artículo no cumple la plantilla:");
  for (const err of check.errors) console.error(`  - ${err}`);
  process.exit(65);
}

const { article } = check;
const summary = draftSummary(article);
console.log(`Título: ${article.title}`);
console.log(`${summary.words} palabras · ${summary.readingMinutes} min de lectura`);
console.log("Índice del artículo:");
summary.toc.forEach((t, i) => console.log(`  ${i + 1}. ${t}`));

if (dryRun) {
  console.log("\n--dry-run: no se envió nada.");
  process.exit(0);
}

let secret;
try {
  secret = execFileSync("security", ["find-generic-password", "-s", KEYCHAIN_SERVICE, "-w"], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"],
  }).trim();
} catch {
  console.error(
    `\nNo encontré la frase de administración en el Llavero (servicio "${KEYCHAIN_SERVICE}").\n` +
      "Raúl la guarda una sola vez con:\n" +
      `  security add-generic-password -a "$USER" -s ${KEYCHAIN_SERVICE} -w\n` +
      "Alternativa sin Llavero: pegar el JSON en https://ortegafreelance.com/admin-blog → «Pegar artículo de Claude»."
  );
  process.exit(77);
}

let res;
let data;
try {
  res = await fetch(endpoint, {
    method: "POST",
    headers: { "content-type": "application/json", "x-admin-secret": secret },
    body: JSON.stringify(article),
  });
  const text = await res.text();
  try {
    data = JSON.parse(text);
  } catch {
    data = { error: `Respuesta no JSON (${res.status}). ¿Está desplegada /api/blog-draft?` };
  }
} catch (e) {
  console.error(`\nNo pude conectar con ${endpoint}: ${e.message}`);
  process.exit(69);
}

if (!res.ok || !data.ok) {
  console.error(`\nError ${res.status}: ${data.error || "desconocido"}`);
  for (const d of data.details || []) console.error(`  - ${d}`);
  process.exit(1);
}

console.log("\nBorrador creado en Contentful (sin publicar).");
console.log(`Revisar y publicar: ${data.contentful?.editUrl}`);
