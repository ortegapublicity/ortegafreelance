import type { Config } from '@netlify/functions';
import { randomInt } from 'node:crypto';
import { Resend } from 'resend';
import { MAILBOXES, MAIL_DOMAIN, ORG, type Mailbox } from '../lib/config';
import { hashCode } from '../lib/auth';
import { HttpError, clean, fail, handle, isDev, json, readJson } from '../lib/http';
import {
  addToIndex, formatAddress, htmlToText, mailStore, ownAddress, parseList, readIndex, signature, summaryOf,
  textToHtml, updateIndex, type Folder, type MailAttachment, type MailMessage,
} from '../lib/inbox';
import { send } from '../lib/mail';
import { authStore, getJSON, newId } from '../lib/store';
import { clearTeamCookie, memberByEmail, requireAccess, requireMember, teamCookie } from '../lib/team';

/**
 * Panel del equipo (/sistemas/): acceso, buzones, lectura, envío y adjuntos.
 *
 *   POST /api/sistemas/acceso/solicitar|verificar|salir
 *   GET  /api/sistemas/yo
 *   GET  /api/sistemas/buzon/<buzón>?carpeta=in|sent|trash
 *   GET  /api/sistemas/mensaje/<id>?buzon=<buzón>
 *   POST /api/sistemas/marcar          { buzon, ids, read?, folder? }
 *   POST /api/sistemas/enviar          { de, para, cc, asunto, cuerpo, ref?, adjuntos? }
 *   GET  /api/sistemas/adjunto/<id>/<adjunto>
 */

const CODE_TTL = 10 * 60_000;
const RESEND_AFTER = 45_000;
const UPLOAD_MAX = 4 * 1024 * 1024;
const FOLDERS: Record<Folder, true> = { in: true, sent: true, trash: true };

type Otp = { hash: string; exp: number; tries: number; sentAt: number };

const resend = () => {
  const key = process.env.RESEND_API_KEY;
  return key ? new Resend(key) : null;
};

const loadMessage = async (id: string, access: Mailbox[]) => {
  const msg = await getJSON<MailMessage>(mailStore(), `m/${clean(id, 40)}`);
  if (!msg) throw new HttpError(404, 'no_existe');
  if (!msg.mailboxes.some((b) => access.includes(b))) throw new HttpError(403, 'sin_acceso');
  return msg;
};

const quote = (msg: MailMessage) => {
  const when = new Date(msg.date).toLocaleString('es-VE', { dateStyle: 'long', timeStyle: 'short', timeZone: 'America/Caracas' });
  const head = `El ${when}, ${formatAddress(msg.from)} escribió:`;
  const body = msg.text || htmlToText(msg.html);
  return {
    text: `\n\n${head}\n${body.split('\n').map((l) => `> ${l}`).join('\n')}`,
    html: `<p style="margin:24px 0 8px;color:#5f6b7a;font-size:13px">${textToHtml(head).replace(/<\/?p[^>]*>/g, '')}</p><blockquote style="margin:0;padding:0 0 0 14px;border-left:3px solid #e0e0e0;color:#5f6b7a">${msg.html || textToHtml(msg.text)}</blockquote>`,
  };
};

const attachmentResponse = (data: ArrayBuffer, att: MailAttachment) =>
  new Response(data, {
    headers: {
      'content-type': att.contentType || 'application/octet-stream',
      'content-disposition': `attachment; filename*=UTF-8''${encodeURIComponent(att.filename)}`,
      'cache-control': 'private, max-age=3600',
      'x-content-type-options': 'nosniff',
    },
  });

export default handle(async (req, url) => {
  const [, , , section, a, b] = url.pathname.split('/');

  // --- Acceso -----------------------------------------------------------
  if (section === 'acceso') {
    if (req.method !== 'POST') return fail(405, 'metodo');
    if (a === 'salir') return json({ ok: true }, 200, { 'set-cookie': clearTeamCookie() });
    const body = await readJson<{ email?: string; code?: string }>(req);
    const email = clean(body.email, 120).toLowerCase();
    const member = memberByEmail(email);
    const otpKey = `team-otp/${email}`;

    if (a === 'solicitar') {
      // Misma respuesta exista o no: no se revela quién es del equipo.
      if (!member) return json({ ok: true });
      const prev = await getJSON<Otp>(authStore(), otpKey);
      if (prev && Date.now() - prev.sentAt < RESEND_AFTER) return fail(429, 'espera_un_momento');
      const code = String(randomInt(0, 1_000_000)).padStart(6, '0');
      await authStore().setJSON(otpKey, { hash: hashCode(`team|${email}`, code), exp: Date.now() + CODE_TTL, tries: 0, sentAt: Date.now() } satisfies Otp);
      await send({
        to: email,
        subject: `${code} es tu código del panel de ${ORG}`,
        title: 'Acceso al panel del equipo',
        body: `<p>Escríbelo en ${MAIL_DOMAIN}/sistemas para entrar a tu buzón:</p><p style="font-size:34px;font-weight:800;letter-spacing:0.18em;color:#1e2a47;margin:12px 0">${code}</p><p>Caduca en 10 minutos. Si no lo pediste, ignora este correo.</p>`,
      });
      return json({ ok: true, ...(isDev() && !process.env.RESEND_API_KEY ? { devCode: code } : {}) });
    }

    if (a === 'verificar') {
      const otp = await getJSON<Otp>(authStore(), otpKey);
      if (!member || !otp || otp.exp < Date.now()) return fail(400, 'codigo_caducado');
      if (otp.tries >= 5) return fail(429, 'demasiados_intentos');
      if (otp.hash !== hashCode(`team|${email}`, clean(body.code, 6))) {
        await authStore().setJSON(otpKey, { ...otp, tries: otp.tries + 1 });
        return fail(400, 'codigo_incorrecto');
      }
      await authStore().delete(otpKey);
      return json({ ok: true }, 200, { 'set-cookie': teamCookie(member.mailbox) });
    }
    return fail(404, 'ruta');
  }

  const { box: me, access } = requireMember(req);

  // --- Lectura ----------------------------------------------------------
  if (section === 'yo' && req.method === 'GET') {
    const boxes = await Promise.all(
      access.map(async (box) => {
        const list = await readIndex(box);
        return { box, name: MAILBOXES[box].name, address: `${box}@${MAIL_DOMAIN}`, unread: list.filter((s) => s.folder === 'in' && !s.read).length };
      }),
    );
    return json({ ok: true, me: { box: me, name: MAILBOXES[me].name, address: `${me}@${MAIL_DOMAIN}`, admin: MAILBOXES[me].admin }, boxes, signatures: Object.fromEntries(access.map((x) => [x, signature(x).html])) });
  }

  if (section === 'buzon' && req.method === 'GET') {
    const box = requireAccess(access, a);
    const folder = (url.searchParams.get('carpeta') ?? 'in') as Folder;
    if (!FOLDERS[folder]) return fail(400, 'carpeta');
    const list = (await readIndex(box)).filter((s) => s.folder === folder);
    return json({ ok: true, items: list.slice(0, 500), total: list.length });
  }

  if (section === 'mensaje' && req.method === 'GET') {
    const msg = await loadMessage(a, access);
    const box = url.searchParams.get('buzon');
    if (box && access.includes(box as Mailbox) && msg.mailboxes.includes(box as Mailbox)) await updateIndex(box as Mailbox, [msg.id], { read: true });
    return json({ ok: true, message: msg });
  }

  if (section === 'marcar' && req.method === 'POST') {
    const body = await readJson<{ buzon?: string; ids?: string[]; read?: boolean; folder?: Folder }>(req);
    const box = requireAccess(access, body.buzon);
    const ids = (Array.isArray(body.ids) ? body.ids : []).map((x) => clean(x, 40)).slice(0, 200);
    const patch: { read?: boolean; folder?: Folder } = {};
    if (typeof body.read === 'boolean') patch.read = body.read;
    if (body.folder && FOLDERS[body.folder]) patch.folder = body.folder;
    await updateIndex(box, ids, patch);
    return json({ ok: true });
  }

  // --- Adjuntos ---------------------------------------------------------
  if (section === 'adjunto' && req.method === 'GET') {
    const msg = await loadMessage(a, access);
    const att = msg.attachments.find((x) => x.id === b);
    if (!att) return fail(404, 'no_existe');
    const store = mailStore();
    if (att.stored) {
      const data = await store.get(`a/${msg.id}/${att.id}`, { type: 'arrayBuffer' });
      if (data) return attachmentResponse(data, att);
    }
    const client = resend();
    if (!client || msg.direction !== 'in') return fail(410, 'adjunto_no_disponible');
    const { data } = await client.emails.receiving.attachments.get({ emailId: msg.resendId, id: att.id });
    // Resend conserva los correos 30 días: pasado ese plazo solo queda lo copiado.
    if (!data) return fail(410, 'adjunto_no_disponible');
    if (att.size > UPLOAD_MAX) return Response.redirect(data.download_url, 302);
    const res = await fetch(data.download_url);
    if (!res.ok) return fail(502, 'adjunto_no_disponible');
    const bytes = await res.arrayBuffer();
    await store.set(`a/${msg.id}/${att.id}`, bytes);
    return attachmentResponse(bytes, att);
  }

  // --- Envío ------------------------------------------------------------
  if (section === 'enviar' && req.method === 'POST') {
    const body = await readJson<{
      de?: string; para?: string; cc?: string; asunto?: string; cuerpo?: string;
      ref?: { id?: string; modo?: 'responder' | 'reenviar' };
      adjuntos?: { filename?: string; contentType?: string; data?: string }[];
    }>(req, 5_800_000);
    const from = requireAccess(access, body.de);
    const to = parseList(clean(body.para, 2000));
    const cc = parseList(clean(body.cc, 2000));
    if (!to.length) return fail(400, 'falta_destinatario');
    if (to.length + cc.length > 20) return fail(400, 'demasiados_destinatarios');
    const subject = clean(body.asunto, 200) || '(sin asunto)';
    const text = clean(body.cuerpo, 50_000);

    const uploads = (Array.isArray(body.adjuntos) ? body.adjuntos : []).slice(0, 10).map((x) => ({
      filename: clean(x.filename, 120).replace(/[\\/]/g, '_') || 'adjunto',
      contentType: clean(x.contentType, 100) || 'application/octet-stream',
      content: Buffer.from(typeof x.data === 'string' ? x.data : '', 'base64'),
    }));

    const ref = body.ref?.id ? await loadMessage(body.ref.id, access) : null;
    const headers: Record<string, string> = {};
    if (ref && body.ref?.modo === 'responder' && ref.messageId) {
      headers['In-Reply-To'] = ref.messageId;
      headers.References = `${ref.references} ${ref.messageId}`.trim();
    }
    if (ref && body.ref?.modo === 'reenviar') {
      for (const att of ref.attachments.filter((x) => x.stored)) {
        const data = await mailStore().get(`a/${ref.id}/${att.id}`, { type: 'arrayBuffer' });
        if (data) uploads.push({ filename: att.filename, contentType: att.contentType, content: Buffer.from(data) });
      }
    }
    if (uploads.reduce((n, u) => n + u.content.length, 0) > UPLOAD_MAX) return fail(413, 'adjuntos_grandes');

    const sig = signature(from);
    const quoted = ref ? quote(ref) : null;
    const html = `<div style="font-family:Inter,Helvetica,Arial,sans-serif;font-size:15px;line-height:1.6;color:#1e2a47">${textToHtml(text)}${sig.html}${quoted?.html ?? ''}</div>`;
    const plain = `${text}\n\n${sig.text}${quoted?.text ?? ''}`;

    const client = resend();
    let resendId = '';
    if (client) {
      const { data, error } = await client.emails.send({
        from: formatAddress(ownAddress(from)),
        to: to.map(formatAddress),
        cc: cc.length ? cc.map(formatAddress) : undefined,
        subject,
        html,
        text: plain,
        headers: Object.keys(headers).length ? headers : undefined,
        attachments: uploads.length ? uploads.map((u) => ({ filename: u.filename, content: u.content, contentType: u.contentType })) : undefined,
      });
      if (error || !data) throw new Error(`Resend: ${error?.message ?? 'sin respuesta'}`);
      resendId = data.id;
    } else if (!isDev()) {
      return fail(503, 'correo_no_disponible');
    } else {
      console.info(`\n[correo de desarrollo] ${from}@ → ${to.map((x) => x.email).join(', ')}: ${subject}\n${plain}\n`);
    }

    const id = newId('m');
    const attachments: MailAttachment[] = [];
    for (const u of uploads) {
      const attId = newId('a');
      await mailStore().set(`a/${id}/${attId}`, new Uint8Array(u.content).buffer);
      attachments.push({ id: attId, filename: u.filename, contentType: u.contentType, size: u.content.length, stored: true });
    }
    const msg: MailMessage = {
      id, resendId, direction: 'out', mailboxes: [from], from: ownAddress(from), to, cc, replyTo: [],
      subject, text: plain, html, date: Date.now(), messageId: '', references: headers.References ?? '', attachments, auth: null,
    };
    await mailStore().setJSON(`m/${id}`, msg);
    await addToIndex(from, summaryOf(msg, 'sent', true));
    return json({ ok: true, id });
  }

  return fail(404, 'ruta');
});

export const config: Config = { path: '/api/sistemas/*' };
