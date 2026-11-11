#!/usr/bin/env node
// Avisos de caducidad de los dos tokens de la bitácora, con los pasos exactos
// para renovarlos, para que Raúl no tenga que recordar cómo se hace.
//
//   node .claude/scripts/tokens.mjs --estado
//   node .claude/scripts/tokens.mjs --contentful-caduca AAAA-MM-DD   (al renovar el de Contentful)
//   node .claude/scripts/tokens.mjs --revisar                        (lo llama linkedin-publicar.mjs --diario, 9:10)
//   node .claude/scripts/tokens.mjs --pagina                         (abre la página de renovación)
//
// Los tokens:
// - LinkedIn: en el Llavero de macOS ("ortegafreelance-linkedin"); dura 60
//   días y no se renueva solo. Se guarda con linkedin-token.mjs.
// - Contentful (CMA, el que se llamó "claude-post"): en la variable
//   CONTENTFUL_MANAGEMENT_TOKEN de Netlify. Lo usan /api/blog-draft,
//   /api/blog-asset y /api/blog-posts. Contentful avisa por correo un día
//   antes de que caduque. Su fecha de caducidad no se puede leer desde aquí:
//   se apunta a mano en .claude/blog/caducidades.json con --contentful-caduca.
//
// Cuando falta una semana o menos (o el token ya falla), cada mañana llega
// una notificación con el comando a ejecutar y se abre
// contenido-blog/renovar-tokens.html con los pasos (como mucho una vez al día).
// Nunca lee ni muestra el valor de un token.

import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const BLOG_REPO = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const DATA = process.env.BITACORA_DATOS || BLOG_REPO;
const STATE_FILE = join(DATA, ".claude/blog/caducidades.json");
const PAGE = join(DATA, "contenido-blog/renovar-tokens.html");
const WARN_DAYS = 7;
const LINKEDIN_DAYS = 60;

export const COMANDO_LINKEDIN = "cd ~/Documents/ortegafreelance-web && node .claude/scripts/linkedin-token.mjs";
export const COMANDO_CONTENTFUL_FECHA = "cd ~/Documents/ortegafreelance-web && node .claude/scripts/tokens.mjs --contentful-caduca AAAA-MM-DD";

const log = (...m) => console.log(`[${new Date().toISOString()}] tokens:`, ...m);

function notify(title, message) {
  if (process.env.BITACORA_SIN_AVISOS) return;
  const esc = (s) => String(s).replace(/\\/g, "\\\\").replace(/"/g, '\\"').slice(0, 240);
  spawnSync("osascript", ["-e", `display notification "${esc(message)}" with title "${esc(title)}"`]);
}

function loadState() {
  try {
    return JSON.parse(readFileSync(STATE_FILE, "utf8"));
  } catch {
    return {};
  }
}
const saveState = (s) => {
  mkdirSync(dirname(STATE_FILE), { recursive: true });
  writeFileSync(STATE_FILE, JSON.stringify(s, null, 2) + "\n");
};

const daysUntil = (iso) => Math.ceil((new Date(`${iso}T23:59:59`).getTime() - Date.now()) / 864e5);

/** Días que le quedan al token de LinkedIn (por la fecha en que se guardó). null si no hay. */
export function linkedinDaysLeft() {
  try {
    const out = execFileSync("security", ["find-generic-password", "-s", "ortegafreelance-linkedin"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });
    const m = out.match(/"mdat"<timedate>=\S*\s+"(\d{4})(\d{2})(\d{2})/);
    if (!m) return null;
    return Math.round(LINKEDIN_DAYS - (Date.now() - new Date(`${m[1]}-${m[2]}-${m[3]}T00:00:00Z`).getTime()) / 864e5);
  } catch {
    return null;
  }
}

export function contentfulDaysLeft() {
  const s = loadState();
  return s.contentful ? daysUntil(s.contentful) : null;
}

/** Página con los pasos para renovar cada token. */
export function writeRenewalPage() {
  const li = linkedinDaysLeft();
  const cf = contentfulDaysLeft();
  const when = (d) => (d === null ? "fecha desconocida" : d > 1 ? `caduca en ${d} días` : d === 1 ? "caduca mañana" : d === 0 ? "caduca hoy" : "ya caducó");
  const code = (t) => `<pre><code>${t.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</code></pre><button data-copy="${t.replace(/"/g, "&quot;")}">Copiar</button>`;
  mkdirSync(dirname(PAGE), { recursive: true });
  writeFileSync(
    PAGE,
    `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><title>Renovar tokens · bitácora</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  body { margin: 0; padding: 32px 16px; background: #f4f6fa; color: #1e2a47; font: 16px/1.6 -apple-system, "Inter", sans-serif; }
  main { max-width: 760px; margin: 0 auto; } h1 { font-size: 24px; margin: 0 0 6px; }
  section { background: #fff; border: 1px solid #e6e9ef; border-radius: 16px; padding: 20px 22px; margin: 20px 0; }
  h2 { font-size: 19px; margin: 0 0 4px; } .when { font-weight: 700; color: #4a6fa5; margin: 0 0 12px; }
  ol { padding-left: 22px; } li { margin: 0 0 8px; } a { color: #0a66c2; }
  pre { background: #1e2a47; color: #fff; padding: 12px 14px; border-radius: 10px; overflow-x: auto; margin: 8px 0 6px; font-size: 14px; white-space: pre-wrap; word-break: break-all; }
  button { padding: 6px 14px; border-radius: 999px; border: 0; background: #1e2a47; color: #fff; font: inherit; font-size: 14px; cursor: pointer; }
  .note { color: #5f6b7a; font-size: 14px; }
</style></head><body><main>
<h1>Renovar los tokens de la bitácora</h1>
<p class="note">Actualizado ${new Date().toLocaleString("es")}. Ningún agente maneja estos tokens: los creas y guardas tú.</p>

<section>
<h2>LinkedIn: publicar en tu perfil</h2>
<p class="when">${li === null ? "No hay token guardado" : when(li)} · dura 60 días</p>
<ol>
<li>Abre el generador de tokens: <a href="https://www.linkedin.com/developers/tools/oauth/token-generator">linkedin.com/developers/tools/oauth/token-generator</a></li>
<li>Elige tu app, marca <b>openid</b>, <b>profile</b> y <b>w_member_social</b>, pulsa «Request access token» y acepta.</li>
<li>Copia el token (⌘C).</li>
<li>En la Terminal, ejecuta esto y, cuando lo pida, pega el token y pulsa Enter (no se ve al pegarlo):
${code(COMANDO_LINKEDIN)}</li>
<li>Debe responder «Token válido». No hace falta nada más.</li>
</ol>
<p class="note">No uses <code>security add-generic-password -w</code>: corta el token a 128 caracteres.</p>
</section>

<section>
<h2>Contentful: crear los borradores del blog</h2>
<p class="when">${cf === null ? "Fecha no apuntada" : when(cf)}</p>
<ol>
<li>Abre los tokens de Contentful: <a href="https://app.contentful.com/account/profile/cma_tokens">app.contentful.com → tu perfil → CMA tokens</a></li>
<li>«Create personal access token». Nombre: <b>claude-post-${new Date().getFullYear()}</b>. Elige la caducidad más larga que permita y <b>apunta la fecha</b>. Copia el token (solo se muestra una vez).</li>
<li>En Netlify: proyecto <b>ortegafreelance</b> → Project configuration → Environment variables → <b>CONTENTFUL_MANAGEMENT_TOKEN</b> → Edit → pega el token nuevo → Save.</li>
<li>Las funciones solo leen el valor nuevo tras un deploy: Deploys → <b>Trigger deploy → Deploy project</b> (cuesta 15 créditos).</li>
<li>Cuando termine el deploy, apunta la fecha de caducidad para que te avise a tiempo (cambia AAAA-MM-DD):
${code(COMANDO_CONTENTFUL_FECHA)}</li>
<li>Comprueba que funciona (debe listar tus posts publicados):
${code("cd ~/Documents/ortegafreelance-web && node .claude/scripts/blog-borrador.mjs --listar")}</li>
<li>En Contentful puedes borrar el token viejo cuando el nuevo funcione.</li>
</ol>
</section>
</main><script>
for (const b of document.querySelectorAll("button[data-copy]")) b.onclick = async () => {
  try { await navigator.clipboard.writeText(b.dataset.copy); } catch { const t = document.createElement("textarea"); t.value = b.dataset.copy; document.body.appendChild(t); t.select(); document.execCommand("copy"); t.remove(); }
  b.textContent = "Copiado"; setTimeout(() => (b.textContent = "Copiar"), 1500);
};
</script></body></html>
`
  );
  return PAGE;
}

/** Abre la página como mucho una vez al día (para no molestar). */
function openPageOncePerDay(state) {
  const today = new Date().toLocaleDateString("sv-SE");
  if (state.paginaAbierta === today || process.env.BITACORA_SIN_AVISOS) return;
  spawnSync("open", [PAGE]);
  state.paginaAbierta = today;
  saveState(state);
}

/**
 * Revisa los dos tokens y avisa si toca renovar. `problemas` permite que quien
 * llama informe de un fallo real (por ejemplo, un 401 de Contentful).
 */
export function revisarTokens(problemas = {}) {
  const state = loadState();
  const li = linkedinDaysLeft();
  const cf = contentfulDaysLeft();
  const urgent = [];

  if (problemas.linkedin || (li !== null && li <= WARN_DAYS)) {
    const msg = problemas.linkedin ? "LinkedIn rechaza el token" : li > 0 ? `caduca en ${li} días` : "caducó";
    log(`LinkedIn: ${msg}.`);
    notify(`LinkedIn: renueva el token (${msg})`, `En la Terminal: ${COMANDO_LINKEDIN}`);
    urgent.push("linkedin");
  }
  if (problemas.contentful || (cf !== null && cf <= WARN_DAYS)) {
    const msg = problemas.contentful ? "Contentful rechaza el token" : cf > 0 ? `caduca en ${cf} días` : "caducó";
    log(`Contentful: ${msg}.`);
    notify(`Contentful: renueva el token (${msg})`, "Pasos en contenido-blog/renovar-tokens.html (se abre ahora).");
    urgent.push("contentful");
  }
  writeRenewalPage();
  if (urgent.length) openPageOncePerDay(state);
  return { linkedin: li, contentful: cf, urgent };
}

// ---------- Línea de comandos ----------

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const args = process.argv.slice(2);
  if (args.includes("--contentful-caduca")) {
    const date = args[args.indexOf("--contentful-caduca") + 1] || "";
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || isNaN(new Date(date))) {
      console.error("Uso: --contentful-caduca AAAA-MM-DD (la fecha en que caduca el token nuevo de Contentful)");
      process.exit(64);
    }
    const s = loadState();
    s.contentful = date;
    delete s.paginaAbierta;
    saveState(s);
    writeRenewalPage();
    console.log(`Apuntado: el token de Contentful caduca el ${date} (${daysUntil(date)} días). Te avisaré una semana antes.`);
  } else if (args.includes("--revisar")) {
    revisarTokens();
  } else if (args.includes("--pagina")) {
    spawnSync("open", [writeRenewalPage()]);
  } else {
    const li = linkedinDaysLeft();
    const cf = contentfulDaysLeft();
    console.log(`LinkedIn:   ${li === null ? "sin token" : `le quedan ~${li} días`}`);
    console.log(`Contentful: ${cf === null ? "fecha no apuntada (usa --contentful-caduca AAAA-MM-DD)" : `le quedan ${cf} días`}`);
    console.log(`Pasos para renovar: ${pathToFileURL(writeRenewalPage()).href}`);
  }
}
