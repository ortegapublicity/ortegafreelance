import type { Config } from '@netlify/functions';
import { getStore } from '@netlify/blobs';
import { LINKS, PAGOS } from '../lib/config';
import { HttpError, clean, escapeHtml, handle, json, readJson } from '../lib/http';
import { send } from '../lib/mail';
import { mutate, newId } from '../lib/store';

/**
 * Aviso de pago («Ya pagué») desde el checkout o desde /success.
 * - A Raúl (PAGOS.avisoA): quién avisa, qué plan, cuánto y cómo pagó.
 * - Al cliente: confirmación de que se recibió el aviso, con la agenda,
 *   WhatsApp y redes.
 * No confirma el pago (ni PayPal ni ACH/wire avisan a la web): Raúl lo
 * verifica. Se guarda una copia en Netlify Blobs (store "pagos").
 * Límite anti-abuso: 5 avisos por IP y hora, y 3 por correo al día.
 */

type Aviso = { nombre: string; email: string; plan: string; monto: number; metodo: string; referencia: string; idioma: 'es' | 'en' };

const METODOS: Record<string, { es: string; en: string }> = {
  paypal: { es: 'PayPal / tarjeta', en: 'PayPal / card' },
  ach: { es: 'transferencia ACH', en: 'ACH transfer' },
  wire: { es: 'transferencia wire', en: 'wire transfer' },
};
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const store = () => getStore({ name: 'pagos', consistency: 'strong' });

async function limit(key: string, max: number, windowMs: number) {
  const now = Date.now();
  await mutate<number[]>(store(), `limites/${key}`, [], (hits) => {
    const recent = hits.filter((t) => now - t < windowMs);
    if (recent.length >= max) throw new HttpError(429, 'demasiados_avisos');
    return [...recent, now];
  });
}

const money = (n: number) => (n > 0 ? `USD ${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '');

function correoCliente(a: Aviso) {
  const e = (s: string) => escapeHtml(s);
  const metodo = METODOS[a.metodo]?.[a.idioma] ?? a.metodo;
  const transfer = a.metodo === 'ach' || a.metodo === 'wire';
  const btn = (href: string, text: string) =>
    `<a href="${href}" style="display:inline-block;margin:4px 8px 4px 0;padding:10px 18px;border-radius:999px;background:#1e2a47;color:#ffffff;text-decoration:none;font-weight:700">${text}</a>`;
  if (a.idioma === 'en') {
    return {
      subject: 'We received your payment notice · Ortega Freelance',
      title: `Thank you, ${a.nombre.split(' ')[0]}`,
      body: `<p>I received your payment notice for <b>${e(a.plan)}</b>${a.monto ? ` (${money(a.monto)})` : ''} via ${e(metodo)}.</p>
<p>I'm verifying it${transfer ? ' (ACH transfers take 1 to 3 business days to clear)' : ''} and I'll get in touch very soon to get started.</p>
<p>If you'd like to move faster, book a video call or message me:</p>
<p>${btn(PAGOS.agenda, 'Book a video call')}${btn(PAGOS.whatsapp, 'WhatsApp')}</p>
<p>WhatsApp: ${PAGOS.whatsappTexto}<br>LinkedIn: <a href="${LINKS.linkedin}">${LINKS.linkedin}</a><br>Instagram: <a href="${LINKS.instagram}">${LINKS.instagram}</a><br>Facebook: <a href="${LINKS.facebook}">${LINKS.facebook}</a></p>
<p>— Raúl Ortega</p>`,
    };
  }
  return {
    subject: 'Recibí tu aviso de pago · Ortega Freelance',
    title: `Gracias, ${a.nombre.split(' ')[0]}`,
    body: `<p>Recibí el aviso de tu pago de <b>${e(a.plan)}</b>${a.monto ? ` (${money(a.monto)})` : ''} por ${e(metodo)}.</p>
<p>Lo estoy verificando${transfer ? ' (las transferencias ACH tardan de 1 a 3 días hábiles en acreditarse)' : ''} y te escribo a la brevedad para empezar.</p>
<p>Si quieres adelantar, agenda una videollamada o escríbeme:</p>
<p>${btn(PAGOS.agenda, 'Agendar videollamada')}${btn(PAGOS.whatsapp, 'WhatsApp')}</p>
<p>WhatsApp: ${PAGOS.whatsappTexto}<br>LinkedIn: <a href="${LINKS.linkedin}">${LINKS.linkedin}</a><br>Instagram: <a href="${LINKS.instagram}">${LINKS.instagram}</a><br>Facebook: <a href="${LINKS.facebook}">${LINKS.facebook}</a></p>
<p>— Raúl Ortega</p>`,
  };
}

function correoRaul(a: Aviso, id: string, ip: string) {
  const e = (s: string) => escapeHtml(s);
  const metodo = METODOS[a.metodo]?.es ?? a.metodo;
  return {
    subject: `Aviso de pago: ${a.plan}${a.monto ? ` · ${money(a.monto)}` : ''} · ${a.nombre}`,
    title: 'Nuevo aviso de pago',
    body: `<p><b>${e(a.nombre)}</b> avisa que pagó. Verifícalo en ${a.metodo === 'paypal' ? 'PayPal' : 'tu cuenta en EE. UU.'} antes de empezar.</p>
<p>Plan: <b>${e(a.plan)}</b><br>Monto: ${a.monto ? money(a.monto) : '(no indicado)'}<br>Método: ${e(metodo)}<br>Referencia: ${e(a.referencia) || '(sin referencia)'}<br>Correo: <a href="mailto:${e(a.email)}">${e(a.email)}</a><br>Idioma: ${a.idioma}<br>Fecha: ${new Date().toISOString()}<br>IP: ${e(ip)} · aviso ${id}</p>
<p>Al cliente ya le llegó la confirmación con la agenda, WhatsApp y redes.</p>`,
  };
}

export default handle(async (req) => {
  if (req.method !== 'POST') throw new HttpError(405, 'metodo_no_permitido');
  const body = await readJson<Record<string, unknown>>(req, 8_000);
  if (clean(body.website)) return json({ ok: true }); // campo trampa: bot

  const aviso: Aviso = {
    nombre: clean(body.nombre, 100),
    email: clean(body.email, 150).toLowerCase(),
    plan: clean(body.plan, 120) || 'Servicio',
    monto: Math.max(0, Math.min(100_000, Number(body.monto) || 0)),
    metodo: clean(body.metodo, 10),
    referencia: clean(body.referencia, 120),
    idioma: clean(body.idioma, 2) === 'en' ? 'en' : 'es',
  };
  if (aviso.nombre.length < 2) throw new HttpError(422, 'falta_nombre');
  if (!EMAIL_RE.test(aviso.email)) throw new HttpError(422, 'correo_invalido');
  if (!METODOS[aviso.metodo]) throw new HttpError(422, 'metodo_invalido');

  const ip = req.headers.get('x-nf-client-connection-ip') || req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'desconocida';
  await limit(`ip-${ip}`, 5, 60 * 60 * 1000);
  await limit(`email-${aviso.email}`, 3, 24 * 60 * 60 * 1000);

  const id = newId('aviso-');
  await store().setJSON(`avisos/${id}`, { ...aviso, ip, fecha: new Date().toISOString() });

  await send({ to: PAGOS.avisoA, ...correoRaul(aviso, id, ip) });
  await send({ to: aviso.email, ...correoCliente(aviso) });

  return json({ ok: true });
});

export const config: Config = { path: '/api/pago-aviso' };
