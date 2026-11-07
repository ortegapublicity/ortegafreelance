/** Utilidades del panel /sistemas/: llamadas a la API, avisos y atajos del DOM. */

const MESSAGES: Record<string, string> = {
  inicia_sesion: 'Entra con tu correo para continuar.',
  espera_un_momento: 'Espera unos segundos antes de pedir otro código.',
  codigo_incorrecto: 'Código incorrecto.',
  codigo_caducado: 'El código caducó. Pide uno nuevo.',
  demasiados_intentos: 'Demasiados intentos. Pide un código nuevo.',
  sin_acceso: 'No tienes acceso a ese buzón.',
  falta_destinatario: 'Escribe al menos un destinatario válido.',
  demasiados_destinatarios: 'Máximo 20 destinatarios por correo.',
  adjuntos_grandes: 'Los adjuntos pasan de 4 MB.',
  adjunto_no_disponible: 'Ese adjunto ya no está disponible.',
  correo_no_disponible: 'El envío de correo aún no está configurado.',
  origen_no_permitido: 'Abre el panel desde ortegafreelance.com.',
  red: 'Sin conexión. Revisa tu internet e inténtalo de nuevo.',
};

export class ApiError extends Error {
  constructor(public code: string, public status: number) {
    super(MESSAGES[code] ?? 'Algo salió mal. Inténtalo de nuevo.');
  }
}

export const api = async <T = any>(path: string, init: { method?: string; body?: unknown } = {}): Promise<T> => {
  const res = await fetch(path, {
    method: init.method ?? (init.body ? 'POST' : 'GET'),
    headers: init.body ? { 'content-type': 'application/json' } : undefined,
    body: init.body ? JSON.stringify(init.body) : undefined,
    credentials: 'same-origin',
  });
  const data = await res.json().catch(() => ({ ok: false, error: 'red' }));
  if (!res.ok || data.ok === false) throw new ApiError(data.error ?? 'red', res.status);
  return data as T;
};

let toastTimer = 0;
export const toast = (text: string, error = false) => {
  const el = document.querySelector<HTMLElement>('.toast');
  if (!el) return;
  el.textContent = text;
  el.classList.toggle('err', error);
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => el.classList.remove('show'), 3800);
};

export const toastError = (err: unknown) => toast(err instanceof Error ? err.message : 'Algo salió mal.', true);

export const $ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) => root.querySelector<T>(sel)!;
export const $$ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) => [...root.querySelectorAll<T>(sel)];

export const esc = (s: unknown) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
