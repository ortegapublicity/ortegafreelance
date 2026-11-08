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
import { appendFileSync, existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { homedir, tmpdir } from "node:os";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { validateArticleDraft, draftSummary } from "../../netlify/functions/lib/articleDraft.js";
import { ICONS, renderCovers, validateCover } from "./portada-blog.mjs";

const BLOG_REPO = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const STATE = join(BLOG_REPO, ".claude/blog"); // en .gitignore: el repo es público
const DRAFTS = join(STATE, "borradores");
const ACTIVITY = join(STATE, "actividad");
const STAMP_DRAFT = join(STATE, "ultimo-borrador");
const STAMP_RUN = join(STATE, "ultima-ejecucion");
const SCAN_ROOT = join(homedir(), "Documents");
const INDEX = join(BLOG_REPO, "contenido-blog/INDICE.md"); // fuera de git: enlaces de cada borrador

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

// Posts publicados (id y títulos) para elegir los «Recommended posts». Si
// falla, el servidor pone los dos más recientes.
function publishedPosts() {
  const r = spawnSync(process.execPath, [join(BLOG_REPO, ".claude/scripts/blog-borrador.mjs"), "--listar", "--json"], {
    encoding: "utf8",
    timeout: 60000,
  });
  try {
    return r.status === 0 ? JSON.parse(r.stdout) : [];
  } catch {
    return [];
  }
}

function buildPrompt(activity, posts = []) {
  const plantilla = readFileSync(join(BLOG_REPO, ".claude/docs/plantilla-blog.md"), "utf8");
  const titles = previousTitles();
  return `Eres el escritor de la bitácora de Raúl Ortega para el blog de ortegafreelance.com. Esta ejecución es automática y nocturna: nadie puede responder preguntas, así que decide tú y no preguntes nada.

Tu material es el historial de git de sus proyectos (abajo). Cuenta UNA decisión de trabajo real, con su voz, siguiendo la plantilla al pie de la letra.

# PLANTILLA (restricción, no sugerencia)
${plantilla}

# CLIENTES QUE SE PUEDEN NOMBRAR
${allowedClients().join(", ")}
Su propia web (ortegafreelance.com) también. Cualquier otro cliente va SIN nombre: describe el sector y lo que vende. Los nombres de repo no dan permiso.

# POSTS PUBLICADOS (para "recommended": elige 2 por id, los más relacionados con el tema)
${posts.length ? posts.slice(0, 40).map((p) => `- ${p.id} · ${p.es}`).join("\n") : "- (lista no disponible: omite \"recommended\")"}

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
y después el artículo como un único bloque \`\`\`json con title, excerpt, body, cover y en, según el formato de la plantilla. Nada más.
- "en" es la versión completa en inglés: { title, excerpt, body } con la misma estructura de bloques y los mismos títulos de sección traducidos. Traduce con naturalidad (inglés de negocio, segunda persona), no palabra por palabra.
- "recommended": lista con los ids de 2 posts publicados de la lista de arriba, los más relacionados con el tema.
- "cover" son los datos de la portada (ver la sección Portada de la plantilla): title_en (el título en inglés) y svg, una ILUSTRACIÓN PROPIA del tema del post: el contenido de un <svg viewBox="0 0 1008 945"> SIN la etiqueta <svg> (empieza con <defs> o con un <rect> de fondo que cubra 1008×945). Estilo plano y moderno, con profundidad suave (sombras con feDropShadow, brillos con feGaussianBlur), fondo propio a sangre y objetos reconocibles del tema (pantallas, paneles, documentos, gráficos, personas en silueta, objetos del sector). Varía la composición y la paleta de fondo según el tema; acentos de la marca: #3a7bff, #7b2cbf, #ff6b35, #ffd60a, #26d1c4. Sin texto ni números dentro (la portada se usa en dos idiomas). Prohibido: <script>, <style>, <image>, <foreignObject>, <a>, atributos on…= y URLs; solo href="#id" propios. Máximo 60.000 caracteres. NO copies la ruta de nodos numerados.
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

function checkAll(article) {
  const a = article ? validateArticleDraft(article) : { ok: false, errors: ["No llegó el artículo."] };
  const e = article?.en ? validateArticleDraft(article.en) : { ok: false, errors: ['Falta "en" (la versión en inglés).'] };
  const coverErrors = article ? validateCover(article.cover) : [];
  const errors = [...(a.ok ? [] : a.errors), ...(e.ok ? [] : e.errors.map((x) => `[en] ${x}`)), ...coverErrors];
  return errors.length
    ? { ok: false, errors }
    : {
        ok: true,
        article: {
          ...a.article,
          cover: article.cover,
          ...(Array.isArray(article.recommended) ? { recommended: article.recommended.slice(0, 3) } : {}),
          en: e.article,
        },
      };
}

function addToIndex(line) {
  try {
    mkdirSync(dirname(INDEX), { recursive: true });
    if (!existsSync(INDEX)) writeFileSync(INDEX, "# Borradores de la bitácora\n\nFecha · título · Contentful · imágenes\n\n");
    appendFileSync(INDEX, line + "\n");
  } catch (e) {
    log("No pude actualizar el índice:", e.message);
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

  const posts = publishedPosts();
  log(`Posts publicados para recomendar: ${posts.length}`);
  let { text, sessionId } = runClaude(buildPrompt(activity, posts));
  let parsed = parseReply(text);
  if (parsed.wait) {
    log(`Claude decidió esperar: ${parsed.wait}`);
    return;
  }

  let check = parsed.article ? checkAll(parsed.article) : { ok: false, errors: [parsed.error] };
  if (!check.ok) {
    log("Primera versión rechazada, pido corrección:", check.errors.join(" | "));
    ({ text } = runClaude(
      `El validador rechazó el artículo:\n- ${check.errors.join("\n- ")}\n\nDevuelve de nuevo la línea CLIENTE y el artículo completo corregido en un único bloque \`\`\`json.`,
      sessionId
    ));
    parsed = parseReply(text);
    check = parsed.article ? checkAll(parsed.article) : { ok: false, errors: [parsed.error] };
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

  // Portadas ES/EN. Si fallan, el borrador se envía igual y se avisa.
  let imagesUrl = "";
  try {
    const { outDir } = renderCovers(file);
    imagesUrl = pathToFileURL(outDir).href;
    log(`Imágenes: ${imagesUrl}`);
  } catch (e) {
    log("No se pudieron generar las portadas:", e.message);
  }

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
    addToIndex(`- ${today} · ${article.title} · NO ENVIADO (${why}) · ${imagesUrl || "sin imágenes"}`);
    process.exitCode = 1;
    return;
  }

  writeFileSync(STAMP_DRAFT, new Date().toISOString());
  const editUrl = (output.match(/Revisar y publicar: (\S+)/) || [])[1] || "";
  if (imagesUrl) {
    try {
      appendFileSync(join(fileURLToPath(imagesUrl), "LEEME.txt"), `Contentful: ${editUrl}\n`);
    } catch {}
  }
  addToIndex(`- ${today} · ${article.title} · ${editUrl} · ${imagesUrl || "sin imágenes"}`);
  log(`Índice: ${pathToFileURL(INDEX).href}`);
  const anon = /anonimo/i.test(parsed.client) ? " Cliente sin nombre: decide si lo nombras." : "";
  const where = imagesUrl ? ` Imágenes: contenido-blog/${basename(fileURLToPath(imagesUrl))}` : " Sin portadas (mira el registro).";
  notify("Bitácora: borrador listo", `${article.title}.${where}${anon}`);
}

main().catch((e) => {
  log("Error:", e.message);
  notify("Bitácora", `Falló la ejecución nocturna: ${e.message}`);
  process.exitCode = 1;
});
