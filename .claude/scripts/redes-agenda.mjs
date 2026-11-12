// Agenda de redes: qué días se publica y a qué hora, aprendiendo de las
// estadísticas. La usa linkedin-publicar.mjs (que también lanza Instagram).
//
// Configuración: .claude/redes.config.json (días, horas candidatas, cuánto
// explorar). Es lo único que cambia al instalar el sistema a un cliente.
//
// Cómo elige la hora de cada día (horaDelDia):
// 1. Mientras alguna hora candidata tenga menos de `minMuestrasPorHora`
//    publicaciones medidas, prueba esa (rotación: así todas reciben datos).
// 2. Con datos de todas: usa la hora con mejor promedio, y un día de cada
//    cinco (`explorar` = 0.2) prueba otra para no quedarse con un dato viejo.
// La elección depende solo de la fecha y de los datos: si la tarea corre
// varias veces el mismo día, sale siempre la misma hora.
//
// Puntuación de una publicación (ver `puntuacion`): alcance, me gusta,
// comentarios, guardados y compartidos del carrusel de Instagram a las
// `medirTrasHoras` horas. LinkedIn no da estadísticas sin la Community Management
// API; cuando esté, se suma aquí.

import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const BLOG_REPO = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const CONFIG_FILE = process.env.REDES_CONFIG || join(BLOG_REPO, ".claude/redes.config.json");

const DEFAULTS = {
  dias: [0, 1, 2, 3, 4, 5, 6],
  horas: ["08:10", "12:10", "19:10"],
  postsPorDia: 1,
  medirTrasHoras: 48,
  minMuestrasPorHora: 2,
  explorar: 0.2,
  instagram: { historia: true, reel: true, reelTrasDias: 2 },
};

function loadConfig() {
  let c = {};
  if (existsSync(CONFIG_FILE)) c = JSON.parse(readFileSync(CONFIG_FILE, "utf8"));
  const cfg = { ...DEFAULTS, ...c, instagram: { ...DEFAULTS.instagram, ...(c.instagram || {}) } };
  if (!cfg.horas.length || !cfg.horas.every((h) => /^([01]\d|2[0-3]):[0-5]\d$/.test(h)))
    throw new Error(`${CONFIG_FILE}: "horas" tiene que ser una lista de horas HH:MM.`);
  cfg.horas = [...cfg.horas].sort();
  return cfg;
}

export const CONFIG = loadConfig();

const minutes = (hhmm) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

/** Fecha local YYYY-MM-DD. */
export const dia = (d) => new Date(d).toLocaleDateString("sv-SE");

/** Date local del día `d` a la hora "HH:MM". */
export function aLaHora(d, hhmm) {
  const x = new Date(d);
  const [h, m] = hhmm.split(":").map(Number);
  return new Date(x.getFullYear(), x.getMonth(), x.getDate(), h, m, 0);
}

/** Hora candidata más cercana a una fecha (para agrupar lo que salió a otra hora). */
export function franja(d, horas = CONFIG.horas) {
  const x = new Date(d);
  const t = x.getHours() * 60 + x.getMinutes();
  return horas.reduce((best, h) => (Math.abs(minutes(h) - t) < Math.abs(minutes(best) - t) ? h : best), horas[0]);
}

/** Número pseudoaleatorio estable en [0, 1) a partir de un texto (la fecha). */
function azar(texto) {
  let h = 2166136261;
  for (const ch of texto) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return ((h >>> 0) % 10000) / 10000;
}

// Alcance / 10 + me gusta + 3 × comentarios + 4 × (guardados + compartidos).
// El alcance es lo que más depende de la hora; guardar y compartir pesan más
// que un me gusta. Sin permiso de estadísticas, solo me gusta y comentarios.
export const puntuacion = (s) =>
  s ? (s.alcance || 0) / 10 + (s.likes || 0) + 3 * (s.comentarios || 0) + 4 * ((s.guardados || 0) + (s.compartidos || 0)) : 0;

/**
 * Muestras medidas: [{ hora, puntos, fecha }] a partir de los estados de los
 * borradores (state.meta.stats, que guarda instagram-publicar.mjs --medir).
 */
export function muestras(items, horas = CONFIG.horas) {
  return items
    .filter((i) => i.state.meta?.stats && i.state.meta.publicadoEn)
    .map((i) => ({ hora: franja(i.state.meta.publicadoEn, horas), puntos: puntuacion(i.state.meta.stats), fecha: i.state.meta.publicadoEn }));
}

/**
 * Resumen por hora: { "08:10": { intentos, n, promedio } … }. `intentos`
 * cuenta todo lo que ya salió a esa hora (medido o no, para que la rotación
 * no repita hora mientras se esperan los datos); `n` y `promedio`, solo lo
 * medido.
 */
export function resumen(items, cfg = CONFIG) {
  const out = Object.fromEntries(cfg.horas.map((h) => [h, { intentos: 0, n: 0, total: 0, promedio: 0 }]));
  for (const i of items) {
    const salio = i.state.linkedin?.publicadoEn || i.state.meta?.publicadoEn;
    if (salio && i.state.linkedin?.horaFijada !== undefined) out[franja(salio, cfg.horas)].intentos++;
  }
  for (const m of muestras(items, cfg.horas)) {
    out[m.hora].n++;
    out[m.hora].total += m.puntos;
    out[m.hora].intentos = Math.max(out[m.hora].intentos, out[m.hora].n);
  }
  for (const h of cfg.horas) out[h].promedio = out[h].n ? out[h].total / out[h].n : 0;
  return out;
}

/** Hora para publicar el día `d`: { hora, motivo }. */
export function horaDelDia(items, d, cfg = CONFIG) {
  const r = resumen(items, cfg);
  const clave = dia(d);
  const faltan = cfg.horas.filter((h) => r[h].intentos < cfg.minMuestrasPorHora || r[h].n === 0);
  if (faltan.length) {
    const menos = Math.min(...faltan.map((h) => r[h].intentos));
    const opciones = faltan.filter((h) => r[h].intentos === menos);
    const hora = opciones[Math.floor(azar(clave) * opciones.length)];
    return { hora, motivo: `probando (${r[hora].intentos}/${cfg.minMuestrasPorHora} publicaciones a esa hora, ${r[hora].n} ya medidas)` };
  }
  const orden = [...cfg.horas].filter((h) => r[h].n > 0).sort((a, b) => r[b].promedio - r[a].promedio);
  const mejor = orden[0];
  if (orden.length > 1 && azar(`explorar-${clave}`) < cfg.explorar) {
    const otras = orden.slice(1);
    const hora = otras[Math.floor(azar(`otra-${clave}`) * otras.length)];
    return { hora, motivo: `explorando (la mejor sigue siendo ${mejor}, ${r[mejor].promedio.toFixed(1)} pts)` };
  }
  return { hora: mejor, motivo: `la mejor hasta ahora (${r[mejor].promedio.toFixed(1)} pts de promedio en ${r[mejor].n} publicaciones)` };
}
