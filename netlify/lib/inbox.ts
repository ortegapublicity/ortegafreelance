import { getStore } from '@netlify/blobs';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { CATCH_ALL, LINKS, MAILBOXES, MAIL_DOMAIN, ORG, type Mailbox } from './config';
import { escapeHtml } from './http';
import { mutate } from './store';

/**
 * Buzones del equipo sobre Netlify Blobs. Resend guarda los correos recibidos
 * solo 30 días, así que cada uno se copia aquí al llegar.
 *
 *   m/<id>          el mensaje completo
 *   i/<buzón>       resumen de todos sus mensajes, el más nuevo primero
 *   a/<id>/<adj>    adjuntos copiados
 *   seen/<resend>   evita guardar dos veces el mismo correo si el webhook se repite
 */

export const mailStore = () => getStore({ name: 'mail', consistency: 'strong' });

export type Address = { name: string; email: string };
export type Folder = 'in' | 'sent' | 'trash';

export type MailAttachment = { id: string; filename: string; contentType: string; size: number; stored: boolean };

export type MailMessage = {
  id: string;
  resendId: string;
  direction: 'in' | 'out';
  mailboxes: Mailbox[];
  from: Address;
  to: Address[];
  cc: Address[];
  replyTo: Address[];
  subject: string;
  text: string;
  html: string;
  date: number;
  messageId: string;
  references: string;
  attachments: MailAttachment[];
  auth: { spf?: string; dkim?: string; dmarc?: string } | null;
};

export type Summary = {
  id: string;
  folder: Folder;
  from: Address;
  to: string;
  subject: string;
  snippet: string;
  date: number;
  read: boolean;
  attach: boolean;
};

const INDEX_CAP = 3000;

/** "Nombre <a@b.com>", "<a@b.com>" o "a@b.com". */
export const parseAddress = (raw: string): Address | null => {
  const m = raw.match(/^\s*"?([^"<]*?)"?\s*<([^>]+)>\s*$/);
  const email = (m ? m[2] : raw).trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null;
  return { name: (m?.[1] ?? '').trim(), email };
};

export const parseList = (raw: unknown): Address[] => {
  const items = Array.isArray(raw) ? raw : typeof raw === 'string' ? raw.split(/[,;]/) : [];
  return items.map((s) => (typeof s === 'string' ? parseAddress(s) : null)).filter((a): a is Address => !!a);
};

export const formatAddress = (a: Address) => (a.name ? `${a.name} <${a.email}>` : a.email);

export const ownAddress = (box: Mailbox): Address => ({ name: MAILBOXES[box].shared ? ORG : `${MAILBOXES[box].name} · ${ORG}`, email: `${box}@${MAIL_DOMAIN}` });

/** A qué buzones va un correo recibido. Lo que llega a una dirección que no existe va al buzón comodín (CATCH_ALL). */
export const routeTo = (addresses: Address[]): Mailbox[] => {
  const out = new Set<Mailbox>();
  for (const { email } of addresses) {
    const [local, domain] = email.split('@');
    if (domain !== MAIL_DOMAIN) continue;
    const box = local.split('+')[0];
    out.add(box in MAILBOXES ? (box as Mailbox) : CATCH_ALL);
  }
  if (!out.size) out.add(CATCH_ALL);
  return [...out];
};

export const htmlToText = (html: string) =>
  html
    .replace(/<(style|script|head)[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<br\s*\/?>|<\/(p|div|tr|li|h\d)>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s*\n\s*\n+/g, '\n\n')
    .trim();

export const summaryOf = (msg: MailMessage, folder: Folder, read: boolean): Summary => ({
  id: msg.id,
  folder,
  from: msg.from,
  to: msg.to.map((a) => a.name || a.email).join(', '),
  subject: msg.subject,
  snippet: (msg.text || htmlToText(msg.html)).replace(/\s+/g, ' ').slice(0, 160),
  date: msg.date,
  read,
  attach: msg.attachments.length > 0,
});

export const addToIndex = (box: Mailbox, summary: Summary) =>
  mutate<Summary[]>(mailStore(), `i/${box}`, [], (list) =>
    list.some((s) => s.id === summary.id) ? undefined : [summary, ...list].sort((a, b) => b.date - a.date).slice(0, INDEX_CAP),
  );

export const updateIndex = (box: Mailbox, ids: string[], patch: Partial<Pick<Summary, 'read' | 'folder'>>) =>
  mutate<Summary[]>(mailStore(), `i/${box}`, [], (list) => {
    let changed = false;
    const next = list.map((s) => {
      if (!ids.includes(s.id)) return s;
      changed = true;
      return { ...s, ...patch };
    });
    return changed ? next : undefined;
  });

export const readIndex = async (box: Mailbox) => ((await mailStore().get(`i/${box}`, { type: 'json' })) as Summary[] | null) ?? [];

// --- Firma ---------------------------------------------------------------

const INK = '#1e2a47';
const ACCENT = '#26d1c4';
const MUTED = '#5f6b7a';

/** Sitio público: Netlify da `URL` (el dominio de producción también en las previews). */
const siteUrl = () => (process.env.URL ?? `https://${MAIL_DOMAIN}`).replace(/\/$/, '');

/** "+584140419317" → "+58 414 041 9317" */
const prettyPhone = (phone: string) => phone.replace(/^\+58(\d{3})(\d{3})(\d{4})$/, '+58 $1 $2 $3');

/** Insignia redonda con texto: se ve en cualquier cliente de correo, sin imágenes. */
const badge = (href: string, label: string, title: string) =>
  `<td style="padding-right:6px"><a href="${href}" title="${title}" style="display:block;width:28px;height:28px;border-radius:50%;background:${INK};color:#ffffff;font:700 12px/28px Helvetica,Arial,sans-serif;text-align:center;text-decoration:none">${label}</a></td>`;

const row = (label: string, value: string) =>
  `<tr><td style="padding:1px 10px 1px 0;color:#4a6fa5;font-weight:700;font-size:11px;text-transform:uppercase;letter-spacing:0.04em;white-space:nowrap">${label}</td><td style="padding:1px 0;color:${INK}">${value}</td></tr>`;

/** Firma automática al pie de cada correo enviado desde el panel. */
export const signature = (box: Mailbox) => {
  const site = siteUrl();
  const host = site.replace(/^https?:\/\//, '');
  const mailbox = MAILBOXES[box];
  const sig = mailbox.signature;
  const name = mailbox.shared ? `Equipo ${ORG}` : mailbox.name;

  if (!sig) {
    const text = `--\n${name}\n${ORG}\n${box}@${MAIL_DOMAIN} · ${host}`;
    const html = `<p style="margin-top:28px;border-top:1px solid #e0e0e0;padding-top:16px;font-family:Inter,Helvetica,Arial,sans-serif;font-size:14px;color:${INK}"><strong>${escapeHtml(name)}</strong><br>${ORG} · <a href="${site}" style="color:${MUTED}">${host}</a></p>`;
    return { text, html };
  }

  const phone = prettyPhone(sig.phone);
  const text = [
    '--',
    name,
    sig.role,
    sig.tagline,
    `Móvil: ${phone}`,
    `Web: ${host}`,
    `Dirección: ${sig.address}`,
    `Agendar una cita: ${LINKS.calendly}`,
  ].join('\n');

  const link = `color:${INK};text-decoration:none`;
  const html = `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-top:28px;border-top:1px solid #e0e0e0;padding-top:18px;font-family:Inter,Helvetica,Arial,sans-serif;font-size:13px;line-height:1.5;color:${INK}"><tr>
<td style="padding:18px 18px 0 0;vertical-align:top"><img src="${site}${sig.photo}" width="96" height="96" alt="${escapeHtml(name)}" style="display:block;width:96px;height:96px;border:0;border-radius:50%"></td>
<td style="padding:18px 0 0 18px;vertical-align:top;border-left:3px solid ${ACCENT}">
<div style="font-size:18px;font-weight:700;line-height:1.2">${escapeHtml(name)}</div>
<div style="margin-top:2px;font-size:14px;font-weight:600;color:#4a6fa5">${escapeHtml(sig.role)}</div>
<div style="margin-top:2px;color:${MUTED}">${escapeHtml(sig.tagline)}</div>
<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-top:10px;font-size:13px;line-height:1.6">
${row('Móvil', `<a href="tel:${sig.phone}" style="${link}">${phone}</a>`)}
${row('Web', `<a href="${site}" style="${link}">${host}</a>`)}
${row('Dirección', escapeHtml(sig.address))}
</table>
<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-top:12px"><tr>
${badge(LINKS.facebook, 'f', 'Facebook')}${badge(LINKS.linkedin, 'in', 'LinkedIn')}${badge(LINKS.instagram, 'ig', 'Instagram')}
<td style="padding-left:8px"><a href="${LINKS.calendly}" style="display:inline-block;padding:7px 14px;border-radius:5px;background:${ACCENT};color:${INK};font-weight:700;font-size:13px;line-height:1.2;text-decoration:none">Agendar una cita</a></td>
</tr></table>
</td>
</tr></table>`;
  return { text, html };
};

/** Texto escrito en el panel → HTML sencillo, con enlaces activos. */
export const textToHtml = (text: string) =>
  escapeHtml(text)
    .split(/\n{2,}/)
    .map((p) => `<p style="margin:0 0 14px">${p.replace(/\n/g, '<br>').replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1">$1</a>')}</p>`)
    .join('');

// --- Webhook de Resend ---------------------------------------------------

/**
 * Firma de los webhooks de Resend (formato Svix): HMAC-SHA256 en base64 de
 * `id.timestamp.cuerpo`, con el secreto `whsec_…` decodificado de base64.
 */
export const verifyWebhook = (payload: string, headers: Headers, secret: string) => {
  const id = headers.get('svix-id');
  const ts = headers.get('svix-timestamp');
  const sigs = headers.get('svix-signature');
  if (!id || !ts || !sigs) return false;
  if (!(Math.abs(Date.now() / 1000 - Number(ts)) <= 300)) return false;
  const key = Buffer.from(secret.replace(/^whsec_/, ''), 'base64');
  const expected = createHmac('sha256', key).update(`${id}.${ts}.${payload}`).digest();
  return sigs.split(' ').some((part) => {
    const [version, sig] = part.split(',');
    const given = Buffer.from(sig ?? '', 'base64');
    return version === 'v1' && given.length === expected.length && timingSafeEqual(given, expected);
  });
};
