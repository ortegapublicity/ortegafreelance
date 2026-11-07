import { timingSafeEqual } from 'node:crypto';
import { MAILBOXES, type Mailbox } from './config';
import { hmac } from './auth';
import { HttpError, isDev } from './http';

/**
 * Acceso del equipo a /sistemas/. Cada persona entra con un código que llega
 * a su correo personal, no al buzón @ortegafreelance.com que va a leer.
 *
 * TEAM_LOGIN en Netlify: `raul:correo@personal.com`.
 * Varias personas pueden entrar al mismo buzón.
 * Quien tiene buzón propio ve el suyo y el compartido; admin ve todos.
 */

const COOKIE = 'of_team';
const SESSION_DAYS = 14;

export type Member = { mailbox: Mailbox; email: string };

export const members = (): Member[] =>
  (process.env.TEAM_LOGIN ?? '')
    .split(',')
    .map((pair) => pair.trim().split(':'))
    .filter(([box, email]) => box in MAILBOXES && /@/.test(email ?? ''))
    .map(([box, email]) => ({ mailbox: box as Mailbox, email: email.trim().toLowerCase() }));

export const memberByEmail = (email: string) => members().find((m) => m.email === email.toLowerCase()) ?? null;

export const mailboxesFor = (m: Mailbox): Mailbox[] =>
  (Object.keys(MAILBOXES) as Mailbox[]).filter((b) => MAILBOXES[m].admin || b === m || MAILBOXES[b].shared);

export const teamCookie = (mailbox: Mailbox) => {
  const value = `${mailbox}.${Date.now() + SESSION_DAYS * 86_400_000}`;
  const secure = isDev() ? '' : '; Secure';
  return `${COOKIE}=${value}.${hmac(`team|${value}`)}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${SESSION_DAYS * 86_400}${secure}`;
};

export const clearTeamCookie = () => `${COOKIE}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0`;

export const currentMember = (req: Request): Mailbox | null => {
  const raw = req.headers.get('cookie')?.match(new RegExp(`${COOKIE}=([^;]+)`))?.[1];
  if (!raw) return null;
  const [box, exp, sig] = raw.split('.');
  if (!(box in MAILBOXES) || Number(exp) < Date.now() || !sig) return null;
  const expected = hmac(`team|${box}.${exp}`);
  if (sig.length !== expected.length || !timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  // Si alguien sale del equipo basta con quitarlo de TEAM_LOGIN.
  return members().some((m) => m.mailbox === box) ? (box as Mailbox) : null;
};

export const requireMember = (req: Request) => {
  const box = currentMember(req);
  if (!box) throw new HttpError(401, 'inicia_sesion');
  return { box, access: mailboxesFor(box) };
};

export const requireAccess = (access: Mailbox[], mailbox: unknown): Mailbox => {
  if (typeof mailbox !== 'string' || !access.includes(mailbox as Mailbox)) throw new HttpError(403, 'sin_acceso');
  return mailbox as Mailbox;
};
