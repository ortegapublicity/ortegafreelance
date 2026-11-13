#!/usr/bin/env node
// Estadísticas de LinkedIn de la bitácora (app «Ortega Freelance Stats», con
// la Community Management API y el permiso r_member_postAnalytics). Es una
// app aparte de la que publica: la Community Management API tiene que ser el
// único producto de su app.
//
//   node .claude/scripts/linkedin-stats.mjs --verificar   el token llega y lee estadísticas
//   node .claude/scripts/linkedin-stats.mjs --medir       mide los posts publicados hace 48 h o más
//
// Token: Llavero de macOS, servicio "ortegafreelance-linkedin-stats" (se
// guarda con `node .claude/scripts/guardar-token.mjs linkedin-stats`). Se
// genera en https://www.linkedin.com/developers/tools/oauth/token-generator
// con la app «Ortega Freelance Stats» y el permiso r_member_postAnalytics.
// Dura 60 días.
//
// Qué mide (GET /rest/memberCreatorPostAnalytics?q=entity, total del post):
// impresiones, personas alcanzadas, reacciones, comentarios y compartidos. Lo
// guarda en state.linkedin.stats de cada borrador, junto al formato del post
// (imagen, documento o video), para que la agenda aprenda qué funciona mejor.

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const BLOG_REPO = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const DATA = process.env.BITACORA_DATOS || BLOG_REPO;
const DRAFTS = join(DATA, ".claude/blog/borradores");
const KEYCHAIN = "ortegafreelance-linkedin-stats";
const VERSION = process.env.LINKEDIN_VERSION || "202610";
const MOCK = /^http:\/\/(127\.0\.0\.1|localhost):\d+$/.test(process.env.LINKEDIN_API_BASE || "") ? process.env.LINKEDIN_API_BASE : "";
const API = MOCK || "https://api.linkedin.com";
const METRICAS = ["IMPRESSION", "MEMBERS_REACHED", "REACTION", "COMMENT", "RESHARE"];
const log = (...m) => console.log(`[${new Date().toISOString()}] linkedin-stats:`, ...m);

export function readStatsToken() {
  if (MOCK) return "token-de-prueba";
  try {
    return execFileSync("/usr/bin/security", ["find-generic-password", "-s", KEYCHAIN, "-w"], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
  } catch {
    return "";
  }
}

async function get(path, token) {
  const res = await fetch(`${API}${path}`, {
    headers: { Authorization: `Bearer ${token}`, "LinkedIn-Version": VERSION, "X-Restli-Protocol-Version": "2.0.0" },
  });
  const text = await res.text();
  let d = {};
  try {
    d = text ? JSON.parse(text) : {};
  } catch {
    /* sin JSON */
  }
  if (!res.ok) {
    const e = new Error(`${res.status} ${d.message || text.slice(0, 160)}`);
    e.status = res.status;
    throw e;
  }
  return d;
}

const total = (d) => (d.elements || []).reduce((a, x) => a + (Number(x.count) || 0), 0);

/** Estadísticas totales de un post (URN urn:li:share:… o urn:li:ugcPost:…). */
export async function statsDePost(urn, token) {
  const tipo = urn.startsWith("urn:li:ugcPost:") ? "ugc" : "share";
  const out = {};
  for (const m of METRICAS) {
    const d = await get(`/rest/memberCreatorPostAnalytics?q=entity&entity=(${tipo}:${encodeURIComponent(urn)})&queryType=${m}&aggregation=TOTAL`, token);
    out[m] = total(d);
  }
  return {
    impresiones: out.IMPRESSION,
    alcance: out.MEMBERS_REACHED,
    likes: out.REACTION,
    comentarios: out.COMMENT,
    compartidos: out.RESHARE,
    medidoEn: new Date().toISOString(),
  };
}

/** Mide los posts de LinkedIn publicados hace `horas` horas o más y aún sin medir. */
export async function medirLinkedIn(horas = 48) {
  const token = readStatsToken();
  if (!token || !existsSync(DRAFTS)) return 0;
  let n = 0;
  for (const f of readdirSync(DRAFTS).filter((x) => x.endsWith(".contentful.json"))) {
    const file = join(DRAFTS, f);
    const state = JSON.parse(readFileSync(file, "utf8"));
    const li = state.linkedin;
    if (li?.estado !== "publicado" || !li.id || !li.publicadoEn || li.stats) continue;
    if (Date.now() - new Date(li.publicadoEn).getTime() < horas * 3600e3) continue;
    try {
      li.stats = await statsDePost(li.id, token);
      li.formato ||= "imagen";
      writeFileSync(file, JSON.stringify(state, null, 2) + "\n");
      log(`Medido ${f.replace(".contentful.json", "")}: ${JSON.stringify(li.stats)}`);
      n++;
    } catch (e) {
      log(`No pude medir ${f}: ${e.message}`);
      if (e.status === 401 || e.status === 403) break;
    }
  }
  return n;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const token = readStatsToken();
  if (!token) {
    console.log(`No hay token de estadísticas en el Llavero (servicio "${KEYCHAIN}"). Guárdalo con: node .claude/scripts/guardar-token.mjs linkedin-stats`);
    process.exit(77);
  }
  try {
    if (process.argv.includes("--verificar")) {
      const d = await get("/rest/memberCreatorPostAnalytics?q=me&queryType=IMPRESSION&aggregation=TOTAL", token);
      console.log(`Token válido: leo tus estadísticas de LinkedIn (impresiones totales de tus posts: ${total(d)}).`);
    } else if (process.argv.includes("--medir")) {
      console.log(`Posts de LinkedIn medidos: ${await medirLinkedIn()}`);
    } else {
      console.error("Uso: linkedin-stats.mjs --verificar | --medir");
      process.exit(64);
    }
  } catch (e) {
    console.error(
      e.status === 403
        ? "LinkedIn no deja leer estadísticas con este token: falta el permiso r_member_postAnalytics (¿ya aprobaron la Community Management API y lo marcaste al generar el token?)."
        : `Error: ${e.message}`
    );
    process.exit(1);
  }
}
