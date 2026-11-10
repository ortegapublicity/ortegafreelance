#!/usr/bin/env node
// LinkedIn de la bitácora: cuando un post del blog YA ESTÁ PUBLICADO en la
// web, programa su publicación en el perfil de LinkedIn de Raúl con el
// caption que viene en el borrador ("linkedin") y la portada del post.
//
//   node .claude/scripts/linkedin-publicar.mjs --diario     lo que lanza launchd (09:10): prepara y publica lo que toque
//   node .claude/scripts/linkedin-publicar.mjs --preparar   programa los posts recién publicados en el blog
//   node .claude/scripts/linkedin-publicar.mjs --publicar   publica (o avisa) lo que ya toque, sin mirar el blog
//   node .claude/scripts/linkedin-publicar.mjs --estado     muestra la cola
//   node .claude/scripts/linkedin-publicar.mjs --simular <borrador.json>   texto final, sin red
//   node .claude/scripts/linkedin-publicar.mjs --verificar  comprueba el token de LinkedIn
//   node .claude/scripts/linkedin-publicar.mjs --ahora <borrador.json>     publica ese ya (pide token)
//   node .claude/scripts/linkedin-publicar.mjs --marcar <borrador.json> publicado|programado|cancelado
//
// Dos modos, según haya o no token de LinkedIn en el Llavero de macOS
// (servicio "ortegafreelance-linkedin"):
// - SIN token: el día programado avisa con una notificación y deja lista
//   contenido-blog/<post>/linkedin.html (texto para copiar, portada y botón
//   para abrir LinkedIn). Raúl publica o programa a mano.
// - CON token: publica solo con la API oficial «Share on LinkedIn»
//   (ugcPosts + imagen). La API no programa: la hora la pone este script.
//   El token dura 60 días y no se renueva solo; el script avisa antes.
//
// Reglas: nunca publica un post que no esté publicado en el blog, como mucho
// uno por día, y nunca reintenta a ciegas una publicación que pudo haber
// salido (estado "publicando"). El token no se imprime ni se guarda en disco.

import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const BLOG_REPO = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
// BITACORA_DATOS cambia la carpeta de datos (borradores y portadas); solo se
// usa en pruebas, para no tocar la cola real.
const DATA = process.env.BITACORA_DATOS || BLOG_REPO;
const DRAFTS = join(DATA, ".claude/blog/borradores");
const OUT_ROOT = join(DATA, "contenido-blog");
const SITE = "https://ortegafreelance.com";
const KEYCHAIN = "ortegafreelance-linkedin";
const TOKEN_DAYS = 60;

// Días (0 = domingo) y hora local en que sale un post. Martes a jueves por la
// mañana es cuando más actividad profesional hay; se cambia aquí o con las
// variables LINKEDIN_DIAS="1,2,3,4" y LINKEDIN_HORA="08:30".
const DIAS = (process.env.LINKEDIN_DIAS || "2,3,4").split(",").map(Number);
const HORA = process.env.LINKEDIN_HORA || "09:10";

// Solo para pruebas locales contra un servidor simulado: nunca usa el token real.
const MOCK = /^http:\/\/(127\.0\.0\.1|localhost):\d+$/.test(process.env.LINKEDIN_API_BASE || "")
  ? process.env.LINKEDIN_API_BASE
  : "";
const API = MOCK || "https://api.linkedin.com";

const log = (...m) => console.log(`[${new Date().toISOString()}]`, ...m);

function notify(title, message) {
  if (process.env.BITACORA_SIN_AVISOS) return; // pruebas
  const esc = (s) => String(s).replace(/\\/g, "\\\\").replace(/"/g, '\\"').slice(0, 220);
  spawnSync("osascript", ["-e", `display notification "${esc(message)}" with title "${esc(title)}"`]);
}

// El mismo slugify que la web (src/utils/contentfulPosts.js): de ahí sale la URL del post.
export const slugify = (value = "") =>
  value.toString().normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "entrada";

export const postUrl = (titleEs) => `${SITE}/blog/${slugify(titleEs)}`;

// ---------- Caption ----------

export const LINKEDIN_LIMITS = { min: 450, max: 1400, hookMax: 160, tagsMin: 3, tagsMax: 5 };

/** Errores del bloque "linkedin" del borrador: { es, en, hashtags, hashtags_en }. */
export function validateLinkedin(li) {
  if (!li || typeof li !== "object") return ['Falta "linkedin" (caption para LinkedIn: { es, en, hashtags, hashtags_en }).'];
  const errors = [];
  for (const lang of ["es", "en"]) {
    const t = typeof li[lang] === "string" ? li[lang].trim() : "";
    if (!t) {
      errors.push(`linkedin.${lang}: falta el texto.`);
      continue;
    }
    if (t.length < LINKEDIN_LIMITS.min || t.length > LINKEDIN_LIMITS.max)
      errors.push(`linkedin.${lang}: ${t.length} caracteres; debe tener entre ${LINKEDIN_LIMITS.min} y ${LINKEDIN_LIMITS.max}.`);
    const paragraphs = t.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
    if (paragraphs.length < 4) errors.push(`linkedin.${lang}: usa al menos 4 párrafos cortos separados por una línea en blanco.`);
    if ((paragraphs[0] || "").length > LINKEDIN_LIMITS.hookMax)
      errors.push(`linkedin.${lang}: la primera línea (el gancho) pasa de ${LINKEDIN_LIMITS.hookMax} caracteres.`);
    if (!/\?\s*$/.test(paragraphs[paragraphs.length - 1] || ""))
      errors.push(`linkedin.${lang}: termina con una pregunta al lector (invita a comentar).`);
    if (/https?:\/\/|www\./i.test(t)) errors.push(`linkedin.${lang}: sin enlaces; el del artículo lo añade el script.`);
    if (/#\w/.test(t)) errors.push(`linkedin.${lang}: sin hashtags en el texto; van en "hashtags".`);
  }
  for (const key of ["hashtags", "hashtags_en"]) {
    const tags = Array.isArray(li[key]) ? li[key] : [];
    if (tags.length < LINKEDIN_LIMITS.tagsMin || tags.length > LINKEDIN_LIMITS.tagsMax)
      errors.push(`linkedin.${key}: entre ${LINKEDIN_LIMITS.tagsMin} y ${LINKEDIN_LIMITS.tagsMax}.`);
    if (!tags.every((h) => typeof h === "string" && /^[\p{L}\p{N}]{2,30}$/u.test(h)))
      errors.push(`linkedin.${key}: solo letras y números, sin # ni espacios (por ejemplo MarketingDigital).`);
  }
  return errors;
}

/** Texto final que se publica: caption + enlace al artículo + hashtags. */
export function linkedinText(li, lang, url) {
  const cta = lang === "en" ? "Full article:" : "El artículo completo:";
  const tags = lang === "en" ? li.hashtags_en : li.hashtags;
  return `${li[lang].trim()}\n\n${cta} ${url}\n\n${tags.map((h) => `#${h}`).join(" ")}`;
}

// ---------- Cola (estado junto a cada borrador) ----------

function loadItems() {
  if (!existsSync(DRAFTS)) return [];
  return readdirSync(DRAFTS)
    .filter((f) => f.endsWith(".json") && !f.endsWith(".contentful.json"))
    .sort()
    .map((f) => {
      const file = join(DRAFTS, f);
      const stateFile = file.replace(/\.json$/, ".contentful.json");
      try {
        return {
          name: f.replace(/\.json$/, ""),
          file,
          stateFile,
          draft: JSON.parse(readFileSync(file, "utf8")),
          state: existsSync(stateFile) ? JSON.parse(readFileSync(stateFile, "utf8")) : {},
        };
      } catch (e) {
        log(`No pude leer ${f}: ${e.message}`);
        return null;
      }
    })
    .filter(Boolean);
}

const saveState = (item) => writeFileSync(item.stateFile, JSON.stringify(item.state, null, 2) + "\n");

function nextSlot(taken, from = new Date()) {
  const [h, m] = HORA.split(":").map(Number);
  for (let i = 0; i < 90; i++) {
    const c = new Date(from.getFullYear(), from.getMonth(), from.getDate() + i, h, m, 0);
    if (c > from && DIAS.includes(c.getDay()) && !taken.has(c.toLocaleDateString("sv-SE"))) return c;
  }
  return new Date(from.getTime() + 864e5);
}

const fecha = (iso) =>
  new Date(iso).toLocaleString("es", { weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" });

// ---------- Página de ayuda para publicar a mano ----------

function writeHelper(item) {
  const { draft, state, name } = item;
  const dir = join(OUT_ROOT, name);
  mkdirSync(dir, { recursive: true });
  const url = state.linkedin.url;
  const texts = { es: linkedinText(draft.linkedin, "es", url), en: linkedinText(draft.linkedin, "en", url) };
  writeFileSync(join(dir, "linkedin-es.txt"), texts.es + "\n");
  writeFileSync(join(dir, "linkedin-en.txt"), texts.en + "\n");
  const data = JSON.stringify({ texts, url, title: draft.title }).replace(/</g, "\\u003c");
  writeFileSync(
    join(dir, "linkedin.html"),
    `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><title>LinkedIn · ${draft.title.replace(/[<&]/g, "")}</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  body { margin: 0; padding: 32px 16px; background: #f4f6fa; color: #1e2a47; font: 16px/1.55 -apple-system, "Inter", sans-serif; }
  main { max-width: 760px; margin: 0 auto; }
  h1 { font-size: 22px; line-height: 1.2; margin: 0 0 6px; } h2 { font-size: 15px; text-transform: uppercase; letter-spacing: .05em; color: #4a6fa5; margin: 28px 0 8px; }
  p { margin: 0 0 12px; color: #5f6b7a; } ol { padding-left: 20px; color: #5f6b7a; }
  pre { white-space: pre-wrap; background: #fff; border: 1px solid #e6e9ef; border-radius: 14px; padding: 18px; margin: 0 0 10px; font: inherit; color: #1e2a47; }
  button, a.btn { display: inline-block; margin: 0 8px 8px 0; padding: 10px 18px; border-radius: 999px; border: 0; background: #1e2a47; color: #fff; font: inherit; font-weight: 600; cursor: pointer; text-decoration: none; }
  a.btn.alt { background: #0a66c2; } img { max-width: 100%; border-radius: 14px; border: 1px solid #e6e9ef; }
</style></head><body><main>
<h1>${draft.title.replace(/[<&]/g, "")}</h1>
<p>Publicación de LinkedIn de este post. Artículo: <a href="${url}">${url}</a></p>
<ol><li>Pulsa «Copiar y abrir LinkedIn».</li><li>Si el texto no llega escrito, pégalo (⌘V).</li><li>Arrastra la portada de abajo.</li><li>Publica, o usa el reloj para programarla.</li></ol>
<h2>Español</h2><pre id="es"></pre>
<button data-lang="es">Copiar y abrir LinkedIn</button><button data-lang="es" data-only="1">Solo copiar</button>
<h2>English</h2><pre id="en"></pre>
<button data-lang="en">Copy and open LinkedIn</button><button data-lang="en" data-only="1">Copy only</button>
<h2>Portada</h2><p>Arrástrala a la publicación.</p><img src="portada-es.jpg" alt="Portada en español"><p></p><img src="portada-en.jpg" alt="Cover in English">
</main><script>
const D = ${data};
for (const l of ["es", "en"]) document.getElementById(l).textContent = D.texts[l];
async function copy(t) { try { await navigator.clipboard.writeText(t); } catch { const a = document.createElement("textarea"); a.value = t; document.body.appendChild(a); a.select(); document.execCommand("copy"); a.remove(); } }
for (const b of document.querySelectorAll("button")) b.onclick = async () => {
  const t = D.texts[b.dataset.lang]; await copy(t); const old = b.textContent; b.textContent = "Copiado"; setTimeout(() => (b.textContent = old), 1500);
  if (!b.dataset.only) window.open("https://www.linkedin.com/feed/?shareActive=true&text=" + encodeURIComponent(t), "_blank");
};
</script></body></html>
`
  );
  return dir;
}

// ---------- Preparar: programa los posts ya publicados en el blog ----------

function publishedPosts() {
  const r = spawnSync(process.execPath, [join(BLOG_REPO, ".claude/scripts/blog-borrador.mjs"), "--listar", "--json"], {
    encoding: "utf8",
    timeout: 60000,
  });
  if (r.status !== 0) throw new Error((r.stderr || "no pude listar los posts publicados").trim().slice(0, 200));
  return JSON.parse(r.stdout);
}

function preparar() {
  const items = loadItems();
  const published = new Map(publishedPosts().map((p) => [p.id, p]));
  const taken = new Set(
    items.filter((i) => i.state.linkedin?.para).map((i) => new Date(i.state.linkedin.para).toLocaleDateString("sv-SE"))
  );
  let n = 0;
  for (const item of items) {
    const { draft, state } = item;
    const post = state.entryId && published.get(state.entryId);
    if (!post || state.linkedin) continue; // aún sin publicar en el blog, o ya en la cola
    const errors = validateLinkedin(draft.linkedin);
    if (errors.length) {
      log(`«${draft.title}» está publicado pero su caption no sirve: ${errors.join(" | ")}`);
      continue;
    }
    const slot = nextSlot(taken);
    taken.add(slot.toLocaleDateString("sv-SE"));
    state.linkedin = { estado: "programado", para: slot.toISOString(), url: postUrl(post.es || draft.title), intentos: 0 };
    saveState(item);
    const dir = writeHelper(item);
    n++;
    log(`Programado para ${fecha(slot)}: «${draft.title}» · ${pathToFileURL(join(dir, "linkedin.html")).href}`);
    notify("LinkedIn programado", `${fecha(slot)}: ${draft.title}. Texto en contenido-blog/${item.name}/linkedin.html`);
  }
  if (!n) log("Nada nuevo que programar.");
  return n;
}

// ---------- API de LinkedIn (Share on LinkedIn) ----------

function readToken() {
  if (MOCK) return "token-de-prueba";
  try {
    return execFileSync("security", ["find-generic-password", "-s", KEYCHAIN, "-w"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return "";
  }
}

/** Días que le quedan al token, según la fecha en que se guardó en el Llavero. null si no se sabe. */
function tokenDaysLeft() {
  try {
    const out = execFileSync("security", ["find-generic-password", "-s", KEYCHAIN], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
    const m = out.match(/"mdat"<timedate>=\S*\s+"(\d{4})(\d{2})(\d{2})/);
    if (!m) return null;
    const saved = new Date(`${m[1]}-${m[2]}-${m[3]}T00:00:00Z`);
    return Math.round(TOKEN_DAYS - (Date.now() - saved.getTime()) / 864e5);
  } catch {
    return null;
  }
}

class LinkedInError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

async function call(url, { method = "GET", token, json, binary } = {}) {
  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "X-Restli-Protocol-Version": "2.0.0",
      ...(json ? { "Content-Type": "application/json" } : {}),
    },
    body: json ? JSON.stringify(json) : binary,
  });
  const text = await res.text();
  let data = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    /* respuesta sin JSON */
  }
  if (!res.ok) throw new LinkedInError(res.status, `${res.status} ${data.message || data.error_description || text.slice(0, 160) || res.statusText}`);
  return { data, headers: res.headers };
}

async function whoAmI(token) {
  const { data } = await call(`${API}/v2/userinfo`, { token });
  if (!data.sub) throw new LinkedInError(0, "LinkedIn no devolvió el identificador del perfil (faltan los permisos openid y profile).");
  return { author: `urn:li:person:${data.sub}`, name: data.name || "" };
}

/** Publica texto + imagen en el perfil. Devuelve { id, url }. */
async function publishToLinkedIn({ token, text, imagePath, title, onBeforePost }) {
  const { author } = await whoAmI(token);
  const reg = await call(`${API}/v2/assets?action=registerUpload`, {
    method: "POST",
    token,
    json: {
      registerUploadRequest: {
        recipes: ["urn:li:digitalmediaRecipe:feedshare-image"],
        owner: author,
        serviceRelationships: [{ relationshipType: "OWNER", identifier: "urn:li:userGeneratedContent" }],
      },
    },
  });
  const uploadUrl = reg.data.value?.uploadMechanism?.["com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest"]?.uploadUrl;
  const asset = reg.data.value?.asset;
  if (!uploadUrl || !asset) throw new LinkedInError(0, "LinkedIn no devolvió la dirección para subir la imagen.");
  await call(uploadUrl, { method: "PUT", token, binary: readFileSync(imagePath) });

  onBeforePost?.(); // a partir de aquí la publicación puede haber salido aunque algo falle
  const post = await call(`${API}/v2/ugcPosts`, {
    method: "POST",
    token,
    json: {
      author,
      lifecycleState: "PUBLISHED",
      specificContent: {
        "com.linkedin.ugc.ShareContent": {
          shareCommentary: { text },
          shareMediaCategory: "IMAGE",
          media: [{ status: "READY", description: { text: title.slice(0, 200) }, media: asset, title: { text: title.slice(0, 200) } }],
        },
      },
      visibility: { "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC" },
    },
  });
  const id = post.headers.get("x-restli-id") || post.data.id || "";
  return { id, url: id ? `https://www.linkedin.com/feed/update/${id}/` : "" };
}

// ---------- Publicar lo que toque ----------

async function publishItem(item, token) {
  const { draft, state, name } = item;
  const li = state.linkedin;
  const image = join(OUT_ROOT, name, "portada-es.jpg");
  if (!existsSync(image)) throw new LinkedInError(0, `No encuentro la portada (${image}).`);
  const text = linkedinText(draft.linkedin, "es", li.url);
  const previous = li.estado;
  let result;
  try {
    result = await publishToLinkedIn({
      token,
      text,
      imagePath: image,
      title: draft.title,
      onBeforePost: () => {
        li.estado = "publicando";
        li.inicio = new Date().toISOString();
        saveState(item);
      },
    });
  } catch (e) {
    // Un rechazo claro de LinkedIn (4xx) significa que NO se publicó: se puede
    // reintentar. Un corte de red o un 5xx deja la duda: se queda «publicando».
    if (li.estado === "publicando" && e.status >= 400 && e.status < 500) {
      li.estado = previous;
      delete li.inicio;
      saveState(item);
    }
    throw e;
  }
  Object.assign(li, { estado: "publicado", publicadoEn: new Date().toISOString(), id: result.id, postUrl: result.url });
  saveState(item);
  return result;
}

async function publicarPendiente() {
  const items = loadItems();
  const stuck = items.find((i) => i.state.linkedin?.estado === "publicando");
  if (stuck) {
    log(`«${stuck.draft.title}» quedó a medias: revisa en LinkedIn si salió y marca su estado a mano.`);
    notify("LinkedIn: revisar", `No sé si se publicó «${stuck.draft.title}». Míralo en tu perfil antes de que reintente.`);
    return;
  }
  const due = items
    .filter((i) => i.state.linkedin?.estado === "programado" && new Date(i.state.linkedin.para).getTime() <= Date.now() + 5 * 60000)
    .sort((a, b) => a.state.linkedin.para.localeCompare(b.state.linkedin.para))[0];
  if (!due) return log("Hoy no toca publicar nada en LinkedIn.");

  const li = due.state.linkedin;
  writeHelper(due); // por si se editó el caption después de programarlo
  const helper = `contenido-blog/${due.name}/linkedin.html`;
  const token = readToken();
  if (!token) {
    li.estado = "aviso-manual";
    li.avisadoEn = new Date().toISOString();
    saveState(due);
    log(`Sin token de LinkedIn: aviso para publicar a mano «${due.draft.title}» (${helper}).`);
    notify("Hoy toca LinkedIn", `${due.draft.title}. Abre ${helper}: texto listo para copiar y portada.`);
    return;
  }
  try {
    const r = await publishItem(due, token);
    log(`Publicado en LinkedIn: «${due.draft.title}» ${r.url}`);
    notify("Publicado en LinkedIn", due.draft.title);
  } catch (e) {
    if (li.estado === "publicando") {
      log(`Fallo después de enviar la publicación (${e.message}): no reintento.`);
      notify("LinkedIn: revisar", `Pudo publicarse «${due.draft.title}» pero LinkedIn no lo confirmó. Míralo en tu perfil.`);
      return;
    }
    li.intentos = (li.intentos || 0) + 1;
    li.ultimoError = e.message.slice(0, 200);
    const expired = e.status === 401;
    if (expired || li.intentos >= 3) {
      li.estado = "aviso-manual";
      li.avisadoEn = new Date().toISOString();
    }
    saveState(due);
    log(`No se pudo publicar «${due.draft.title}»: ${e.message}`);
    notify(
      expired ? "LinkedIn: token caducado" : "LinkedIn: no se publicó",
      expired ? `Renueva el token (dura 60 días). Hoy publícalo a mano: ${helper}` : `${e.message.slice(0, 90)}. Texto en ${helper}`
    );
  }
}

function avisarCaducidad() {
  if (!readToken() || MOCK) return;
  const left = tokenDaysLeft();
  if (left !== null && left <= 7) {
    log(`El token de LinkedIn caduca en ~${left} días.`);
    notify("LinkedIn: renueva el token", left > 0 ? `Caduca en unos ${left} días.` : "Probablemente ya caducó.");
  }
}

// ---------- Línea de comandos ----------

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const args = process.argv.slice(2);
  const fileArg = args.find((a) => a.endsWith(".json"));
  const findItem = () => {
    const item = loadItems().find((i) => resolve(i.file) === resolve(fileArg || ""));
    if (!item) {
      console.error("Indica un borrador de .claude/blog/borradores/*.json");
      process.exit(64);
    }
    return item;
  };
  try {
    if (args.includes("--estado")) {
      for (const i of loadItems()) {
        const li = i.state.linkedin;
        console.log(`${(li?.estado || (i.draft.linkedin ? "esperando al blog" : "sin caption")).padEnd(18)} ${li?.para ? fecha(li.para).padEnd(34) : "".padEnd(34)} ${i.draft.title.slice(0, 70)}`);
      }
      const t = readToken();
      const left = tokenDaysLeft();
      console.log(`\nToken de LinkedIn: ${t ? `guardado${left !== null ? ` (le quedan ~${left} días)` : ""} → publica solo` : "no hay → avisa para publicar a mano"}`);
    } else if (args.includes("--simular")) {
      const item = findItem();
      const errors = validateLinkedin(item.draft.linkedin);
      if (errors.length) {
        console.error(errors.map((e) => `- ${e}`).join("\n"));
        process.exit(65);
      }
      const text = linkedinText(item.draft.linkedin, args.includes("--en") ? "en" : "es", item.state.linkedin?.url || postUrl(item.draft.title));
      console.log(text + `\n\n— ${text.length} caracteres · imagen: contenido-blog/${item.name}/portada-es.jpg`);
    } else if (args.includes("--verificar")) {
      const token = readToken();
      if (!token) {
        console.log(`No hay token en el Llavero (servicio "${KEYCHAIN}"). Sin token, el sistema avisa y se publica a mano.`);
        process.exit(77);
      }
      const me = await whoAmI(token);
      const left = tokenDaysLeft();
      console.log(`Token válido. Perfil: ${me.name || "(sin nombre)"}${left !== null ? ` · le quedan ~${left} días` : ""}`);
    } else if (args.includes("--ahora")) {
      const item = findItem();
      const token = readToken();
      if (!token) throw new Error("No hay token de LinkedIn en el Llavero.");
      if (!item.state.linkedin) throw new Error("Ese post no está en la cola: ejecuta --preparar (tiene que estar publicado en el blog).");
      if (["publicado", "publicando"].includes(item.state.linkedin.estado)) throw new Error(`Ese post ya está en estado «${item.state.linkedin.estado}».`);
      const r = await publishItem(item, token);
      console.log(`Publicado: ${r.url}`);
    } else if (args.includes("--marcar")) {
      const item = findItem();
      const estado = args.find((a) => ["publicado", "programado", "cancelado"].includes(a));
      if (!estado || !item.state.linkedin) throw new Error("Uso: --marcar <borrador.json> publicado|programado|cancelado (el post tiene que estar en la cola).");
      item.state.linkedin.estado = estado;
      saveState(item);
      console.log(`«${item.draft.title}» → ${estado}`);
    } else if (args.includes("--preparar")) {
      preparar();
    } else if (args.includes("--publicar")) {
      await publicarPendiente();
    } else if (args.includes("--diario")) {
      try {
        preparar();
      } catch (e) {
        log(`No pude revisar los posts publicados: ${e.message}`);
      }
      await publicarPendiente();
      avisarCaducidad();
    } else {
      console.error("Uso: linkedin-publicar.mjs --diario | --preparar | --estado | --simular <borrador> | --verificar | --ahora <borrador> | --marcar <borrador> <estado>");
      process.exit(64);
    }
  } catch (e) {
    console.error(`Error: ${e.message}`);
    process.exit(1);
  }
}
