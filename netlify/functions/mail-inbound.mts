import type { Config } from '@netlify/functions';
import { Resend } from 'resend';
import { fail, handle, isDev, json } from '../lib/http';
import {
  addToIndex, mailStore, parseAddress, parseList, routeTo, summaryOf, verifyWebhook,
  type MailAttachment, type MailMessage,
} from '../lib/inbox';
import { newId } from '../lib/store';

/**
 * Webhook `email.received` de Resend. El aviso trae solo metadatos: el cuerpo
 * y los adjuntos se piden a la API, se copian a Blobs y el correo se reparte
 * entre los buzones a los que iba dirigido.
 */

/** Adjuntos que se copian al llegar; los más grandes se piden a Resend al abrirlos. */
const COPY_MAX = 4 * 1024 * 1024;
const COPY_BUDGET_MS = 6000;

type Received = {
  id: string; from: string; to: string[]; cc?: string[] | null; bcc?: string[] | null; reply_to?: string[] | null;
  received_for?: string[]; subject: string; html: string | null; text: string | null; created_at: string;
  headers?: Record<string, string> | null; message_id: string;
  attachments?: { id: string; filename: string | null; size?: number; content_type: string; content_disposition: string | null }[];
  authentication?: MailMessage['auth'];
};

export default handle(async (req) => {
  if (req.method !== 'POST') return fail(405, 'metodo');
  const secret = process.env.RESEND_WEBHOOK_SECRET;
  const payload = await req.text();
  if (!secret || !verifyWebhook(payload, req.headers, secret)) return fail(401, 'firma_invalida');

  const event = JSON.parse(payload) as { type: string; data: { email_id: string } & Partial<Received> };
  if (event.type !== 'email.received') return json({ ok: true, ignored: event.type });

  const store = mailStore();
  const resendId = event.data.email_id;
  const first = await store.setJSON(`seen/${resendId}`, { t: Date.now() }, { onlyIfNew: true });
  if (!first.modified) return json({ ok: true, duplicate: true });

  try {
    const key = process.env.RESEND_API_KEY;
    const resend = key ? new Resend(key) : null;
    let mail: Received;
    if (resend) {
      const { data, error } = await resend.emails.receiving.get(resendId);
      if (error || !data) throw new Error(`Resend: ${error?.message ?? 'sin datos'}`);
      mail = data as unknown as Received;
    } else if (isDev()) {
      // En `netlify dev` sin clave, la prueba manda el correo completo en el propio aviso.
      mail = { ...(event.data as Received), id: resendId };
    } else {
      throw new Error('RESEND_API_KEY sin configurar');
    }

    const to = parseList(mail.to);
    const cc = parseList(mail.cc ?? []);
    const recipients = [...to, ...cc, ...parseList(mail.bcc ?? []), ...parseList(mail.received_for ?? [])];
    const mailboxes = routeTo(recipients);
    if (!mailboxes.length) return json({ ok: true, ignored: 'otro_dominio' });
    const id = newId('m');
    const attachments: MailAttachment[] = (mail.attachments ?? [])
      // Las imágenes incrustadas ya vienen dentro del HTML.
      .filter((a) => a.content_disposition !== 'inline')
      .map((a) => ({ id: a.id, filename: a.filename || 'adjunto', contentType: a.content_type, size: a.size ?? 0, stored: false }));

    if (resend) {
      const until = Date.now() + COPY_BUDGET_MS;
      for (const att of attachments) {
        if (att.size > COPY_MAX || Date.now() > until) continue;
        try {
          const { data } = await resend.emails.receiving.attachments.get({ emailId: resendId, id: att.id });
          const res = data ? await fetch(data.download_url) : null;
          if (!res?.ok) continue;
          await store.set(`a/${id}/${att.id}`, await res.arrayBuffer());
          att.stored = true;
        } catch {
          // Se intentará otra vez cuando alguien lo abra.
        }
      }
    }

    const msg: MailMessage = {
      id,
      resendId,
      direction: 'in',
      mailboxes,
      from: parseAddress(mail.headers?.from ?? mail.from) ?? parseAddress(mail.from) ?? { name: '', email: mail.from },
      to,
      cc,
      replyTo: parseList(mail.reply_to ?? []),
      subject: mail.subject || '(sin asunto)',
      text: mail.text ?? '',
      html: mail.html ?? '',
      date: Date.parse(mail.created_at) || Date.now(),
      messageId: mail.message_id ?? '',
      references: mail.headers?.references ?? '',
      attachments,
      auth: mail.authentication ?? null,
    };
    await store.setJSON(`m/${id}`, msg);
    for (const box of msg.mailboxes) await addToIndex(box, summaryOf(msg, 'in', false));
    return json({ ok: true, id, mailboxes: msg.mailboxes });
  } catch (err) {
    // Sin la marca, el reintento de Resend lo volverá a procesar.
    await store.delete(`seen/${resendId}`);
    throw err;
  }
}, { origin: false });

export const config: Config = { path: '/api/correo/entrante' };
