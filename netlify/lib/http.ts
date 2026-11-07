export const json = (body: unknown, status = 200, headers: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...headers },
  });

export const fail = (status: number, error: string, detail?: string) => {
  if (status >= 500) console.error(`${error}${detail ? ` (${detail})` : ''}`);
  return json({ ok: false, error }, status);
};

export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

const ALLOWED_ORIGIN = /^https:\/\/(www\.)?ortegafreelance\.com$|^https:\/\/([a-z0-9-]+--)?ortegafreelance\.netlify\.app$|^https?:\/\/localhost(:\d+)?$|^https?:\/\/127\.0\.0\.1(:\d+)?$/;

/**
 * Las escrituras exigen un Origin propio. Junto con la cookie SameSite=Strict
 * basta como defensa CSRF sin tokens extra.
 */
export const checkOrigin = (req: Request) => {
  if (req.method === 'GET' || req.method === 'HEAD') return;
  const origin = req.headers.get('origin');
  const site = process.env.PUBLIC_SITE_URL?.replace(/\/$/, '');
  if (!origin || !(origin === site || ALLOWED_ORIGIN.test(origin))) throw new HttpError(403, 'origen_no_permitido');
};

export const readJson = async <T = Record<string, unknown>>(req: Request, maxBytes = 64_000): Promise<T> => {
  if (!req.headers.get('content-type')?.includes('application/json')) throw new HttpError(415, 'se_esperaba_json');
  const text = await req.text();
  if (text.length > maxBytes) throw new HttpError(413, 'demasiado_grande');
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new HttpError(400, 'json_invalido');
  }
};

/**
 * Envuelve un handler: traduce HttpError a respuestas y registra el resto.
 * `origin: false` solo para webhooks, que se autentican con su propia firma.
 */
export const handle = (fn: (req: Request, url: URL) => Promise<Response>, { origin = true } = {}) => async (req: Request) => {
  try {
    if (origin) checkOrigin(req);
    return await fn(req, new URL(req.url));
  } catch (err) {
    if (err instanceof HttpError) return fail(err.status, err.message);
    return fail(500, 'error_interno', err instanceof Error ? err.stack ?? err.message : String(err));
  }
};

export const clean = (value: unknown, max = 200) => (typeof value === 'string' ? value.trim().slice(0, max) : '');



export const escapeHtml = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

export const isDev = () => process.env.NETLIFY_DEV === 'true' || process.env.CONTEXT === 'dev';
