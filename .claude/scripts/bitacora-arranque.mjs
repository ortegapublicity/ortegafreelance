#!/usr/bin/env node
// Arranque de las tareas programadas de la bitácora (launchd).
//
//   node bitacora-arranque.mjs <repo> <script relativo al repo> [args…]
//
// Por qué existe: el repo vive en ~/Documents, que iCloud sincroniza. iCloud
// «desaloja» archivos que no se usan (quedan como marcadores sin contenido) y
// un proceso de fondo como launchd NO puede descargarlos al leerlos: falla
// con «Unknown system error -11». Así falló la bitácora del 2026-11-09.
// Pedir la descarga con `brctl download` sí funciona desde launchd, así que
// este arranque la pide para todo lo que las tareas necesitan, espera a que
// los archivos sean legibles y solo entonces lanza el script.
//
// IMPORTANTE: este archivo se ejecuta desde una COPIA fuera de iCloud:
//   ~/Library/Application Support/ortegafreelance-bitacora/bitacora-arranque.mjs
// (si viviera en el repo, podría ser él mismo el archivo desalojado). Si lo
// cambias, vuelve a copiarlo:
//   cp .claude/scripts/bitacora-arranque.mjs ~/Library/Application\ Support/ortegafreelance-bitacora/
// No importa nada del repo, a propósito.

import { spawnSync } from "node:child_process";
import { closeSync, openSync, readSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const [repo, script, ...rest] = process.argv.slice(2);
if (!repo || !script) {
  console.error("Uso: bitacora-arranque.mjs <repo> <script> [args…]");
  process.exit(64);
}

// Lo que leen las tareas: código, plantilla, datos de casos, isotipo, borradores y portadas.
const NEEDED = [
  ".claude/scripts",
  ".claude/docs/plantilla-blog.md",
  "netlify/functions/lib",
  "src/data/caseStudies.js",
  "src/assets/img/logo/favicon.png",
  ".claude/blog",
  "contenido-blog",
];
const WAIT_MS = 90_000;
const log = (...m) => console.log(`[${new Date().toISOString()}] arranque:`, ...m);

function listFiles(path, out = []) {
  let st;
  try {
    st = statSync(path);
  } catch {
    return out; // no existe todavía (por ejemplo .claude/blog en una máquina nueva)
  }
  if (!st.isDirectory()) return out.push(path), out;
  for (const e of readdirSync(path, { withFileTypes: true })) {
    if (e.name === ".DS_Store") continue;
    listFiles(join(path, e.name), out);
  }
  return out;
}

function readable(file) {
  let fd;
  try {
    fd = openSync(file, "r");
    readSync(fd, Buffer.alloc(1), 0, 1, 0);
    return true;
  } catch (e) {
    return e.code === "EISDIR"; // cualquier otro error = aún no se puede leer
  } finally {
    if (fd !== undefined) closeSync(fd);
  }
}

const files = NEEDED.flatMap((p) => listFiles(join(repo, p)));
let pending = files.filter((f) => !readable(f));
if (pending.length) {
  log(`${pending.length} archivo(s) desalojados por iCloud; pido la descarga.`);
  for (const f of pending) spawnSync("/usr/bin/brctl", ["download", f]);
  const deadline = Date.now() + WAIT_MS;
  while (pending.length && Date.now() < deadline) {
    spawnSync("/bin/sleep", ["1"]);
    pending = pending.filter((f) => !readable(f));
  }
  if (pending.length) {
    log(`Siguen sin poder leerse ${pending.length}: ${pending.slice(0, 3).join(", ")}… Sigo igualmente.`);
  } else {
    log("Descargados.");
  }
}

const r = spawnSync(process.execPath, [join(repo, script), ...rest], { stdio: "inherit", cwd: repo });
process.exit(r.status ?? 1);
