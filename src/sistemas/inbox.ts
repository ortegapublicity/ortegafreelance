/** Panel /sistemas/: acceso del equipo, buzones, lectura y redacción. */
import './sistemas.css';
import { $, $$, ApiError, api, esc, toast, toastError } from './panel-core';

type Address = { name: string; email: string };
type Folder = 'in' | 'sent' | 'trash';
type Summary = { id: string; folder: Folder; from: Address; to: string; subject: string; snippet: string; date: number; read: boolean; attach: boolean };
type Box = { box: string; name: string; address: string; unread: number; admin?: boolean };
type Message = {
  id: string; direction: 'in' | 'out'; mailboxes: string[]; from: Address; to: Address[]; cc: Address[]; replyTo: Address[];
  subject: string; text: string; html: string; date: number;
  attachments: { id: string; filename: string; contentType: string; size: number }[];
  auth: { spf?: string; dkim?: string; dmarc?: string } | null;
};

const FOLDER_NAMES: Record<Folder, string> = { in: 'Recibidos', sent: 'Enviados', trash: 'Papelera' };
const UPLOAD_MAX = 4 * 1024 * 1024;

const state = {
  me: null as Box | null,
  boxes: [] as Box[],
  signatures: {} as Record<string, string>,
  box: '',
  folder: 'in' as Folder,
  items: [] as Summary[],
  open: null as Message | null,
  showImages: false,
  query: '',
};

const app = $('[data-app]');
const fmtAddr = (a: Address) => (a.name ? `${a.name} <${a.email}>` : a.email);
const who = (a: Address) => a.name || a.email;

const when = (t: number, long = false) => {
  const d = new Date(t);
  if (long) return d.toLocaleString('es-VE', { dateStyle: 'full', timeStyle: 'short' });
  const now = new Date();
  if (d.toDateString() === now.toDateString()) return d.toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' });
  if (d.getFullYear() === now.getFullYear()) return d.toLocaleDateString('es-VE', { day: 'numeric', month: 'short' });
  return d.toLocaleDateString('es-VE', { day: '2-digit', month: '2-digit', year: '2-digit' });
};

const size = (n: number) => (n > 1_048_576 ? `${(n / 1_048_576).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`);

// --- Acceso ---------------------------------------------------------------

const showLogin = () => {
  app.hidden = true;
  $('[data-login]').hidden = false;
};

const wireLogin = () => {
  const [emailForm, codeForm] = ['email', 'code'].map((s) => $<HTMLFormElement>(`[data-login] form[data-step="${s}"]`));
  let email = '';
  emailForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    email = (emailForm.elements.namedItem('email') as HTMLInputElement).value.trim();
    try {
      const r = await api<{ devCode?: string }>('/api/sistemas/acceso/solicitar', { body: { email } });
      emailForm.hidden = true;
      codeForm.hidden = false;
      const input = codeForm.elements.namedItem('code') as HTMLInputElement;
      if (r.devCode) input.value = r.devCode;
      input.focus();
      toast('Si tu correo está autorizado, te llegó un código.');
    } catch (err) {
      toastError(err);
    }
  });
  codeForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const code = (codeForm.elements.namedItem('code') as HTMLInputElement).value.trim();
    try {
      await api('/api/sistemas/acceso/verificar', { body: { email, code } });
      $('[data-login]').hidden = true;
      await start();
    } catch (err) {
      toastError(err);
    }
  });
  $('[data-back]').addEventListener('click', () => {
    codeForm.hidden = true;
    emailForm.hidden = false;
  });
};

// --- Buzones y lista --------------------------------------------------------

const loadMe = async () => {
  const r = await api<{ me: Box; boxes: Box[]; signatures: Record<string, string> }>('/api/sistemas/yo');
  state.me = r.me;
  state.boxes = r.boxes;
  state.signatures = r.signatures;
  if (!state.box) state.box = r.boxes.find((b) => b.box === r.me.box)?.box ?? r.boxes[0]?.box ?? '';
  $('[data-me]').textContent = r.me.address;
  renderBoxes();
};

const renderBoxes = () => {
  $('[data-boxes]').innerHTML = state.boxes
    .map((b) => `<button type="button" data-box="${b.box}" aria-current="${b.box === state.box}"><span>${esc(b.name)}<small>${esc(b.address)}</small></span>${b.unread ? `<span class="sys-badge">${b.unread}</span>` : ''}</button>`)
    .join('');
  $$('[data-folder]').forEach((el) => el.setAttribute('aria-current', String(el.dataset.folder === state.folder)));
  const box = state.boxes.find((b) => b.box === state.box);
  document.title = `${box?.unread ? `(${box.unread}) ` : ''}Sistemas · Ortega Freelance`;
};

const loadList = async () => {
  const r = await api<{ items: Summary[] }>(`/api/sistemas/buzon/${state.box}?carpeta=${state.folder}`);
  state.items = r.items;
  renderList();
};

const renderList = () => {
  const box = state.boxes.find((b) => b.box === state.box);
  $('[data-list-title]').textContent = `${FOLDER_NAMES[state.folder]} · ${box?.name ?? ''}`;
  const q = state.query.toLowerCase();
  const items = q ? state.items.filter((s) => `${s.from.name} ${s.from.email} ${s.to} ${s.subject} ${s.snippet}`.toLowerCase().includes(q)) : state.items;
  $('[data-list]').innerHTML = items.length
    ? items
        .map((s) => {
          const name = state.folder === 'sent' ? `Para: ${s.to}` : who(s.from);
          return `<li><button type="button" data-id="${s.id}" class="${s.read ? '' : 'unread'}" aria-current="${state.open?.id === s.id}">
            <span class="l1"><span class="who">${esc(name)}</span><span class="when">${s.attach ? '📎 ' : ''}${when(s.date)}</span></span>
            <span class="subj">${esc(s.subject)}</span><span class="snip">${esc(s.snippet)}</span></button></li>`;
        })
        .join('')
    : `<li class="none">${q ? 'Nada coincide con la búsqueda.' : state.folder === 'in' ? 'No hay correos todavía.' : 'Vacío.'}</li>`;
};

// --- Lectura -------------------------------------------------------------------

const frameDoc = (msg: Message) => {
  const remote = state.showImages ? ' https: http:' : '';
  const csp = `default-src 'none'; img-src data: cid:${remote}; style-src 'unsafe-inline'${remote}; font-src data:${remote}`;
  const body = msg.html || `<pre>${esc(msg.text)}</pre>`;
  return `<!doctype html><html><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="${csp}"><base target="_blank">
<style>html,body{margin:0;padding:0}body{font:15px/1.6 Inter,Helvetica,Arial,sans-serif;color:#1e2a47;overflow-wrap:anywhere}img{max-width:100%;height:auto}pre{white-space:pre-wrap;font:inherit;margin:0}table{max-width:100%}${state.showImages ? '' : 'img[src^="http"]{display:none}'}</style></head><body>${body}</body></html>`;
};

const fitFrame = (frame: HTMLIFrameElement) => {
  const doc = frame.contentDocument;
  if (doc) frame.style.height = `${doc.documentElement.scrollHeight + 8}px`;
};

const renderMessage = () => {
  const msg = state.open;
  $('[data-empty]').hidden = !!msg;
  $('[data-message]').hidden = !msg;
  if (!msg) return;
  $('[data-subject]').textContent = msg.subject;
  const line = (label: string, list: Address[]) => (list.length ? `<span>${label}: ${esc(list.map(fmtAddr).join(', '))}</span>` : '');
  $('[data-meta]').innerHTML = `<span><b>${esc(who(msg.from))}</b> &lt;${esc(msg.from.email)}&gt;</span>${line('Para', msg.to)}${line('Cc', msg.cc)}<span>${when(msg.date, true)}</span>`;

  const failed = msg.auth && Object.entries(msg.auth).filter(([, v]) => v === 'fail').map(([k]) => k.toUpperCase());
  const warn = $('[data-auth-warn]');
  warn.hidden = !failed?.length;
  if (failed?.length) warn.textContent = `Cuidado: este correo no pasó la verificación ${failed.join(', ')}. Puede no venir de quien dice. No abras enlaces ni adjuntos si no lo esperabas.`;

  const hasRemote = /<img[^>]+src=["']?https?:|url\(\s*["']?https?:/i.test(msg.html);
  $('[data-images]').hidden = !hasRemote || state.showImages;

  const frame = $<HTMLIFrameElement>('[data-frame]');
  frame.onload = () => {
    fitFrame(frame);
    // Las imágenes cambian la altura al cargar.
    frame.contentDocument?.querySelectorAll('img').forEach((img) => img.addEventListener('load', () => fitFrame(frame)));
  };
  frame.srcdoc = frameDoc(msg);

  $('[data-atts]').innerHTML = msg.attachments
    .map((a) => `<a class="chip" href="/api/sistemas/adjunto/${msg.id}/${a.id}" download="${esc(a.filename)}">📎 ${esc(a.filename)} · ${size(a.size)}</a>`)
    .join('');
  $<HTMLButtonElement>('[data-act="trash"]').textContent = state.folder === 'trash' ? 'Restaurar' : 'Papelera';
};

const openMessage = async (id: string) => {
  try {
    const r = await api<{ message: Message }>(`/api/sistemas/mensaje/${id}?buzon=${state.box}`);
    state.open = r.message;
    state.showImages = false;
    app.classList.add('reading');
    const item = state.items.find((s) => s.id === id);
    if (item && !item.read) {
      item.read = true;
      const box = state.boxes.find((b) => b.box === state.box);
      if (box && state.folder === 'in') box.unread = Math.max(0, box.unread - 1);
      renderBoxes();
    }
    renderList();
    renderMessage();
  } catch (err) {
    toastError(err);
  }
};

const mark = async (patch: { read?: boolean; folder?: Folder }) => {
  if (!state.open) return;
  await api('/api/sistemas/marcar', { body: { buzon: state.box, ids: [state.open.id], ...patch } });
  state.open = null;
  app.classList.remove('reading');
  renderMessage();
  await refresh();
};

// --- Redactar ----------------------------------------------------------------

const dialog = $<HTMLDialogElement>('[data-compose-dialog]');
const form = $<HTMLFormElement>('[data-compose-form]');
let ref: { id: string; modo: 'responder' | 'reenviar' } | null = null;

const field = (name: string) => form.elements.namedItem(name) as HTMLInputElement;

const compose = (mode: 'nuevo' | 'responder' | 'todos' | 'reenviar') => {
  form.reset();
  const msg = state.open;
  const own = new Set(state.boxes.map((b) => b.address));
  const from = msg?.mailboxes.find((b) => state.boxes.some((x) => x.box === b)) ?? state.box;
  $<HTMLSelectElement>('[data-from]').innerHTML = state.boxes
    .map((b) => `<option value="${b.box}" ${b.box === (mode === 'nuevo' ? state.box : from) ? 'selected' : ''}>${esc(b.name)} &lt;${esc(b.address)}&gt;</option>`)
    .join('');
  ref = null;
  const note = $('[data-ref-note]');
  note.hidden = true;
  if (msg && mode !== 'nuevo') {
    const base = msg.subject.replace(/^((re|rv|fw|fwd)\s*:\s*)+/i, '');
    if (mode === 'reenviar') {
      field('asunto').value = `Rv: ${base}`;
      ref = { id: msg.id, modo: 'reenviar' };
      note.textContent = `Se adjunta el correo original${msg.attachments.length ? ' con sus archivos' : ''}.`;
    } else {
      const target = msg.direction === 'out' ? msg.to : msg.replyTo.length ? msg.replyTo : [msg.from];
      field('para').value = target.map(fmtAddr).join(', ');
      if (mode === 'todos') field('cc').value = [...msg.to, ...msg.cc].filter((a) => !own.has(a.email) && !target.some((t) => t.email === a.email)).map(fmtAddr).join(', ');
      field('asunto').value = `Re: ${base}`;
      ref = { id: msg.id, modo: 'responder' };
      note.textContent = 'Se cita el correo original debajo de tu firma.';
    }
    note.hidden = false;
  }
  $('[data-compose-title]').textContent = mode === 'nuevo' ? 'Nuevo correo' : mode === 'reenviar' ? 'Reenviar' : 'Responder';
  paintSignature();
  dialog.showModal();
  (mode === 'nuevo' || mode === 'reenviar' ? field('para') : (form.elements.namedItem('cuerpo') as HTMLTextAreaElement)).focus();
};

const paintSignature = () => {
  // HTML de la firma generado por el servidor (netlify/lib/inbox.ts), no por quien escribe: es seguro pintarlo.
  $('[data-sig]').innerHTML = state.signatures[$<HTMLSelectElement>('[data-from]').value] ?? '';
};

const readFile = (file: File) =>
  new Promise<{ filename: string; contentType: string; data: string }>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve({ filename: file.name, contentType: file.type || 'application/octet-stream', data: String(reader.result).split(',')[1] ?? '' });
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

const wireCompose = () => {
  $('[data-from]').addEventListener('change', paintSignature);
  $$('[data-compose-close]').forEach((b) => b.addEventListener('click', () => dialog.close()));
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const files = [...(field('files').files ?? [])];
    if (files.reduce((n, f) => n + f.size, 0) > UPLOAD_MAX) return toast('Los adjuntos pasan de 4 MB. Envía un enlace para archivos grandes.', true);
    const btn = form.querySelector<HTMLButtonElement>('button[type="submit"]')!;
    btn.disabled = true;
    try {
      await api('/api/sistemas/enviar', {
        body: {
          de: field('de').value,
          para: field('para').value,
          cc: field('cc').value,
          asunto: field('asunto').value,
          cuerpo: (form.elements.namedItem('cuerpo') as HTMLTextAreaElement).value,
          ref,
          adjuntos: await Promise.all(files.map(readFile)),
        },
      });
      dialog.close();
      toast('Enviado.');
      if (state.folder === 'sent') await loadList();
    } catch (err) {
      toastError(err);
    } finally {
      btn.disabled = false;
    }
  });
};

// --- Arranque -----------------------------------------------------------------

const refresh = async () => {
  await loadMe();
  await loadList();
};

const wireApp = () => {
  $('[data-boxes]').addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest<HTMLButtonElement>('[data-box]');
    if (!btn) return;
    state.box = btn.dataset.box!;
    state.folder = 'in';
    state.open = null;
    app.classList.remove('reading', 'nav-open');
    renderBoxes();
    renderMessage();
    loadList().catch(toastError);
  });
  $$('[data-folder]').forEach((btn) =>
    btn.addEventListener('click', () => {
      state.folder = btn.dataset.folder as Folder;
      state.open = null;
      app.classList.remove('reading', 'nav-open');
      renderBoxes();
      renderMessage();
      loadList().catch(toastError);
    }),
  );
  $('[data-list]').addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest<HTMLButtonElement>('[data-id]');
    if (btn) openMessage(btn.dataset.id!);
  });
  $('[data-search]').addEventListener('input', (e) => {
    state.query = (e.target as HTMLInputElement).value;
    renderList();
  });
  $('[data-refresh]').addEventListener('click', () => refresh().catch(toastError));
  $('[data-nav-toggle]').addEventListener('click', () => app.classList.toggle('nav-open'));
  $('[data-back-list]').addEventListener('click', () => app.classList.remove('reading'));
  $('[data-compose]').addEventListener('click', () => {
    app.classList.remove('nav-open');
    state.open = null;
    compose('nuevo');
  });
  $('[data-show-images]').addEventListener('click', () => {
    state.showImages = true;
    renderMessage();
  });
  $$('[data-act]').forEach((btn) =>
    btn.addEventListener('click', () => {
      const act = btn.dataset.act!;
      if (act === 'unread') return mark({ read: false }).catch(toastError);
      if (act === 'trash') return mark({ folder: state.folder === 'trash' ? 'in' : 'trash' }).catch(toastError);
      compose(act as 'responder' | 'todos' | 'reenviar');
    }),
  );
  $('[data-logout]').addEventListener('click', async () => {
    await api('/api/sistemas/acceso/salir', { method: 'POST', body: {} }).catch(() => null);
    location.reload();
  });
  wireCompose();
  // Correo nuevo cada minuto mientras la pestaña está a la vista.
  setInterval(() => {
    if (document.visibilityState === 'visible' && !dialog.open) refresh().catch(() => null);
  }, 60_000);
};

const start = async () => {
  try {
    await refresh();
    app.hidden = false;
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) return showLogin();
    toastError(err);
  }
};

wireLogin();
wireApp();
start();
