#!/usr/bin/env node
// Bitácora nocturna: cada noche convierte el trabajo reciente de los repos de
// ~/Documents en, como máximo, UN borrador del blog de ortegafreelance.com.
//
//   node .claude/scripts/bitacora-nocturna.mjs [--force] [--dry-run]
//
// --force    ejecuta aunque ya se haya ejecutado hoy.
// --dry-run  escribe y valida el artículo, pero no lo envía a Contentful.
//
// Cómo funciona (y por qué así):
// 1. Este script lee el historial de git (solo lectura) y arma un resumen.
//    Si no hay commits nuevos, termina sin llamar a Claude.
// 2. Llama a `claude -p` SIN herramientas (--tools ""): Claude solo recibe
//    texto y devuelve texto. No puede leer, escribir ni ejecutar nada, así que
//    no hay riesgo de que toque el repo de un cliente.
// 3. El script valida el JSON con las mismas reglas que el servidor
//    (lib/articleDraft.js), pide una corrección si hace falta, y lo envía con
//    blog-borrador.mjs, que crea el BORRADOR en Contentful. Nunca publica.
//
// Usa la sesión de Claude Code del usuario (suscripción claude.ai): no hay
// API key. Lo lanza launchd: ~/Library/LaunchAgents/com.ortegafreelance.bitacora.plist
// Registro: ~/Library/Logs/bitacora-nocturna.log

import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { homedir, tmpdir } from "node:os";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { validateArticleDraft, draftSummary } from "../../netlify/functions/lib/articleDraft.js";

const BLOG_REPO = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const STATE = join(BLOG_REPO, ".claude/blog"); // en .gitignore: el repo es público
const DRAFTS = join(STATE, "borradores");
const ACTIVITY = join(STATE, "actividad");
const STAMP_DRAFT = join(STATE, "ultimo-borrador");
const STAMP_RUN = join(STATE, "ultima-ejecucion");
const SCAN_ROOT = join(homedir(), "Documents");

// Repos que nunca se leen: el clon viejo y roto de la web, y la base de leads.
const EXCLUDE = new Set([
  "ortegafreelance",
  "Base de datos online",
  ...(process.env.BITACORA_EXCLUDE || "").split(",").map((s) => s.trim()).filter(Boolean),
]);

const DEFAULT_DAYS = 7;
const MAX_DAYS = 14;
const MAX_REPO_CHARS = 7000;
const MAX_TOTAL_CHARS = 30000;
const CLAUDE_TIMEOUT_MS = 10 * 60 * 1000;

const args = process.argv.slice(2);
const force = args.includes("--force");
const dryRun = args.includes("--dry-run");

const today = new Date().toLocaleDateString("sv-SE"); // AAAA-MM-DD en hora local
const log = (...m) => console.log(`[${new Date().toISOString()}]`, ...m);

function notify(title, message) {
  const esc = (s) => String(s).replace(/\\/g, "\\\\").replace(/"/g, '\\"').slice(0, 200);
  spawnSync("osascript", ["-e", `display notification "${esc(message)}" with title "${esc(title)}"`]);
}

function readStamp(file) {
  try {
    return readFileSync(file, "utf8").trim();
  } catch {
    return "";
  }
}

function sinceDate() {
  const min = new Date(Date.now() - MAX_DAYS * 864e5);
  const last = readStamp(STAMP_DRAFT);
  const fromStamp = last ? new Date(last) : new Date(Date.now() - DEFAULT_DAYS * 864e5);
  return (isNaN(fromStamp) || fromStamp < min ? min : fromStamp).toISOString();
}

function findRepos() {
  const repos = [];
  const visit = (dir, depth) => {
    let entries = [];
    try {
      entries = readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const e of entries) {
      if (!e.isDirectory() || e.name.startsWith(".") || e.name === "node_modules") continue;
      const full = join(dir, e.name);
      if (EXCLUDE.has(e.name)) continue;
      if (existsSync(join(full, ".git"))) repos.push(full);
      else if (depth < 2) visit(full, depth + 1);
    }
  };
  visit(SCAN_ROOT, 1);
  return repos;
}

const git = (repo, gitArgs) =>
  execFileSync("git", ["-C", repo, ...gitArgs], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });

// Solo host/ruta: nunca usuario ni token incrustados en la URL del remoto.
function cleanRemote(repo) {
  try {
    const url = git(repo, ["remote", "get-url", "origin"]).trim();
    const m = url.match(/^(?:https?:\/\/)?(?:[^@/]+@)?([^/:]+)[/:](.+?)(?:\.git)?$/);
    return m ? `${m[1]}/${m[2]}` : "";
  } catch {
    return "";
  }
}

function collectActivity(since) {
  const parts = [];
  let total = 0;
  for (const repo of findRepos()) {
    let out = "";
    try {
      out = git(repo, [
        "log",
        "--no-merges",
        `--since=${since}`,
        "--date=short",
        "--shortstat",
        "--pretty=format:%n#### %ad · %s%n%b",
      ]).trim();
    } catch {
      continue;
    }
    if (!out) continue;
    if (out.length > MAX_REPO_CHARS) out = out.slice(0, MAX_REPO_CHARS) + "\n[…recortado]";
    const block = `## Repo: ${basename(repo)}${cleanRemote(repo) ? ` (${cleanRemote(repo)})` : ""}\n${out}`;
    if (total + block.length > MAX_TOTAL_CHARS) break;
    parts.push(block);
    total += block.length;
  }
  return parts.join("\n\n");
}

function allowedClients() {
  const src = readFileSync(join(BLOG_REPO, "src/data/caseStudies.js"), "utf8");
  const names = [...src.matchAll(/clientName:\s*"([^"]+)"/g)].map((m) => m[1]);
  return [...new Set([...names, "NEXO LAB"])];
}

function previousTitles() {
  if (!existsSync(DRAFTS)) return [];
  return readdirSync(DRAFTS)
    .filter((f) => f.endsWith(".json"))
    .map((f) => {
      try {
        return JSON.parse(readFileSync(join(DRAFTS, f), "utf8")).title;
      } catch {
        return null;
      }
    })
    .filter(Boolean);
}

function buildPrompt(activity) {
  const plantilla = readFileSync(join(BLOG_REPO, ".claude/docs/plantilla-blog.md"), "utf8");
  const titles = previousTitles();
  return `Eres el escritor de la bitácora de Raúl Ortega para el blog de ortegafreelance.com. Esta ejecución es automática y nocturna: nadie puede responder preguntas, así que decide tú y no preguntes nada.

Tu material es el historial de git de sus proyectos (abajo). Cuenta UNA decisión de trabajo real, con su voz, siguiendo la plantilla al pie de la letra.

# PLANTILLA (restricción, no sugerencia)
${plantilla}

# CLIENTES QUE SE PUEDEN NOMBRAR
${allowedClients().join(", ")}
Su propia web (ortegafreelance.com) también. Cualquier otro cliente va SIN nombre: describe el sector y lo que vende. Los nombres de repo no dan permiso.

# POSTS YA ESCRITOS (no repitas tema ni enfoque)
${titles.length ? titles.map((t) => `- ${t}`).join("\n") : "- (ninguno)"}

# ACTIVIDAD RECIENTE (git log, solo lectura)
${activity}

# QUÉ DEVOLVER
- Elige el proyecto o la pieza con más decisión contable. Un solo post.
- Si no hay una decisión que merezca un post (solo arreglos menores, textos, limpieza, configuración interna, o temas ya cubiertos), responde únicamente:
ESPERAR: <motivo en una frase>
- Si hay material, responde con una primera línea
CLIENTE: <nombrado|anonimo|propio> · <proyecto>
y después el artículo como un único bloque \`\`\`json con title, excerpt y body, según el formato de la plantilla. Nada más.
- No inventes cifras, resultados ni testimonios: si el historial no los trae, di qué se va a medir.
- Nunca incluyas nombres de variables de entorno, claves, correos, teléfonos, IDs, rutas de paneles internos ni nombres de repos.`;
}

function runClaude(input, resumeId) {
  const claudeBin = process.env.CLAUDE_BIN || join(homedir(), ".local/bin/claude");
  const cliArgs = [
    "-p",
    "--tools", "",
    "--strict-mcp-config",
    "--disable-slash-commands",
    "--output-format", "json",
  ];
  if (resumeId) cliArgs.push("--resume", resumeId);
  const r = spawnSync(claudeBin, cliArgs, {
    input,
    encoding: "utf8",
    cwd: tmpdir(), // fuera de cualquier repo: no carga CLAUDE.md ni hooks de proyecto
    timeout: CLAUDE_TIMEOUT_MS,
    maxBuffer: 10 * 1024 * 1024,
  });
  if (r.error) throw new Error(`No pude ejecutar claude: ${r.error.message}`);
  let data;
  try {
    data = JSON.parse(r.stdout);
  } catch {
    throw new Error(`claude no devolvió JSON (código ${r.status}): ${(r.stderr || r.stdout).slice(0, 300)}`);
  }
  if (data.is_error) throw new Error(`claude devolvió un error: ${String(data.result).slice(0, 300)}`);
  return { text: String(data.result || ""), sessionId: data.session_id };
}

function parseReply(text) {
  const wait = text.match(/^\s*ESPERAR:\s*(.+)$/m);
  const fenced = text.match(/```json\s*([\s\S]*?)```/i);
  if (!fenced) return wait ? { wait: wait[1].trim() } : { error: "La respuesta no trae un bloque ```json." };
  const client = (text.match(/^\s*CLIENTE:\s*(.+)$/m) || [])[1]?.trim() || "";
  try {
    return { client, article: JSON.parse(fenced[1]) };
  } catch (e) {
    return { client, error: `El bloque JSON no es válido: ${e.message}` };
  }
}

function slugify(s) {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 50) || "post";
}

async function main() {
  mkdirSync(DRAFTS, { recursive: true });
  mkdirSync(ACTIVITY, { recursive: true });

  if (!force && readStamp(STAMP_RUN) === today) {
    log("Ya se ejecutó hoy. Usa --force para repetir.");
    return;
  }
  if (!dryRun) writeFileSync(STAMP_RUN, today);

  const since = sinceDate();
  const activity = collectActivity(since);
  if (!activity) {
    log(`Sin commits desde ${since}. No se llama a Claude.`);
    return;
  }
  writeFileSync(join(ACTIVITY, `${today}.md`), activity);
  log(`Actividad desde ${since}: ${activity.length} caracteres. Pidiendo el artículo a Claude…`);

  let { text, sessionId } = runClaude(buildPrompt(activity));
  let parsed = parseReply(text);
  if (parsed.wait) {
    log(`Claude decidió esperar: ${parsed.wait}`);
    return;
  }

  let check = parsed.article ? validateArticleDraft(parsed.article) : { ok: false, errors: [parsed.error] };
  if (!check.ok) {
    log("Primera versión rechazada, pido corrección:", check.errors.join(" | "));
    ({ text } = runClaude(
      `El validador rechazó el artículo:\n- ${check.errors.join("\n- ")}\n\nDevuelve de nuevo la línea CLIENTE y el artículo completo corregido en un único bloque \`\`\`json.`,
      sessionId
    ));
    parsed = parseReply(text);
    check = parsed.article ? validateArticleDraft(parsed.article) : { ok: false, errors: [parsed.error] };
  }
  if (!check.ok) {
    log("El artículo no pasó la validación tras la corrección:", check.errors.join(" | "));
    notify("Bitácora", "El borrador de esta noche no pasó la plantilla. Mira el registro.");
    process.exitCode = 1;
    return;
  }

  const { article } = check;
  const file = join(DRAFTS, `${today}-${slugify(article.title)}.json`);
  writeFileSync(file, JSON.stringify(article, null, 2) + "\n");
  const { words, toc } = draftSummary(article);
  log(`Borrador guardado: ${file} (${words} palabras, ${toc.length} secciones, cliente: ${parsed.client || "?"})`);

  if (dryRun) {
    log("--dry-run: no se envía a Contentful.");
    return;
  }

  const send = spawnSync(process.execPath, [join(BLOG_REPO, ".claude/scripts/blog-borrador.mjs"), file], {
    encoding: "utf8",
  });
  const output = `${send.stdout || ""}${send.stderr || ""}`;
  console.log(output.trim());
  if (send.status !== 0) {
    const why = send.status === 77 ? "falta la frase en el Llavero" : send.status === 1 && /401/.test(output) ? "la frase del Llavero no coincide con la de Netlify" : "error al enviar";
    notify("Bitácora", `Artículo escrito pero no enviado: ${why}. Está en .claude/blog/borradores.`);
    process.exitCode = 1;
    return;
  }

  writeFileSync(STAMP_DRAFT, new Date().toISOString());
  const anon = /anonimo/i.test(parsed.client) ? " Cliente sin nombre: decide si lo nombras." : "";
  notify("Bitácora: borrador listo", `${article.title}.${anon}`);
}

main().catch((e) => {
  log("Error:", e.message);
  notify("Bitácora", `Falló la ejecución nocturna: ${e.message}`);
  process.exitCode = 1;
});
