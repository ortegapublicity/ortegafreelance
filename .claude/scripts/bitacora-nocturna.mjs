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
// 4. Variedad: el título no repite la fórmula de los posts recientes
//    (blog-variedad.mjs) y cada borrador trae su caption de LinkedIn, que
//    linkedin-publicar.mjs programa cuando Raúl publica el post en el blog.
//
// Usa la sesión de Claude Code del usuario (suscripción claude.ai): no hay
// API key. Lo lanza launchd a través de bitacora-arranque.mjs (que pide a
// iCloud los archivos desalojados): ~/Library/LaunchAgents/com.ortegafreelance.bitacora.plist
// Registro: ~/Library/Logs/bitacora-nocturna.log

import { execFileSync, spawnSync } from "node:child_process";
import { appendFileSync, existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { homedir, tmpdir } from "node:os";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { validateArticleDraft, draftSummary } from "../../netlify/functions/lib/articleDraft.js";
import { renderCovers, validateCover } from "./portada-blog.mjs";
import { FAMILIES, bannedFamilies, localDrafts, mergeRecentTitles, titleFamily, varietyProblems } from "./blog-variedad.mjs";
import { validateLinkedin } from "./linkedin-publicar.mjs";
import { renderCarousel, validateMeta } from "./carrusel-meta.mjs";

const BLOG_REPO = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
// BITACORA_DATOS cambia la carpeta de datos (borradores, portadas, índice);
// solo se usa en pruebas, para ensayar sin tocar los borradores reales.
const DATA = process.env.BITACORA_DATOS || BLOG_REPO;
const STATE = join(DATA, ".claude/blog"); // en .gitignore: el repo es público
const DRAFTS = join(STATE, "borradores");
const ACTIVITY = join(STATE, "actividad");
const STAMP_DRAFT = join(STATE, "ultimo-borrador");
const STAMP_RUN = join(STATE, "ultima-ejecucion");
const SCAN_ROOT = join(homedir(), "Documents");
const INDEX = join(DATA, "contenido-blog/INDICE.md"); // fuera de git: enlaces de cada borrador

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
// Modelo fijo para la tarea: si se deja el que esté elegido en el editor, un
// modelo nuevo puede no existir en el `claude` de terminal, que se actualiza
// aparte (pasó el 2026-11-10: «Claude Code 2.1.221 does not support this model»).
const CLAUDE_MODEL = process.env.BITACORA_MODELO || "opus";

const args = process.argv.slice(2);
const force = args.includes("--force");
const dryRun = args.includes("--dry-run");

const today = new Date().toLocaleDateString("sv-SE"); // AAAA-MM-DD en hora local
const log = (...m) => console.log(`[${new Date().toISOString()}]`, ...m);

function notify(title, message) {
  if (process.env.BITACORA_SIN_AVISOS) return; // pruebas
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

// --- iCloud ---------------------------------------------------------------
// ~/Documents se sincroniza con iCloud, que desaloja lo que no se usa (con el
// disco lleno, casi todo lo interno de .git). Un proceso de fondo no puede
// leer un archivo desalojado («error -11»), así que antes de `git log` se
// pide la descarga con `brctl download`, archivo por archivo (por carpeta no
// funciona), y se espera. Para no bajar de más, solo en repos con movimiento.
const GIT_WAIT_MS = 5 * 60 * 1000;

function evictedFiles(dir) {
  const r = spawnSync("find", [dir, "-type", "f", "-flags", "+dataless"], { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  return r.status === 0 ? r.stdout.split("\n").filter(Boolean) : [];
}

function materialize(dir, label) {
  let files = evictedFiles(dir);
  if (!files.length) return true;
  log(`${label}: ${files.length} archivos desalojados por iCloud; pido la descarga.`);
  spawnSync("xargs", ["-0", "-n", "1", "-P", "8", "/usr/bin/brctl", "download"], { input: files.join("\0") });
  const deadline = Date.now() + GIT_WAIT_MS;
  while (Date.now() < deadline) {
    spawnSync("/bin/sleep", ["2"]);
    files = evictedFiles(dir);
    if (!files.length) return true;
  }
  log(`${label}: ${files.length} archivos siguen sin descargarse.`);
  return false;
}

// ¿Hubo commits, pulls o cambios de rama desde `since`? Lo dice la fecha del
// reflog, que se puede consultar aunque el archivo esté desalojado.
function touchedSince(repo, since) {
  const limit = new Date(since).getTime() - 864e5;
  for (const f of ["logs/HEAD", "HEAD", "index"]) {
    try {
      if (statSync(join(repo, ".git", f)).mtimeMs >= limit) return true;
    } catch {
      /* no existe */
    }
  }
  return false;
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
    if (!touchedSince(repo, since)) continue; // sin movimiento: ni se descarga ni se lee
    materialize(join(repo, ".git"), basename(repo));
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
      log(`No pude leer el historial de ${basename(repo)} (¿archivos de git desalojados por iCloud?). Lo salto.`);
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

// Tendencias del día (Google Trends, RSS público y gratuito) para el gancho
// del carrusel de Instagram/Facebook. Si falla, el carrusel usa un tema de
// temporada. Solo da temas: decidir si alguno sirve (y si es seguro) es de Claude.
async function trendsFeed() {
  const out = [];
  for (const geo of ["VE", "US"]) {
    try {
      const res = await fetch(`https://trends.google.com/trending/rss?geo=${geo}`, {
        headers: { "user-agent": "Mozilla/5.0" },
        signal: AbortSignal.timeout(20000),
      });
      const xml = await res.text();
      const decode = (t) => t.replace(/<!\[CDATA\[|\]\]>/g, "").replace(/&amp;/g, "&").replace(/&#39;/g, "'").replace(/&quot;/g, '"').trim();
      for (const item of (xml.match(/<item>[\s\S]*?<\/item>/g) || []).slice(0, 15)) {
        const title = decode((item.match(/<title>([\s\S]*?)<\/title>/) || [])[1] || "");
        const news = decode((item.match(/<ht:news_item_title>([\s\S]*?)<\/ht:news_item_title>/) || [])[1] || "");
        const traffic = (item.match(/<ht:approx_traffic>([\s\S]*?)<\/ht:approx_traffic>/) || [])[1] || "";
        if (title) out.push(`- [${geo}, ${traffic}] ${title}${news ? ` · titular: ${news}` : ""}`);
      }
    } catch (e) {
      log(`No pude leer las tendencias de ${geo}: ${e.message}`);
    }
  }
  return out.join("\n");
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

// Títulos recientes (borradores locales + publicados), del más nuevo al más viejo.
function recentContext(posts = []) {
  const drafts = localDrafts(DRAFTS);
  return { drafts, titles: mergeRecentTitles(drafts, posts.map((p) => p.es)) };
}

function buildPrompt(activity, posts = [], trends = "") {
  const plantilla = readFileSync(join(BLOG_REPO, ".claude/docs/plantilla-blog.md"), "utf8");
  const titles = previousTitles();
  const recent = recentContext(posts);
  const banned = bannedFamilies(recent.titles);
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

# TÍTULOS RECIENTES Y SU FÓRMULA (del más nuevo al más viejo): el tuyo tiene que sonar distinto
${recent.titles.slice(0, 15).map((t) => `- [${FAMILIES[titleFamily(t)]}] ${t}`).join("\n") || "- (ninguno)"}
Fórmulas PROHIBIDAS para este título, en español y en inglés: ${banned.length ? banned.map((f) => FAMILIES[f]).join("; ") : "ninguna"}.
Tampoco repitas la sección «La regla: …» ni el cierre «ahí es donde empezaría a auditar/revisar»: ya se usaron. Sigue la sección «Variedad» de la plantilla.

# TENDENCIAS DE HOY (Google Trends; solo para el gancho del carrusel de Instagram/Facebook)
${trends || "- (no disponibles: usa un tema de temporada o cultural que conozcas y que siga vigente)"}
Usa como mucho UNA, y solo si conecta de verdad con la lección del post y es segura (sección «Instagram y Facebook» de la plantilla): deportes, cultura, tecnología, lanzamientos o temporadas. Nunca tragedias, desastres, muertes, crímenes, política, conflictos ni personas en una polémica. Nunca dibujes ni nombres como si respaldaran el post a personas reales, equipos o marcas. Si ninguna sirve, usa un tema de temporada.

# ACTIVIDAD RECIENTE (git log, solo lectura)
${activity}

# QUÉ DEVOLVER
- Elige el proyecto o la pieza con más decisión contable. Un solo post.
- Si no hay una decisión que merezca un post (solo arreglos menores, textos, limpieza, configuración interna, o temas ya cubiertos), responde únicamente:
ESPERAR: <motivo en una frase>
- Si hay material, responde con una primera línea
CLIENTE: <nombrado|anonimo|propio> · <proyecto>
y después el artículo como un único bloque \`\`\`json con title, excerpt, body, cover, recommended, linkedin, meta y en, según el formato de la plantilla. Nada más.
- "meta" es el carrusel de Instagram/Facebook (sección «Instagram y Facebook» de la plantilla): tendencia, 4 a 6 slides (gancho con svg 1080×760 que dibuja LA TENDENCIA, no el tema del post, con algún guiño al tema; puntos; cierre hacia «Mis Blogs»), caption con palabras clave al inicio, hashtags y alt.
- "linkedin" es la publicación de LinkedIn que invita a leer el post (sección «LinkedIn» de la plantilla): { es, en, hashtags, hashtags_en }. Sin enlaces ni hashtags dentro del texto; termina con una pregunta al lector.
- "en" es la versión completa en inglés: { title, excerpt, body } con la misma estructura de bloques y los mismos títulos de sección traducidos. Traduce con naturalidad (inglés de negocio, segunda persona), no palabra por palabra.
- "recommended": lista con los ids de 2 posts publicados de la lista de arriba, los más relacionados con el tema.
- "cover" son los datos de la portada (ver la sección Portada de la plantilla): title_en (el título en inglés) y svg, una ILUSTRACIÓN PROPIA del tema del post: el contenido de un <svg viewBox="0 0 1008 945"> SIN la etiqueta <svg> (empieza con <defs> o con un <rect> de fondo que cubra 1008×945). Estilo plano y moderno, con profundidad suave (sombras con feDropShadow, brillos con feGaussianBlur), fondo propio a sangre y objetos reconocibles del tema (pantallas, paneles, documentos, gráficos, personas en silueta, objetos del sector). Varía la composición y la paleta de fondo según el tema; acentos de la marca: #3a7bff, #7b2cbf, #ff6b35, #ffd60a, #26d1c4. Sin texto ni números dentro (la portada se usa en dos idiomas). Prohibido: <script>, <style>, <image>, <foreignObject>, <a>, atributos on…= y URLs; solo href="#id" propios. Máximo 60.000 caracteres. NO copies la ruta de nodos numerados.
- No inventes cifras, resultados ni testimonios: si el historial no los trae, di qué se va a medir.
- Nunca incluyas nombres de variables de entorno, claves, correos, teléfonos, IDs, rutas de paneles internos ni nombres de repos.`;
}

// Reintenta los fallos pasajeros (el 2026-11-07 la sesión devolvió un 403
// de autenticación a las 23:00 y a la noche siguiente funcionó sin tocar nada).
function runClaude(input, resumeId) {
  for (let attempt = 1; ; attempt++) {
    try {
      return runClaudeOnce(input, resumeId);
    } catch (e) {
      const transient = /authenticate|\b(403|429|5\d\d)\b|overloaded|timed? ?out|ETIMEDOUT|ECONNRESET/i.test(e.message);
      if (!transient || attempt >= 3) throw e;
      log(`Claude falló (${e.message.slice(0, 120)}). Reintento ${attempt} de 2 en 90 s…`);
      spawnSync("/bin/sleep", ["90"]);
    }
  }
}

function runClaudeOnce(input, resumeId) {
  const claudeBin = process.env.CLAUDE_BIN || join(homedir(), ".local/bin/claude");
  const cliArgs = [
    "-p",
    "--model", CLAUDE_MODEL,
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

function checkAll(article, recent = { drafts: [], titles: [] }) {
  const a = article ? validateArticleDraft(article) : { ok: false, errors: ["No llegó el artículo."] };
  const e = article?.en ? validateArticleDraft(article.en) : { ok: false, errors: ['Falta "en" (la versión en inglés).'] };
  const coverErrors = article ? validateCover(article.cover) : [];
  const linkedinErrors = article ? validateLinkedin(article.linkedin) : [];
  const metaErrors = article ? validateMeta(article.meta) : [];
  const variety = article ? varietyProblems(article, { recentTitles: recent.titles, recentDrafts: recent.drafts }) : [];
  const errors = [
    ...(a.ok ? [] : a.errors),
    ...(e.ok ? [] : e.errors.map((x) => `[en] ${x}`)),
    ...coverErrors,
    ...linkedinErrors,
    ...metaErrors,
    ...variety,
  ];
  return errors.length
    ? { ok: false, errors }
    : {
        ok: true,
        article: {
          ...a.article,
          cover: article.cover,
          ...(Array.isArray(article.recommended) ? { recommended: article.recommended.slice(0, 3) } : {}),
          linkedin: article.linkedin,
          meta: article.meta,
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
  const recent = recentContext(posts);
  const trends = await trendsFeed();
  log(`Tendencias del día: ${trends ? trends.split("\n").length : 0}`);
  let { text, sessionId } = runClaude(buildPrompt(activity, posts, trends));
  let parsed = parseReply(text);
  if (parsed.wait) {
    log(`Claude decidió esperar: ${parsed.wait}`);
    return;
  }

  let check = parsed.article ? checkAll(parsed.article, recent) : { ok: false, errors: [parsed.error] };
  if (!check.ok) {
    log("Primera versión rechazada, pido corrección:", check.errors.join(" | "));
    ({ text } = runClaude(
      `El validador rechazó el artículo:\n- ${check.errors.join("\n- ")}\n\nDevuelve de nuevo la línea CLIENTE y el artículo completo corregido en un único bloque \`\`\`json.`,
      sessionId
    ));
    parsed = parseReply(text);
    check = parsed.article ? checkAll(parsed.article, recent) : { ok: false, errors: [parsed.error] };
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

  // Carrusel de Instagram/Facebook. Si falla, el borrador sigue adelante.
  try {
    const { dir } = renderCarousel(file);
    log(`Carrusel: ${pathToFileURL(join(dir, "meta.html")).href}`);
  } catch (e) {
    log("No se pudo generar el carrusel:", e.message);
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
  notify("Bitácora: borrador listo", `${article.title}.${where}${anon} Al publicarlo en Contentful se programa su LinkedIn.`);
}

main().catch((e) => {
  log("Error:", e.message);
  notify("Bitácora", `Falló la ejecución nocturna: ${e.message}`);
  process.exitCode = 1;
});
