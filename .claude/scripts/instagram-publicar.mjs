#!/usr/bin/env node
// Instagram de la bitácora: publica el carrusel de un post del blog
// (bloque "meta" del borrador, imágenes de carrusel-meta.mjs) en
// @ortegafreelance con la API oficial «Instagram API with Instagram Login».
//
//   node .claude/scripts/instagram-publicar.mjs --verificar
//   node .claude/scripts/instagram-publicar.mjs --ahora <borrador.json>
//   node .claude/scripts/instagram-publicar.mjs --refrescar      renueva el token (lo hace tokens.mjs solo)
//   node .claude/scripts/instagram-publicar.mjs --marcar <borrador.json> publicado|listo|cancelado
//   node .claude/scripts/instagram-publicar.mjs --historia <borrador.json>  publica su historia ya
//   node .claude/scripts/instagram-publicar.mjs --reel <borrador.json>      publica su reel ya
//   node .claude/scripts/instagram-publicar.mjs --medir      guarda me gusta y comentarios (la agenda los usa)
//
// Lo llama la tarea diaria (linkedin-publicar.mjs --diario) el mismo día que
// sale el LinkedIn del post. Sin token, esa tarea solo avisa con el carrusel
// listo para publicarlo a mano (contenido-blog/<post>/meta/meta.html).
//
// Dos tipos de token (Meta cambió el panel en 2026: las apps nuevas solo
// ofrecen el «inicio de sesión unificado»). El script detecta cuál es:
// - Instagram Login: host graph.instagram.com, ID con GET /me?fields=user_id.
// - Unificado: host graph.facebook.com, ID con
//   GET /me/assigned_instagram_accounts?fields=id,username; permiso
//   instagram_content_publish. Caducidad con /debug_token.
// Flujo (documentación de Meta, 2026-11-11):
// 1. Las imágenes tienen que estar en una URL pública: se suben a Contentful
//    con /api/blog-asset (devuelve la URL de images.ctfassets.net).
// 2. POST /<IG_ID>/media por imagen (image_url, is_carousel_item, alt_text).
// 3. POST /<IG_ID>/media con media_type=CAROUSEL, children y caption.
// 4. Esperar a status_code=FINISHED y POST /<IG_ID>/media_publish.
// Token: Llavero de macOS, servicio "ortegafreelance-instagram" (se guarda con
// instagram-token.mjs). Dura 60 días y se renueva por API sin intervención.

import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { metaCaption, renderCarousel, renderReel, renderStory } from "./carrusel-meta.mjs";

const BLOG_REPO = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const DATA = process.env.BITACORA_DATOS || BLOG_REPO;
const DRAFTS = join(DATA, ".claude/blog/borradores");
const OUT_ROOT = join(DATA, "contenido-blog");
const KEYCHAIN = "ortegafreelance-instagram";
const VERSION = process.env.INSTAGRAM_API_VERSION || "v27.0";

// Solo para pruebas locales contra servidores simulados.
const isLocal = (u) => /^http:\/\/(127\.0\.0\.1|localhost):\d+$/.test(u || "");
const MOCK_IG = isLocal(process.env.INSTAGRAM_API_BASE) ? process.env.INSTAGRAM_API_BASE : "";
const MOCK_FB = isLocal(process.env.FACEBOOK_API_BASE) ? process.env.FACEBOOK_API_BASE : "";
const MOCK_BLOG = isLocal(process.env.BLOG_API_BASE) ? process.env.BLOG_API_BASE : "";
const HOSTS = {
  instagram: `${MOCK_IG || "https://graph.instagram.com"}/${VERSION}`,
  unificado: `${MOCK_FB || "https://graph.facebook.com"}/${VERSION}`,
};
let MODE = "instagram"; // lo fija whoAmI() según el token
const BLOG = MOCK_BLOG || "https://ortegafreelance.com";
const POLL_MS = Number(process.env.INSTAGRAM_POLL_MS || 15000);
// ID de @ortegafreelance (público, sale en el panel de Meta). Hace falta
// porque con el token de «usuario del sistema» /me/assigned_instagram_accounts
// devuelve una lista vacía aunque la cuenta sea accesible (2026-11-11).
const ACCOUNT_ID = process.env.INSTAGRAM_ACCOUNT_ID || "17841448821036371";

const log = (...m) => console.log(`[${new Date().toISOString()}] instagram:`, ...m);
function notify(title, message) {
  if (process.env.BITACORA_SIN_AVISOS) return;
  const esc = (s) => String(s).replace(/\\/g, "\\\\").replace(/"/g, '\\"').slice(0, 220);
  spawnSync("osascript", ["-e", `display notification "${esc(message)}" with title "${esc(title)}"`]);
}

function keychain(service) {
  try {
    return execFileSync("security", ["find-generic-password", "-s", service, "-w"], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
  } catch {
    return "";
  }
}
export const readToken = () => (MOCK_IG || MOCK_FB ? "token-de-prueba" : keychain(KEYCHAIN));
const blogSecret = () => (MOCK_BLOG ? "frase-de-prueba" : keychain("ortegafreelance-blog-admin"));

export class InstagramError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

// El token va como parámetro (así lo documenta Meta). Nunca se imprime la URL.
async function ig(path, { method = "GET", token, params = {}, mode = MODE } = {}) {
  const base = HOSTS[mode];
  const qs = new URLSearchParams({ ...params, access_token: token });
  const res = await fetch(method === "GET" ? `${base}${path}?${qs}` : `${base}${path}`, {
    method,
    ...(method === "GET" ? {} : { headers: { "content-type": "application/x-www-form-urlencoded" }, body: qs }),
  });
  const text = await res.text();
  let data = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    /* sin JSON */
  }
  if (!res.ok || data.error) {
    const e = data.error || {};
    throw new InstagramError(res.status, `${res.status} ${e.message || text.slice(0, 160) || res.statusText}`);
  }
  return data;
}

export async function whoAmI(token) {
  // 1) Token de «Instagram Login».
  try {
    const d = await ig("/me", { token, params: { fields: "user_id,username" }, mode: "instagram" });
    const me = Array.isArray(d.data) ? d.data[0] : d;
    if (me?.user_id) {
      MODE = "instagram";
      return { id: me.user_id, username: me.username || "", mode: MODE };
    }
  } catch {
    /* no es de Instagram Login: probamos el unificado */
  }
  // 2) Token del «inicio de sesión unificado» (graph.facebook.com).
  const who = await ig("/me", { token, params: { fields: "id,name" }, mode: "unificado" });
  const systemUser = /system user/i.test(who.name || "");
  const d = await ig("/me/assigned_instagram_accounts", { token, params: { fields: "id,username" }, mode: "unificado" });
  const list = Array.isArray(d.data) ? d.data : [];
  let me = list.find((a) => a.username === "ortegafreelance") || list[0];
  if (!me?.id) {
    // Lista vacía con el token de usuario del sistema: se usa el ID conocido.
    try {
      me = await ig(`/${ACCOUNT_ID}`, { token, params: { fields: "id,username" }, mode: "unificado" });
    } catch {
      me = null;
    }
  }
  if (!me?.id) throw new InstagramError(0, "El token no llega a la cuenta de Instagram (¿falta el permiso instagram_basic o asignar la cuenta en la configuración?).");
  MODE = "unificado";
  return { id: me.id, username: me.username || "", mode: MODE, systemUser };
}

/**
 * Chequeo de salud (solo lectura): el token llega a la cuenta y conserva el
 * permiso de publicar (leer el cupo diario exige instagram_content_publish).
 * Lo usa tokens.mjs cada mañana para avisar ANTES de que falle una publicación.
 */
export async function checkPublishing() {
  const token = readToken();
  if (!token) return { ok: false, motivo: "no hay token" };
  try {
    const me = await whoAmI(token);
    const q = await ig(`/${me.id}/content_publishing_limit`, { token, params: { fields: "config,quota_usage" } });
    const c = q.data?.[0] || {};
    return { ok: true, usadas: c.quota_usage ?? 0, total: c.config?.quota_total ?? 100, mode: me.mode };
  } catch (e) {
    return { ok: false, motivo: e.message.slice(0, 160) };
  }
}

/** Caducidad y permisos del token unificado (debug_token). null si no se puede saber. */
export async function tokenInfo(token) {
  try {
    const d = await ig("/debug_token", { token, params: { input_token: token }, mode: "unificado" });
    const t = d.data || {};
    return {
      expira: t.expires_at ? new Date(t.expires_at * 1000).toISOString().slice(0, 10) : t.expires_at === 0 ? "nunca" : null,
      permisos: t.scopes || [],
      tipo: t.type || "",
    };
  } catch {
    return null;
  }
}

/** Renueva el token largo por 60 días más. Lo guarda en el Llavero sin mostrarlo. */
export async function refreshToken() {
  const token = readToken();
  if (!token) throw new InstagramError(0, "No hay token de Instagram en el Llavero.");
  // El token unificado no se renueva con ig_refresh_token: su caducidad la
  // vigila tokens.mjs con la fecha que da debug_token.
  const me = await whoAmI(token);
  if (me.mode === "unificado") return null;
  const res = await fetch(`${MOCK_IG || "https://graph.instagram.com"}/refresh_access_token?${new URLSearchParams({ grant_type: "ig_refresh_token", access_token: token })}`);
  const d = await res.json().catch(() => ({}));
  if (!res.ok || !d.access_token) throw new InstagramError(res.status, `${res.status} ${d.error?.message || "no se pudo renovar"}`);
  if (!MOCK_IG) {
    const quoted = `"${d.access_token.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
    const r = spawnSync("/usr/bin/security", ["-i"], {
      input: `add-generic-password -U -a ${process.env.USER || "raul"} -s ${KEYCHAIN} -w ${quoted}\n`,
      encoding: "utf8",
    });
    if (r.status !== 0) throw new InstagramError(0, "Renovado, pero el Llavero no aceptó el token nuevo.");
  }
  return Math.round((d.expires_in || 0) / 86400);
}

// ---------- Estado (junto a cada borrador) ----------

function loadItem(file) {
  const stateFile = file.replace(/\.json$/, ".contentful.json");
  return {
    name: basename(file).replace(/\.json$/, ""),
    file,
    stateFile,
    draft: JSON.parse(readFileSync(file, "utf8")),
    state: existsSync(stateFile) ? JSON.parse(readFileSync(stateFile, "utf8")) : {},
  };
}
const saveState = (item) => writeFileSync(item.stateFile, JSON.stringify(item.state, null, 2) + "\n");

// ---------- Imágenes públicas (Contentful) ----------

async function publicUrls(item) {
  const m = (item.state.meta ||= {});
  const dir = join(OUT_ROOT, item.name, "meta");
  if (!existsSync(join(dir, "slide-1.jpg"))) renderCarousel(item.file);
  const slides = readdirSync(dir).filter((f) => /^slide-\d+\.jpg$/.test(f)).sort((a, b) => parseInt(a.slice(6)) - parseInt(b.slice(6)));
  if (Array.isArray(m.urls) && m.urls.length === slides.length && m.urls.every(Boolean)) return m.urls;
  const urls = [];
  for (const [i, f] of slides.entries()) {
    urls.push(await uploadPublic(join(dir, f), `Instagram · ${item.draft.title} · ${i + 1}`, `${item.name.replace(/[^a-z0-9-]/gi, "-").slice(0, 70)}-ig-${i + 1}.jpg`, `la imagen ${i + 1}`));
  }
  m.urls = urls;
  saveState(item);
  return urls;
}

/** Sube un JPG a Contentful (en borrador) y devuelve su URL pública. */
async function uploadPublic(file, title, fileName, what = "la imagen") {
  const secret = blogSecret();
  if (!secret) throw new InstagramError(0, "Falta la frase de administración del blog en el Llavero (para subir las imágenes).");
  const res = await fetch(`${BLOG}/api/blog-asset`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-admin-secret": secret },
    body: JSON.stringify({ title: title.slice(0, 200), fileName, dataBase64: readFileSync(file).toString("base64") }),
  });
  const d = await res.json().catch(() => ({}));
  if (!res.ok || !d.ok) throw new InstagramError(res.status, `No pude subir ${what}: ${d.error || res.status}`);
  if (!d.url) throw new InstagramError(0, `Contentful no devolvió la dirección de ${what} (¿falta desplegar /api/blog-asset con URL?).`);
  return d.url;
}

// ---------- Publicar el carrusel ----------

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function waitFinished(id, token, intentos = 20) {
  for (let i = 0; i < intentos; i++) {
    const { status_code } = await ig(`/${id}`, { token, params: { fields: "status_code" } });
    if (status_code === "FINISHED") return;
    if (status_code === "ERROR" || status_code === "EXPIRED") throw new InstagramError(0, `Instagram no pudo procesar el carrusel (${status_code}).`);
    await sleep(POLL_MS);
  }
  throw new InstagramError(0, "Instagram tardó demasiado en procesar el carrusel.");
}

/** Publica el carrusel de un borrador. Devuelve { id, permalink }. */
export async function publishCarousel(item, token) {
  const { draft, state } = item;
  if (!draft.meta) throw new InstagramError(0, "El borrador no tiene carrusel (bloque meta).");
  const m = (state.meta ||= {});
  if (["publicado", "publicando"].includes(m.estado)) throw new InstagramError(0, `El carrusel ya está en estado «${m.estado}».`);
  const me = await whoAmI(token);
  const urls = await publicUrls(item);

  const children = [];
  for (const [i, url] of urls.entries()) {
    const params = { image_url: url, is_carousel_item: "true" };
    if (draft.meta.alt?.[i]) params.alt_text = draft.meta.alt[i];
    children.push((await ig(`/${me.id}/media`, { method: "POST", token, params })).id);
  }
  const container = await ig(`/${me.id}/media`, {
    method: "POST",
    token,
    params: { media_type: "CAROUSEL", children: children.join(","), caption: metaCaption(draft.meta) },
  });
  await waitFinished(container.id, token);

  const previous = m.estado;
  m.estado = "publicando";
  m.inicio = new Date().toISOString();
  saveState(item);
  let published;
  try {
    published = await ig(`/${me.id}/media_publish`, { method: "POST", token, params: { creation_id: container.id } });
  } catch (e) {
    // Rechazo claro (4xx): no se publicó y se puede reintentar. Corte o 5xx: duda, no se reintenta solo.
    if (e.status >= 400 && e.status < 500) {
      m.estado = previous;
      delete m.inicio;
      saveState(item);
    }
    throw e;
  }
  let permalink = "";
  try {
    permalink = (await ig(`/${published.id}`, { token, params: { fields: "permalink" } })).permalink || "";
  } catch {
    /* el post ya salió; el enlace es opcional */
  }
  Object.assign(m, { estado: "publicado", publicadoEn: new Date().toISOString(), id: published.id, permalink });
  saveState(item);
  return { id: published.id, permalink };
}

/** Para la tarea diaria: publica si hay token; si no, no hace nada (ya se avisó al preparar). */
export async function publishIfPossible(file) {
  const token = readToken();
  if (!token) return null;
  const item = loadItem(file);
  if (!item.draft.meta || ["publicado", "publicando", "cancelado"].includes(item.state.meta?.estado)) return null;
  try {
    const r = await publishCarousel(item, token);
    log(`Publicado en Instagram: «${item.draft.title}» ${r.permalink}`);
    notify("Publicado en Instagram", item.draft.title);
    return r;
  } catch (e) {
    log(`No se pudo publicar en Instagram «${item.draft.title}»: ${e.message}`);
    notify(
      e.status === 401 || e.status === 190 ? "Instagram: token caducado" : "Instagram: no se publicó",
      `${e.message.slice(0, 80)}. Publícalo a mano: contenido-blog/${item.name}/meta/meta.html`
    );
    return null;
  }
}

// ---------- Historia ----------

/** Publica la historia del post (imagen 9:16). Estado en state.historia. */
export async function publishStory(item, token) {
  const h = (item.state.historia ||= {});
  if (["publicado", "publicando"].includes(h.estado)) throw new InstagramError(0, `La historia ya está en estado «${h.estado}».`);
  const me = await whoAmI(token);
  if (!h.url) {
    const jpg = renderStory(item.file);
    h.url = await uploadPublic(jpg, `Historia · ${item.draft.title}`, `${item.name.replace(/[^a-z0-9-]/gi, "-").slice(0, 70)}-historia.jpg`, "la historia");
    saveState(item);
  }
  const container = await ig(`/${me.id}/media`, { method: "POST", token, params: { media_type: "STORIES", image_url: h.url } });
  await waitFinished(container.id, token);
  h.estado = "publicando";
  saveState(item);
  let published;
  try {
    published = await ig(`/${me.id}/media_publish`, { method: "POST", token, params: { creation_id: container.id } });
  } catch (e) {
    if (e.status >= 400 && e.status < 500) {
      h.estado = "error";
      saveState(item);
    }
    throw e;
  }
  Object.assign(h, { estado: "publicado", publicadoEn: new Date().toISOString(), id: published.id });
  saveState(item);
  return { id: published.id };
}

/** Para la tarea diaria: historia del post que salió hoy (tenga o no carrusel). */
export async function publishStoryIfPossible(file) {
  const token = readToken();
  if (!token) return null;
  const item = loadItem(file);
  if (["publicado", "publicando", "cancelado"].includes(item.state.historia?.estado)) return null;
  try {
    const r = await publishStory(item, token);
    log(`Historia publicada en Instagram: «${item.draft.title}»`);
    return r;
  } catch (e) {
    log(`No se pudo publicar la historia de «${item.draft.title}»: ${e.message}`);
    notify("Instagram: historia no publicada", `${e.message.slice(0, 80)}. Imagen en contenido-blog/${item.name}/meta/historia.jpg`);
    return null;
  }
}

// ---------- Reel ----------

/**
 * Texto del reel: otro arranque que el del carrusel (el gancho del caption de
 * LinkedIn) para no repetir el mismo texto en el perfil.
 */
function reelCaption(draft) {
  const full = metaCaption(draft.meta);
  const gancho = String(draft.linkedin?.es || "").split("\n")[0].trim();
  if (!gancho) return full;
  const resto = full.split("\n").slice(1).join("\n").replace(/^\s+/, "");
  return `${gancho}\n\n${resto}`.slice(0, 2200);
}

/**
 * Publica el reel del post (video de las diapositivas, renderReel). El video
 * se sube a Meta con la subida reanudable (rupload.facebook.com), así no hace
 * falta alojarlo: POST /<IG_ID>/media (REELS, upload_type=resumable) → POST
 * del archivo a rupload con offset y file_size → esperar FINISHED →
 * media_publish. Solo con el token del inicio de sesión unificado.
 */
export async function publishReel(item, token) {
  const r = (item.state.reel ||= {});
  if (["publicado", "publicando"].includes(r.estado)) throw new InstagramError(0, `El reel ya está en estado «${r.estado}».`);
  if (!item.draft.meta) throw new InstagramError(0, "El borrador no tiene carrusel: el reel se hace con sus diapositivas.");
  const me = await whoAmI(token);
  if (MODE !== "unificado") throw new InstagramError(0, "La subida de reels solo está implementada con el token del inicio de sesión unificado.");
  const mp4 = join(OUT_ROOT, item.name, "meta", "reel.mp4");
  if (!existsSync(mp4)) renderReel(item.file);
  const container = await ig(`/${me.id}/media`, {
    method: "POST",
    token,
    params: { media_type: "REELS", upload_type: "resumable", caption: reelCaption(item.draft), share_to_feed: "true" },
  });
  // Siempre al host de Meta (o al simulado en pruebas), no a una URL de la respuesta.
  const upload = `${MOCK_FB || "https://rupload.facebook.com"}/ig-api-upload/${VERSION}/${container.id}`;
  const res = await fetch(upload, {
    method: "POST",
    headers: { Authorization: `OAuth ${token}`, offset: "0", file_size: String(statSync(mp4).size) },
    body: readFileSync(mp4),
  });
  const up = await res.json().catch(() => ({}));
  if (!res.ok || up.success === false) throw new InstagramError(res.status, `No se pudo subir el video del reel: ${up.debug_info?.message || up.error?.message || res.status}`);
  await waitFinished(container.id, token, 40);
  r.estado = "publicando";
  saveState(item);
  let published;
  try {
    published = await ig(`/${me.id}/media_publish`, { method: "POST", token, params: { creation_id: container.id } });
  } catch (e) {
    if (e.status >= 400 && e.status < 500) {
      r.estado = "error";
      saveState(item);
    }
    throw e;
  }
  let permalink = "";
  try {
    permalink = (await ig(`/${published.id}`, { token, params: { fields: "permalink" } })).permalink || "";
  } catch {
    /* opcional */
  }
  Object.assign(r, { estado: "publicado", publicadoEn: new Date().toISOString(), id: published.id, permalink });
  saveState(item);
  return { id: published.id, permalink };
}

/** Para la tarea diaria. Devuelve null si no hay token, ya salió o falla (y avisa). */
export async function publishReelIfPossible(file) {
  const token = readToken();
  if (!token) return null;
  const item = loadItem(file);
  if (!item.draft.meta || ["publicado", "publicando", "cancelado", "error"].includes(item.state.reel?.estado)) return null;
  try {
    const r = await publishReel(item, token);
    log(`Reel publicado en Instagram: «${item.draft.title}» ${r.permalink}`);
    notify("Reel publicado en Instagram", item.draft.title);
    return r;
  } catch (e) {
    item.state.reel = { ...(item.state.reel || {}), estado: item.state.reel?.estado === "publicando" ? "publicando" : "error", ultimoError: e.message.slice(0, 200) };
    saveState(item);
    log(`No se pudo publicar el reel de «${item.draft.title}»: ${e.message}`);
    notify("Instagram: reel no publicado", `${e.message.slice(0, 80)}. Video en contenido-blog/${item.name}/meta/reel.mp4`);
    return null;
  }
}

// ---------- Estadísticas (para la agenda) ----------

/**
 * Guarda me gusta y comentarios de cada carrusel publicado hace más de
 * `horas` horas (state.meta.stats). Solo lectura en Instagram. El alcance y
 * los guardados piden el permiso instagram_manage_insights en el token.
 */
export async function medirPublicaciones(horas = Number(process.env.MEDIR_TRAS_HORAS || 48)) {
  const token = readToken();
  if (!token || !existsSync(DRAFTS)) return 0;
  await whoAmI(token);
  let n = 0;
  for (const f of readdirSync(DRAFTS).filter((x) => x.endsWith(".json") && !x.endsWith(".contentful.json"))) {
    const item = loadItem(join(DRAFTS, f));
    const m = item.state.meta;
    if (m?.estado !== "publicado" || !m.id || !m.publicadoEn || m.stats) continue;
    if (Date.now() - new Date(m.publicadoEn).getTime() < horas * 3600e3) continue;
    const d = await ig(`/${m.id}`, { token, params: { fields: "like_count,comments_count" } });
    m.stats = { likes: d.like_count || 0, comentarios: d.comments_count || 0, medidoEn: new Date().toISOString() };
    // Alcance, guardados y compartidos (permiso instagram_manage_insights). Si
    // no hay permiso, se queda con me gusta y comentarios.
    try {
      const ins = await ig(`/${m.id}/insights`, { token, params: { metric: "reach,saved,shares" } });
      const v = Object.fromEntries((ins.data || []).map((x) => [x.name, x.values?.[0]?.value || 0]));
      Object.assign(m.stats, { alcance: v.reach || 0, guardados: v.saved || 0, compartidos: v.shares || 0 });
    } catch (e) {
      log(`Sin estadísticas de alcance para «${item.draft.title}» (${e.message.slice(0, 80)}).`);
    }
    saveState(item);
    log(`Medido «${item.draft.title}»: ${JSON.stringify(m.stats)}`);
    n++;
  }
  return n;
}

// ---------- Línea de comandos ----------

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const args = process.argv.slice(2);
  const fileArg = args.find((a) => a.endsWith(".json"));
  try {
    if (args.includes("--historia")) {
      if (!fileArg) throw new Error("Uso: --historia <borrador.json>");
      const token = readToken();
      if (!token) throw new Error("No hay token de Instagram en el Llavero.");
      await publishStory(loadItem(resolve(fileArg)), token);
      console.log("Historia publicada.");
    } else if (args.includes("--reel")) {
      if (!fileArg) throw new Error("Uso: --reel <borrador.json>");
      const token = readToken();
      if (!token) throw new Error("No hay token de Instagram en el Llavero.");
      const r = await publishReel(loadItem(resolve(fileArg)), token);
      console.log(`Reel publicado: ${r.permalink || r.id}`);
    } else if (args.includes("--medir")) {
      console.log(`Publicaciones medidas: ${await medirPublicaciones()}`);
    } else if (args.includes("--verificar")) {
      const token = readToken();
      if (!token) {
        console.log(`No hay token en el Llavero (servicio "${KEYCHAIN}"). Guárdalo con: node .claude/scripts/instagram-token.mjs`);
        process.exit(77);
      }
      const me = await whoAmI(token);
      console.log(`Token válido. Cuenta: @${me.username} (id ${me.id}) · tipo: ${me.mode === "unificado" ? "inicio de sesión unificado (graph.facebook.com)" : "Instagram Login (graph.instagram.com)"}`);
      if (me.mode === "unificado") {
        // Permiso de publicar: el cupo diario solo se puede leer con instagram_content_publish.
        try {
          const q = await ig(`/${me.id}/content_publishing_limit`, { token, params: { fields: "config,quota_usage" } });
          const c = q.data?.[0] || {};
          console.log(`Permiso para publicar: sí · usadas hoy ${c.quota_usage ?? "?"} de ${c.config?.quota_total ?? "?"}`);
        } catch (e) {
          console.log(`AVISO: no puedo leer el cupo de publicación (${e.message}); puede faltar instagram_content_publish.`);
        }
        const info = me.systemUser ? null : await tokenInfo(token);
        if (me.systemUser) {
          console.log("Tipo: token de usuario del sistema; según tu configuración, no caduca.");
          const { apuntarCaducidad } = await import("./tokens.mjs");
          apuntarCaducidad("instagram", "nunca");
        } else if (info) {
          console.log(`Caduca: ${info.expira || "no lo dice"} · permisos: ${info.permisos.join(", ") || "?"}`);
          if (!info.permisos.includes("instagram_content_publish"))
            console.log("AVISO: falta el permiso instagram_content_publish; no podrá publicar.");
          if (info.expira && info.expira !== "nunca") {
            const { apuntarCaducidad } = await import("./tokens.mjs");
            apuntarCaducidad("instagram", info.expira);
          }
        }
      }
    } else if (args.includes("--refrescar")) {
      const days = await refreshToken();
      console.log(days === null ? "Este token (inicio de sesión unificado) no se renueva por API; te avisaré antes de que caduque." : `Token de Instagram renovado: válido ~${days} días.`);
    } else if (args.includes("--ahora")) {
      if (!fileArg) throw new Error("Indica el borrador: --ahora .claude/blog/borradores/<archivo>.json");
      const token = readToken();
      if (!token) throw new Error("No hay token de Instagram en el Llavero.");
      const r = await publishCarousel(loadItem(resolve(fileArg)), token);
      console.log(`Publicado: ${r.permalink || r.id}`);
    } else if (args.includes("--marcar")) {
      const estado = args.find((a) => ["publicado", "listo", "cancelado"].includes(a));
      if (!fileArg || !estado) throw new Error("Uso: --marcar <borrador.json> publicado|listo|cancelado");
      const item = loadItem(resolve(fileArg));
      (item.state.meta ||= {}).estado = estado;
      saveState(item);
      console.log(`«${item.draft.title}» → Instagram: ${estado}`);
    } else {
      console.error("Uso: instagram-publicar.mjs --verificar | --ahora <borrador> | --refrescar | --marcar <borrador> <estado>");
      process.exit(64);
    }
  } catch (e) {
    console.error(`Error: ${e.message}`);
    process.exit(1);
  }
}
