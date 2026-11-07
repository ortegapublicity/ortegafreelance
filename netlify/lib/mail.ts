import { Resend } from 'resend';
import { MAIL_DOMAIN, ORG } from './config';
import { escapeHtml, isDev } from './http';

/**
 * Correo del sistema (códigos de acceso al panel). En local, sin clave, se
 * imprime en la consola de `netlify dev` en vez de enviarse.
 */

const layout = (title: string, body: string) => `<!doctype html>
<html lang="es"><body style="margin:0;background:#ffffff;font-family:Inter,Helvetica,Arial,sans-serif;color:#1e2a47">
  <div style="max-width:520px;margin:0 auto;padding:32px 20px">
    <div style="height:6px;border-radius:6px;background:#26d1c4;margin-bottom:24px"></div>
    <p style="margin:0 0 24px;font-weight:800;font-size:18px;letter-spacing:-0.02em">${ORG}</p>
    <h1 style="margin:0 0 16px;font-size:26px;line-height:1.15;letter-spacing:-0.02em">${title}</h1>
    <div style="font-size:16px;line-height:1.6;color:#5f6b7a">${body}</div>
  </div>
</body></html>`;

type Mail = { to: string; subject: string; title: string; body: string };

export const send = async ({ to, subject, title, body }: Mail) => {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.MAIL_FROM || `${ORG} <hola@${MAIL_DOMAIN}>`;
  if (!key) {
    if (isDev()) {
      console.info(`\n[correo de desarrollo] para ${to}: ${subject}\n${body.replace(/<[^>]+>/g, '')}\n`);
      return;
    }
    throw new Error('RESEND_API_KEY sin configurar');
  }
  const { error } = await new Resend(key).emails.send({ from, to, subject, html: layout(escapeHtml(title), body) });
  if (error) throw new Error(`Resend: ${error.message}`);
};
