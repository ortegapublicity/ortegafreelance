import { createHmac } from 'node:crypto';
import { isDev } from './http';

/** Firma de cookies y códigos de acceso con SESSION_SECRET (secreto en Netlify). */
const secret = () => {
  const s = process.env.SESSION_SECRET;
  if (s && s.length >= 32) return s;
  if (isDev()) return 'solo-para-desarrollo-local-no-usar-en-produccion';
  throw new Error('SESSION_SECRET ausente o demasiado corto');
};

export const hmac = (value: string) => createHmac('sha256', secret()).update(value).digest('base64url');

export const hashCode = (email: string, code: string) => hmac(`otp|${email.toLowerCase()}|${code}`);
