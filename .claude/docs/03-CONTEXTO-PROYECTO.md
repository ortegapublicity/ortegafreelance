# Contexto del proyecto · ortegafreelance.com

> Para cualquier sesión de Claude que arranque en este repo, con cualquier
> perfil. Recoge lo que no se deduce del código ni de git: decisiones, estado,
> trampas de esta máquina y tareas abiertas. Última actualización: 2026-11-07.
>
> Las reglas de permisos están en `00-CONSTITUCION.md` y mandan sobre esto.
> Si algo de aquí contradice el código, manda el código: verifícalo y
> actualiza este archivo.

---

## 1. Quién y qué

- **Dueño / PO:** Raúl Ortega Talavera, freelancer de publicidad pagada (Meta y
  Google Ads) y desarrollo web en San Diego, Carabobo, Venezuela. Escribe en
  español, informal y rápido. Prefiere que se haga todo de una vez y que se le
  expliquen los pasos manuales (Netlify, GitHub, GA4, Resend) clic a clic.
- **Sitio:** https://ortegafreelance.com. Su web personal, que sirve para
  vender servicios, conseguir **videollamadas** (acción principal) y vender los
  planes (checkout con PayPal o BNC).
- **Repo:** `github.com/ortegapublicity/ortegafreelance`, clonado en
  `~/Documents/ortegafreelance-web`. **Ojo:** `~/Documents/ortegafreelance`
  (sin `-web`) es un clon viejo y roto; no trabajar ahí.

## 2. Stack y despliegue

| Pieza | Qué |
|---|---|
| Front | React 18 + Vite 7 (SPA), react-router-dom 6, react-i18next, Bootstrap 5, SCSS, AOS |
| Paquetes | npm (`package-lock.json`) |
| Hosting | Netlify, proyecto `ortegafreelance`. Despliega solo al fusionar en `main`; cada PR tiene *deploy preview* (`deploy-preview-N--ortegafreelance.netlify.app`) |
| DNS | En Netlify DNS (NS `dns1–4.p03.nsone.net`) |
| Blog | Contentful, leído a través de `/cf-api`, `/cf-preview` y `/cf-img` (proxies en `netlify.toml` y `vite.config.js`). Así se esquiva el bloqueo de Safari a terceros |
| Funciones | Netlify Functions v2 en `netlify/functions/` (esbuild), con librerías en `netlify/lib/` y `netlify/functions/lib/` |
| Correo | Resend: envío y recepción (ver §6) |
| Datos | Netlify Blobs (buzones de correo) |

**Rutas clave:**
- Páginas: `src/Pages/`. Componentes: `src/Components/`.
- Rutas: `src/Router/Router.jsx`. Root pinta el header y, solo en `/`, el Banner.
- Textos: `src/i18n.js`, un solo archivo con bloque `en` y bloque `es`, el español a partir de la línea ~570. Toda cadena nueva va en **los dos**. Los títulos de dos líneas usan `\n`.
- Medición: `src/Utlits/track.js` (sí, «Utlits»).
- Estilos globales: `src/scss/app.scss`. La capa de estética limpia está en `src/scss/base/clean.scss` y se carga al final.
- Panel de correo: `sistemas/index.html` + `src/sistemas/`, una segunda página de Vite sin React.
- Generador de artículos: `src/Pages/AdminBlog/` + `netlify/functions/generate-article.js`.

## 3. Convenciones del sitio (no se discuten)

- Móvil primero. Fondos blancos. Las secciones clave caben en un viewport.
- Títulos de sección en **exactamente dos líneas**. `Title.jsx` parte por
  `\n` y la segunda línea va en azul (`--blue: #4a6fa5`). Sin *eyebrows*.
- Estética «limpia», la misma familia que todxspodemosser.com y
  ubimascota.com: Inter 800 con letter-spacing negativo, botones en píldora,
  tarjetas blancas con sombra suave y mucho aire.
- Colores: tinta `#1e2a47`, turquesa `#26d1c4` (botones con texto oscuro;
  nunca turquesa para texto pequeño sobre blanco, no da contraste) y azul
  `#4a6fa5`. **Trampa:** en `variables.scss`, `--white` es en realidad
  `#1e2a47` (azul tinta), y la clase `.white` lo aplica con `!important`.
- La plantilla pone Exo 2 en todos los `<span>` y `capitalize` en los `<a>`.
  `clean.scss` lo neutraliza; no lo reintroduzcas.
- Animación: la convención escrita es anime.js y GSAP/ScrollTrigger, pero el
  código actual solo usa AOS (`data-aos`). Añadir cualquier librería nueva
  requiere ámbar 🟡.
- El patrón que ya existe en el repo gana sobre la preferencia del agente.

## 4. La home (en producción desde 2026-11-07, PR #8)

Orden:
1. Hero: «Tu publicidad y tu web, / en las mismas manos.», foto y dos botones.
2. Resultados.
3. Videollamada (`#agenda`, Calendly).
4. Planes (`#pricing`).
5. Servicios: solo se destacan Publicidad pagada y Desarrollo web; los otros
   tres van como complemento.
6. Lo que he construido (`WebBuilds`): Nexolab, Ubimascota, Todxs Podemos Ser
   y Mima Cortez.
7. Proyectos (`Projects`): la web de TPS y NF Autoparts.
8. Proceso, testimonios y blog.

- Cifras de resultados, sacadas de los casos: NF +$30.000 por trimestre; Rey
  Antigüedades $60 en anuncios para vender Rolex de más de $2.000; JaviToyz
  +$10.000; TPS +$6.000 financiados por ONG. Si cambia una, cámbiala también
  en `src/data/caseStudies.js`.
- Caso nuevo: `/client-todxspodemosser-web` (`src/Pages/ClientTodxsWeb/`),
  la mudanza de TPS de WordPress a Astro.
- El menú es corto: Resultados · Precios · Servicios · Proyectos · Blog, más el
  botón «Agendar llamada».
- El componente «Hitos» (Awards) se eliminó porque contradecía los casos.

## 5. Medición

- **GTM** `GTM-P7S9QXNR` (contenedor web, no servidor). **GA4 correcto:
  `G-D7V399X3B2`** (propiedad Ortegafreelance). Los otros G- del contenedor
  (`G-CQJP3YM4Q1`, `G-F9H59N7NRE`) son de todxspodemosser: no usarlos aquí.
  También hay LinkedIn Insight Tag y Meta Pixel.
- Eventos al `dataLayer`:
  - `cta_click`, con `cta_type` (`book_call` | `view_plans` | `start_checkout`)
    y `cta_location` (`hero` | `header` | `drawer` | `pricing` | `case_tps_web`).
  - `videollamada_agendada`, desde el postMessage `calendly.event_scheduled`.
    Ya está marcado como **evento clave** en GA4.
  - `add_payment_info`, con objeto `ecommerce` de GA4. Se dispara al pulsar
    pagar, antes de PayPal o BNC. **No es `purchase`**: un `purchase` real
    necesita una página de gracias a la que vuelva PayPal (pendiente).
- Las etiquetas GA4 de `cta_click` y `videollamada_agendada` se crearon en GTM.
  Está **pendiente** la de `add_payment_info` (marcando «Enviar datos de
  comercio electrónico → Capa de datos»), y confirmar que el contenedor está
  publicado.
- Por `02-GOALS.md`, todo cambio de UI se mide a 14 días. La home cambió el
  2026-11-06 (PR #4/#5) y otra vez el **2026-11-07** (PR #8). **Medir a partir
  del 2026-11-21**, comparando reservas y clics de CTA con el 2026-10-24 →
  2026-11-06.

## 6. Correo `raul@ortegafreelance.com` (PR #7, en producción)

- Es el mismo sistema que todxspodemosser.com y ubimascota.com. El MX apunta a
  Resend inbound (`receive.forge.rmta.net`); antes era ImprovMX.
- Resend llama al webhook `email.received` → `POST /api/correo/entrante`
  (`netlify/functions/mail-inbound.mts`). Se verifica la firma Svix, y el
  correo y sus adjuntos se copian a Blobs (store `mail`), porque Resend solo
  los guarda 30 días.
- Panel en **https://ortegafreelance.com/sistemas/**. Se entra con un código
  que llega al correo personal listado en `TEAM_LOGIN`. Desde ahí se lee, se
  responde, se reenvía y se descargan adjuntos.
- Buzones, firma y enlaces: `netlify/lib/config.ts`. Hay un único buzón,
  `raul` (admin y comodín). Para añadir otro, súmalo a `MAILBOXES` y a
  `TEAM_LOGIN`.
- La firma HTML lleva foto, Freelancer, «Marketing | Diseño digital | WEB»,
  móvil, web, dirección, Facebook/LinkedIn/Instagram y el botón «Agendar una
  cita» a Calendly. Se genera en `netlify/lib/inbox.ts` y la foto está en
  `public/firma/raul-ortega.png`.
- El formulario de contacto de la web sigue usando formsubmit.co → raul@, y
  llega a este buzón.

## 7. Generador de artículos (PR #3, en producción)

- `/admin-blog` llama a `/api/generate-article`, que usa Gemini con
  `@google/genai` y crea un **borrador** en Contentful con
  `contentful-management` (import con nombre: `import { createClient }`).
- Problema abierto: el modelo daba 503 por saturación, y luego la función
  superaba el tiempo de Netlify, que devuelve HTML («Unexpected token '<'»).
  El arreglo previsto no requiere pagar otra IA:
  1. Parseo seguro de la respuesta en `AdminBlog.jsx`.
  2. Modelo Flash con poco *thinking*.
  3. Reintentos ante 503/429.
  4. Si hace falta, pasarla a función *background*.
- Hay más detalle en `~/Downloads/handoff-generador-articulos.md`, si existe
  en esta máquina.

## 8. Variables de entorno (solo nombres; los valores están en Netlify)

`RESEND_API_KEY`, `RESEND_WEBHOOK_SECRET`, `SESSION_SECRET`, `TEAM_LOGIN`,
`MAIL_FROM` (opcional), `GEMINI_API_KEY`, `GEMINI_MODEL`, `BLOG_ADMIN_SECRET`,
`CONTENTFUL_SPACE_ID`, `CONTENTFUL_MANAGEMENT_TOKEN`,
`CONTENTFUL_ENVIRONMENT_ID`, `CONTENTFUL_BLOG_POST_TYPE`.

**Nunca** leas `.env` ni pidas o repitas valores. Los permisos locales también
bloquean `.env.example`.

## 9. Trampas de esta máquina

- **El repo está en iCloud** (`~/Documents`):
  - Si un `node`/`vite` se cuelga sin usar CPU, iCloud desalojó
    `node_modules`: `npm ci` y repetir.
  - iCloud crea duplicados con « 2» dentro de `.git` (por ejemplo
    `refs/remotes/origin/HEAD 2`) que rompen `git fetch` («bad object»). Se
    apartan, no se borran.
- **`dist/index.html` está versionado** y cada build lo cambia. Antes de
  commitear: `git checkout -- dist/index.html`. Pero si después quieres
  `vite preview`, vuelve a compilar: el index restaurado apunta a assets que
  ya no existen y la página sale en blanco.
- **Dos cuentas de GitHub** en el Mac: `nexolabcreator` y `ortegapublicity`.
  Este repo empuja como **ortegapublicity** (helper de `gh`). Si un push falla
  por permisos, no cambies la configuración de credenciales tú: da al usuario
  los comandos.
- **El DNS local está interceptado**: `dig` contesta desde una caché. Para
  verificar DNS usa DNS-over-HTTPS:
  `curl -s -H 'accept: application/dns-json' 'https://dns.google/resolve?name=ortegafreelance.com&type=MX'`.
- No hay configuración de ESLint. Para verificar: `npx vite build` y, para las
  funciones, `npx esbuild netlify/functions/<f> --bundle --platform=node --format=esm --packages=external --outfile=/tmp/x.mjs`.
- Chrome headless en `/Applications/Google Chrome.app` sirve para capturas.
  No baja de 500 px de ancho.
- `netlify dev --offline` funciona para probar las funciones. El repo no está
  vinculado a Netlify con la CLI, así que no trae variables.

## 10. Flujo de trabajo

- Todo cambio va en rama → PR a `main` con `gh pr create`. **Ningún agente
  fusiona ni despliega**: el usuario fusiona desde GitHub. Nunca pulsar
  «Publish deploy» en una preview de Netlify.
- No commitear `.claude/settings.local.json` ni
  `.claude/reports/actividad/*.tsv`. Son locales y suelen estar modificados.
- Los cambios de DNS, MX o correo son 🔴: los confirma el usuario.
- No publicar datos de clientes sin su permiso.

## 11. Proyectos hermanos (otros repos; aquí no aplican estas convenciones)

| Sitio | Repo local | Notas |
|---|---|---|
| todxspodemosser.com (TPS) | `~/Documents/todxspodemosser-web` | Astro 5 + Netlify, Decap CMS, buzones en `/sistemas/`. Es el origen del sistema de correo |
| ubimascota.com | `~/Documents/find-my-pet` | Astro + Netlify + Blobs + Resend. Proyecto Netlify `findmypet-miami` |
| mimacortez.com | `~/Documents/Mimacortez-web` | Vite + React + Tailwind, tema oscuro. Formulario por Resend |
| nexolabmarketing.com | `~/Documents/Nexolab repositorio` | Cliente (Maylin Wong) |

El plan de Hostinger del usuario aloja otros sitios: **no cancelarlo**.

## 12. Pendientes

1. Arreglar el tiempo de espera del generador (§7).
2. Crear en GTM la etiqueta `add_payment_info` y publicar el contenedor.
3. Página de gracias tras PayPal para medir `purchase` real.
4. Medición de 14 días a partir del 2026-11-21 (§5).
5. Pasar a la estética limpia lo que queda de la plantilla: el pie («PONTE EN
   CONTACTO» gigante), los testimonios y el círculo «ver más trabajos».
6. Rellenar las metas `<X>/<Y>` de `02-GOALS.md`, que pone el PO.
