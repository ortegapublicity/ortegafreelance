#!/usr/bin/env node
// Instagram de la bitácora: publica el carrusel de un post del blog
// (bloque "meta" del borrador, imágenes de carrusel-meta.mjs) en
// @ortegafreelance con la API oficial «Instagram API with Instagram Login».
//
//   node .claude/scripts/instagram-publicar.mjs --verificar
//   node .claude/scripts/instagram-publicar.mjs --ahora <borrador.json>
//   node .claude/scripts/instagram-publicar.mjs --refrescar      renueva el token (lo hace tokens.mjs solo)
//   node .claude/scripts/instagram-publicar.mjs --marcar <borrador.json> publicado|listo|cancelado
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
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { metaCaption, renderCarousel } from "./carrusel-meta.mjs";

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
  const secret = blogSecret();
  if (!secret) throw new InstagramError(0, "Falta la frase de administración del blog en el Llavero (para subir las imágenes).");
  const urls = [];
  for (const [i, f] of slides.entries()) {
    const res = await fetch(`${BLOG}/api/blog-asset`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-admin-secret": secret },
      body: JSON.stringify({
        title: `Instagram · ${item.draft.title} · ${i + 1}`.slice(0, 200),
        fileName: `${item.name.replace(/[^a-z0-9-]/gi, "-").slice(0, 70)}-ig-${i + 1}.jpg`,
        dataBase64: readFileSync(join(dir, f)).toString("base64"),
      }),
    });
    const d = await res.json().catch(() => ({}));
    if (!res.ok || !d.ok) throw new InstagramError(res.status, `No pude subir la imagen ${i + 1}: ${d.error || res.status}`);
    if (!d.url) throw new InstagramError(0, `Contentful no devolvió la dirección de la imagen ${i + 1} (¿falta desplegar /api/blog-asset con URL?).`);
    urls.push(d.url);
  }
  m.urls = urls;
  saveState(item);
  return urls;
}

// ---------- Publicar el carrusel ----------

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function waitFinished(id, token) {
  for (let i = 0; i < 20; i++) {
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

// ---------- Línea de comandos ----------

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const args = process.argv.slice(2);
  const fileArg = args.find((a) => a.endsWith(".json"));
  try {
    if (args.includes("--verificar")) {
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
