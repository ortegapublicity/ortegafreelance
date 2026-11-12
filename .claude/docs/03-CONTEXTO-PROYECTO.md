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

### 7b. Bitácora: posts escritos por Claude Code, sin API ni otra IA

Para convertir el trabajo de cada sesión (webs de clientes, integraciones…)
en un post con la voz de Raúl. **Lo escribe la propia sesión de Claude Code**
con la suscripción del usuario; no hay API key de Anthropic ni Gemini.

- Disparador: el usuario escribe **`/bitacora`** (o «publica esto en el
  blog») en cualquier repo. El skill está en `.claude/skills/bitacora/` y
  enlazado en `~/.claude/skills/bitacora` para que funcione fuera de este repo.
  En el repo del cliente **solo lee**; todo se escribe aquí.
- Forma y voz: `.claude/docs/plantilla-blog.md` (modelo: el post de NEXO LAB
  del 13-10-2026). Los títulos de sección forman el «Índice del artículo» con
  anclas que pinta `BlogDetails.jsx`.
- Flujo: JSON en `.claude/blog/borradores/` (en `.gitignore`: el repo es
  público) → `node .claude/scripts/blog-borrador.mjs <json> --dry-run` → sin
  `--dry-run` sube las portadas a **`/api/blog-asset`** y el texto a
  **`/api/blog-draft`**. Ninguna usa IA; crean el **borrador** en
  Contentful y nunca publican.
- **Idiomas de Contentful:** `en-US` es el principal y `es-ES` el español.
  El borrador lleva el español arriba y la versión inglesa en `en`; el
  español va a `es-ES` y el inglés a `en-US`. Los primeros borradores (PR #10
  a #13) escribían el español en `en-US`: corregido el 2026-11-08.
- Reglas compartidas local/servidor: `netlify/functions/lib/articleDraft.js`.
- Autenticación: `BLOG_ADMIN_SECRET`. El script la lee del **Llavero de macOS**
  (servicio `ortegafreelance-blog-admin`) y nunca la muestra. El usuario la
  guarda una vez con
  `security add-generic-password -a "$USER" -s ortegafreelance-blog-admin -w`.
  En otra máquina sin Llavero: pegar el JSON en `/admin-blog` → pestaña
  «Pegar artículo de Claude».
- Permiso de clientes: se nombra solo a los de `src/data/caseStudies.js` o ya
  publicados en el blog; si no, borrador anónimo y se pregunta.
- **Automático cada noche (23:00)**: launchd
  (`~/Library/LaunchAgents/com.ortegafreelance.bitacora.plist`, copia en
  `.claude/scripts/`) ejecuta `.claude/scripts/bitacora-nocturna.mjs` a través
  de `bitacora-arranque.mjs` (ver «iCloud» en §9):
  1. Lee el `git log` (solo lectura) de los repos de `~/Documents` desde el
     último borrador enviado (7 días por defecto, 14 como máximo). Excluye
     `ortegafreelance` (clon viejo) y `Base de datos online` (leads). Sin
     commits nuevos no llama a Claude.
  2. Llama a `claude -p --tools ""`: sin herramientas, solo texto, desde
     `/tmp`. Usa la sesión claude.ai del usuario (plan Pro), sin API key.
  3. Valida el JSON (plantilla, portada, **variedad** y caption de
     LinkedIn), pide una corrección si hace falta, genera las portadas y lo
     envía como borrador. Máximo un post por noche; si no hay material,
     «ESPERAR». Si Claude falla por algo pasajero (403, 429, 5xx), reintenta
     dos veces.
  4. Avisa con una notificación de macOS que dice dónde están las imágenes.
     Registro en `~/Library/Logs/bitacora-nocturna.log`.
  - Probar sin tocar nada real:
    `BITACORA_DATOS=$(mktemp -d) BITACORA_SIN_AVISOS=1 node .claude/scripts/bitacora-nocturna.mjs --force --dry-run`
    (`BITACORA_DATOS` cambia la carpeta de borradores y portadas).
  - Pausar: `launchctl bootout gui/$(id -u)/com.ortegafreelance.bitacora`.
  - Si sale «401 / no coincide»: la frase del Llavero es distinta a la de
    Netlify; el usuario la vuelve a guardar con `-U`.
- **Variedad** (corrección del usuario, 2026-11-10): los posts no pueden
  salir con el mismo molde. `blog-variedad.mjs` clasifica el título por su
  fórmula y rechaza la que se repite respecto a los 2 posts anteriores («De X
  a Y», como mucho una cada 6), además de la sección «La regla: …» y el
  cierre «ahí es donde empezaría a auditar». Las fórmulas válidas salen de
  sus 15 posts publicados y están en `plantilla-blog.md` («Variedad»).
- **Portadas ES y EN** (1680×945). Lo fijo: panel turquesa `#00b0a2` con el
  isotipo en mosaico tenue y el título en blanco. Lo que cambia: la escena de
  la izquierda, una ilustración SVG propia de cada tema (`cover.svg`) que
  dibuja Claude. La ruta de círculos de NEXO LAB NO es la plantilla: fue la
  ilustración de ese post (corrección del usuario, 2026-11-08).
  `node .claude/scripts/portada-blog.mjs <borrador.json>` las exporta con
  Chrome headless desde `.claude/scripts/portada-blog.html`.
- **Recommended posts**: el borrador lleva `recommended` (2 IDs de posts
  publicados, elegidos por tema; lista con `blog-borrador.mjs --listar`) y
  van a «Recommended posts» en en-US y es-ES. Sin elección, el servidor pone
  los dos más recientes. Endpoint de la lista: `/api/blog-posts`.
  - Salida: `contenido-blog/<borrador>/portada-es.jpg`, `portada-en.jpg` y
    `LEEME.txt` (con el enlace de Contentful). Fuera de git.
  - **`contenido-blog/INDICE.md`** lista cada borrador con su enlace de
    Contentful y el de su carpeta de imágenes. Al entregar un borrador, dar
    **siempre** el enlace `file://` de la carpeta de imágenes.
  - Se suben solas como imagen destacada (la ES en es-ES, la EN en en-US),
    como assets en borrador. Al publicar, hay que publicar también las
    referencias.
- Contentful: `contentful-management` v12 solo tiene la API «plain»
  (`client.entry.create`…); `client.getSpace()` ya no existe (PR #12).

### 7c. Vista previa al compartir (WhatsApp, LinkedIn…)

- Etiquetas Open Graph y Twitter en `index.html` (los rastreadores no
  ejecutan React). Imagen: `public/og/portada.jpg` (1200×630, < 300 KB, que es
  el límite práctico de WhatsApp), generada desde `.claude/scripts/og-portada.html`
  con la foto del hero y el titular de la home.
- Si se cambia la imagen, subir el `?v=` de `og:image`: WhatsApp guarda la
  vista previa en caché.
- Como es una SPA, **todas las rutas** (blog incluido) comparten esta
  vista previa. Una por post exigiría una Edge Function.

### 7d. Casos de estudio y logos de clientes

- Todas las páginas de caso usan la estética de «Todxs Podemos Ser · Web»:
  componente `src/Components/Shared/CaseStudy/CaseStudy.jsx` + estilos
  `.caseweb` en `src/Pages/ClientTodxsWeb/clientTodxsWeb.scss`. Cada página
  (`ClientBrandtop`, `ClientLightsEnglishAcademy`, `ClientNfAutoparts`,
  `ClientReyAntiguedades`, `ProtfolioDetails` = JaviToyz) solo pasa su
  configuración; los textos siguen en `src/i18n.js`. Caso nuevo → copiar una
  de esas páginas.
- La página vieja de Todxs Podemos Ser (2020) se retiró: `/client-todxspodemosser`
  redirige al caso web, y su cifra «+$6.000 de ONG» se respalda en el bloque
  «Antes de esta web» de ese caso.
- La home elige sus proyectos por ruta (`HOME_ROUTES` en `Projects.jsx`), no
  por posición en `projectList`.
- Franja «Más de 20 empresas…» (`Components/Partner`): logos limpios en
  `src/assets/img/clients/`, pintados como silueta gris (filtro CSS). Para
  añadir uno: PNG con fondo transparente, recortado al borde.

### 7e. LinkedIn de cada post

- Cada borrador lleva `linkedin` (`es`, `en`, `hashtags`, `hashtags_en`): un
  caption profesional que invita a leer el post (guía en `plantilla-blog.md`,
  «LinkedIn»).
- `.claude/scripts/linkedin-publicar.mjs --diario` corre **cada hora de 7:10
  a 21:10** (launchd `com.ortegafreelance.linkedin`, registro en
  `~/Library/Logs/bitacora-linkedin.log`). Desde el 2026-11-12 (pedido de
  Raúl: «que publique todos los días lo que tenga armado y vaya ajustando el
  horario con las estadísticas»):
  1. Mira qué posts de la bitácora **ya están publicados en el blog**
     (`/api/blog-posts`) y los programa: **uno por día, todos los días**, el
     primer día libre. Días y horas candidatas en `.claude/redes.config.json`
     (8:10, 12:10, 19:10). La hora de cada día la elige
     `redes-agenda.mjs` ese mismo día: rota hasta tener 2 publicaciones por
     hora y luego usa la de mejor promedio (alcance/10 + me gusta + 3 ×
     comentarios + 4 × (guardados + compartidos) del carrusel de Instagram a
     las 48 h; el alcance llega con `instagram_manage_insights`), explorando otra un día de cada cinco.
     Si un post se publica en el blog y hoy no salió nada, sale en la
     siguiente pasada. `--reprogramar` reparte la cola tras cambiar la agenda.
     El estado va en `<borrador>.contentful.json` → `linkedin`.
  2. El día que toca: **sin token**, notificación + página
     `contenido-blog/<post>/linkedin.html` (texto para copiar, portada, botón
     que abre LinkedIn) y el usuario publica o programa a mano. **Con token**,
     publica solo con la API oficial «Share on LinkedIn» (`/v2/ugcPosts` +
     imagen por `assets?action=registerUpload`), con la portada en español.
- La API de LinkedIn **no programa** (publica al momento): la hora la pone
  este script. No hay MCP de LinkedIn para publicar, y automatizar su web con
  un navegador va contra sus normas: no hacerlo.
- **Documentación oficial por MCP:** la documentación de la API de LinkedIn
  vive en Microsoft Learn, y su servidor MCP (`microsoft-learn`,
  https://learn.microsoft.com/api/mcp, sin login ni coste) está añadido a
  Claude Code a nivel de usuario (2026-11-10). Herramientas:
  `microsoft_docs_search`, `microsoft_docs_fetch`, `microsoft_code_sample_search`.
  Úsalo antes de tocar la integración, en vez de fiarte de memoria o blogs.
  Solo consulta documentación: no publica nada.
- Comprobado en esa documentación (2026-11-10): «Share on LinkedIn» (perfil
  personal, autoservicio) publica con `POST /v2/ugcPosts`. La «Posts API»
  sustituirá algún día a `ugcPosts`, pero es del paquete de marketing (pide
  aprobación). Si LinkedIn anuncia el cierre de `ugcPosts` para miembros,
  migrar `publishToLinkedIn()` en `linkedin-publicar.mjs`.
- **Token** (opcional; sin él todo funciona en modo aviso). Lo crea el
  usuario, nunca un agente:
  1. App en https://www.linkedin.com/developers/apps (pide asociarla a una
     página de LinkedIn) con los productos «Share on LinkedIn» y «Sign In with
     LinkedIn using OpenID Connect».
  2. Token en https://www.linkedin.com/developers/tools/oauth/token-generator
     con los permisos `openid`, `profile` y `w_member_social`.
  3. Guardarlo con el asistente `node .claude/scripts/linkedin-token.mjs`
     (pide el token sin mostrarlo, lo guarda en el Llavero y lo comprueba).
     No usar `security add-generic-password -w`: su pregunta corta a 128
     caracteres, y con `-w "$(pbpaste)"` se acaba guardando el propio
     comando. Pasaron las dos cosas el 2026-11-11.
  - No hacen falta el Client ID ni el Client Secret de la app: solo el token.
  El token dura 60 días y no se renueva solo: el script avisa una semana antes
  y, si caduca, vuelve al modo aviso.
- Comandos: `--estado` (cola), `--simular <borrador>` (texto final),
  `--marcar <borrador> cancelado|programado|publicado`, `--ahora <borrador>`
  (publica ya; solo si el usuario lo pide en ese momento).
- **El enlace al artículo va en el primer comentario** (desde el
  2026-11-11): el texto termina en «Enlace al artículo completo en el primer
  comentario» y, justo después de publicar, el script comenta el enlace
  (`POST /v2/socialActions/{urn}/comments`). Funciona con `w_member_social`:
  probado en real ese día, aunque la documentación nueva pide
  `w_member_social_feed`. Si un día LinkedIn lo rechaza, el post sale igual
  y avisa para comentar a mano. `LINKEDIN_ENLACE=texto` vuelve a poner el
  enlace en el texto.
- Por qué: hay estudios que ven menos alcance con enlaces externos en el
  texto (18–26 %) y otros que no ven ninguno o lo contrario; nada oficial de
  LinkedIn. El usuario prefirió el comentario. Revisar con las estadísticas
  de sus propios posts.
- Seguridad: nunca publica un post que no esté publicado en el blog; si la
  red se corta a mitad, el post queda en «publicando» y no se reintenta solo
  (para no duplicar).
- **Funciona de verdad desde el 2026-11-11**: primera publicación real por la
  API (post del correo con Resend, con el usuario delante):
  https://www.linkedin.com/feed/update/urn:li:share:7526262903319076864/
  El token se creó ese día; caduca hacia el 2027-01-10 y el script avisa
  una semana antes.
- Todas las rutas del blog comparten la misma vista previa (§7c), por eso se
  publica como imagen + enlace en el texto y no como tarjeta de enlace.

### 7f. Páginas legales

- **https://ortegafreelance.com/privacy-policy** y **/terms** (alias
  `/privacidad` y `/terminos`), en español e inglés según la bandera o el
  idioma del navegador. Las enlazan el pie y el checkout. La URL de
  privacidad es la que se da a LinkedIn al crear la app (§7e). PR #22,
  2026-11-11.
- Textos en `src/data/legal.js`; los pinta `src/Pages/Legal/Legal.jsx`.
- La política de privacidad describe los servicios de terceros que usa la
  web **de verdad**. Si se añade o quita uno (un píxel, un formulario, un
  medio de pago), hay que actualizarla y cambiar `UPDATED`.
- No son asesoría legal. Pendiente de que el usuario confirme: 50/50 en webs,
  trimestre no reembolsable, 2 rondas de cambios, aprobación a los 7 días,
  30 días de corrección, límite de responsabilidad de 3 meses y ley de
  Venezuela (Carabobo).
- La web no tiene banner de cookies. Para visitantes de la UE, GA4 y
  LinkedIn Insight Tag necesitarían consentimiento previo: pendiente de
  decisión del usuario.

### 7h. Instagram y Facebook (carrusel por post)

- Cada borrador lleva `meta`: un carrusel 4:5 de 4–6 imágenes con un
  **gancho de tendencia** (trendjacking seguro) y texto pensado para la
  búsqueda de Instagram/Facebook, con la llamada a la acción hacia el enlace
  «Mis Blogs» del perfil (https://ortegafreelance.com/all-blog). Guía en
  `plantilla-blog.md`, sección «Instagram y Facebook».
- Lo genera `.claude/scripts/carrusel-meta.mjs <borrador>` (plantilla
  `carrusel-meta.html`, misma identidad que las portadas) en
  `contenido-blog/<borrador>/meta/`: `slide-N.jpg`, `caption.txt` y
  `meta.html` para publicarlo a mano (copiar el texto y los alt, descargar
  las imágenes).
- La tarea nocturna lee las tendencias del día de Google Trends (RSS
  público de VE y US, sin clave) y Claude elige una solo si es segura y
  conecta; si no, usa un tema de temporada. **Nunca** imágenes de personas
  reales, logos de equipos o marcas, ni temas de tragedias o política.
- La tarea horaria, al detectar que un post se publicó en el blog,
  genera su carrusel y avisa (estado en `<borrador>.contentful.json` →
  `meta`). El día que sale su LinkedIn, **publica también el carrusel y una
  historia (9:16, `historia-meta.html`; también para posts sin carrusel) en
  Instagram**. **Dos días después sale su reel** (`renderReel`: las
  diapositivas sin contador, zoom lento y fundidos sobre `reel-fondo.html`,
  15 s, MP4 con ffmpeg de Homebrew; subida reanudable a rupload.facebook.com,
  sin alojar el video), como mucho uno al día, a la hora del día si hay token (`instagram-publicar.mjs`); si no, se publica a
  mano con `meta.html`.
- **API de Instagram** (@ortegafreelance es cuenta de empresa):
  «Instagram API with Instagram Login», `graph.instagram.com/v27.0`. Flujo:
  sube cada imagen a Contentful con `/api/blog-asset` (devuelve la URL
  pública de images.ctfassets.net; Instagram solo acepta JPEG en URL
  pública) → `POST /<IG_ID>/media` por imagen (`image_url`,
  `is_carousel_item`, `alt_text`) → `POST /<IG_ID>/media` con
  `media_type=CAROUSEL`, `children` y `caption` → esperar
  `status_code=FINISHED` → `POST /<IG_ID>/media_publish`. Límite: 100
  publicaciones por API cada 24 h.
- **Inicio de sesión unificado (2026-11-11):** Meta ya no ofrece «Instagram
  Login» en las apps nuevas; la app del usuario (**claudeiaadminpost**) usa el
  unificado: host `graph.facebook.com`, permiso `instagram_content_publish`,
  ID de la cuenta con `GET /me/assigned_instagram_accounts?fields=id,username`.
  `instagram-publicar.mjs` detecta solo qué tipo de token es. El unificado no
  se renueva con `ig_refresh_token`: `--verificar` lee su caducidad con
  `/debug_token` y la apunta para que `tokens.mjs` avise a tiempo.
- **El token en uso es de «usuario del sistema»** (desde 2026-11-12,
  «Claude-IA-User», con @ortegafreelance y la página asignados en «Asignar
  activos»; antes, «claudeiaadminpost System User»), caducidad «Nunca»:
  **no caduca**. Con él,
  `/me/assigned_instagram_accounts` devuelve una lista vacía, así que el
  script usa el ID de @ortegafreelance, **17841448821036371**
  (`INSTAGRAM_ACCOUNT_ID` lo cambia). Permiso comprobado leyendo
  `/<ID>/content_publishing_limit` (cupo de 100 al día). `/debug_token` no
  funciona con este tipo de token, y no hace falta.
- **Chequeo diario (9:10, `tokens.mjs`):** comprueba en solo lectura que el
  token llega a la cuenta y conserva el permiso de publicar
  (`checkPublishing()`). Si falla, avisa el mismo día.
- **Qué hace falta en la app de Meta y qué no (2026-11-11):**
  - No hacen falta los pasos «3. Webhooks» (solo sirven para recibir avisos
    de comentarios o mensajes) ni «4. Revisión de la app» (acceso avanzado,
    solo para cuentas de terceros). Para la cuenta propia basta el modo
    desarrollo con acceso estándar, comprobado al publicar el primer
    carrusel.
  - Lo que sí evita bloqueos: atender «Acciones requeridas» (por ejemplo,
    la revisión anual del uso de datos), rellenar Configuración → Básica
    (privacidad https://ortegafreelance.com/privacy-policy, condiciones
    https://ortegafreelance.com/terms, dominio, correo, icono) y no quitar
    la app en Instagram (Apps y sitios web) ni la cuenta del portfolio.
- **Token de Instagram:** en la app de Meta → Casos de uso → «Administrar
  mensajes y contenido en Instagram» → **API setup with Unified login** →
  «2. Generar tokens de acceso» → **Generar token** junto a @ortegafreelance
  (antes, Roles de la app → Evaluadores de Instagram → ortegafreelance, y
  aceptar la invitación en Instagram). No hace falta el paso «1. Configurar
  tu app» (es para que otros clientes inicien sesión). Se guarda con
  `node .claude/scripts/instagram-token.mjs` (Llavero, servicio
  `ortegafreelance-instagram`). Con un token de Instagram Login,
  `tokens.mjs` lo renueva solo cada semana; con el unificado, avisa una
  semana antes de la caducidad que dio `/debug_token`.
- Comandos: `instagram-publicar.mjs --verificar | --ahora <borrador> |
  --refrescar | --marcar <borrador> publicado|listo|cancelado`.
- Facebook: la API de Instagram no publica en la página. Para que salga
  también en Facebook, activar en Instagram «compartir en Facebook»
  (Centro de cuentas) o publicar el carrusel a mano desde `meta.html`.
- Piloto: carrusel del post «Por qué mi blog se escribe solo…» con la
  tendencia del sistema de reto ABS en la LVBP 2026-2027 (2026-11-11).

### 7g. Caducidad de tokens (LinkedIn y Contentful)

Hay dos tokens que caducan y el usuario los olvida; el sistema avisa solo.

| Token | Dónde vive | Dura | Lo usan |
|---|---|---|---|
| LinkedIn (`w_member_social`) | Llavero de macOS, servicio `ortegafreelance-linkedin` | 60 días | `linkedin-publicar.mjs` |
| Instagram (`instagram_business_content_publish`) | Llavero de macOS, servicio `ortegafreelance-instagram` | 60 días, **se renueva solo** cada semana | `instagram-publicar.mjs` |
| Contentful CMA (se llamó «claude-post») | Netlify, `CONTENTFUL_MANAGEMENT_TOKEN` | lo que se elija al crearlo | `/api/blog-draft`, `/api/blog-asset`, `/api/blog-posts` |

- `.claude/scripts/tokens.mjs` lo revisa cada mañana (lo llama la tarea de
  LinkedIn de las 9:10). Cuando falta una semana o menos, o el token ya
  falla (401), manda una notificación con el comando exacto y abre
  `contenido-blog/renovar-tokens.html` (pasos con botones para copiar; como
  mucho una vez al día).
- `node .claude/scripts/tokens.mjs` muestra el estado y la ruta de esa página.
- **Renovar LinkedIn:** generar el token en
  https://www.linkedin.com/developers/tools/oauth/token-generator (`openid`,
  `profile`, `w_member_social`) y ejecutar
  `cd ~/Documents/ortegafreelance-web && node .claude/scripts/linkedin-token.mjs`
  (pegar el token cuando lo pida). Nada más. El atajo `linkedin-token.mjs`
  llama a `guardar-token.mjs linkedin`; `instagram-token.mjs`, a
  `guardar-token.mjs instagram`.
- **Renovar Contentful:** crear un token nuevo en
  https://app.contentful.com/account/profile/cma_tokens (copiarlo, solo se
  ve una vez) → Netlify, proyecto ortegafreelance → Environment variables →
  `CONTENTFUL_MANAGEMENT_TOKEN` → pegar → Save → **Trigger deploy** (las
  funciones no leen el valor nuevo sin deploy; 15 créditos) → apuntar la
  caducidad con `node .claude/scripts/tokens.mjs --contentful-caduca AAAA-MM-DD`
  → comprobar con `node .claude/scripts/blog-borrador.mjs --listar`.
- La caducidad de Contentful no se puede leer desde el Mac: se apunta a mano
  en `.claude/blog/caducidades.json` (con el comando de arriba). El
  2026-11-11 Contentful avisó de que «claude-post» caducaba al día
  siguiente.
- Ningún agente crea, lee ni pega estos tokens: los maneja el usuario.

### 7i. Checkout: PayPal + ACH/wire y avisos de pago (PR #29)

- «BNC Remesas» salió del checkout. Ahora: PayPal (enlaces de $1050, $1650 y
  $2250) o **transferencia en EE. UU. (ACH o wire)** a la cuenta de Raúl en
  Lead Bank. Las claves `checkout.bnc*` de `src/i18n.js` quedaron sin uso.
- Número de cuenta y de ruta: **solo** en las variables de Netlify
  `VITE_ACH_CUENTA` y `VITE_ACH_RUTA` (el repo es público). Sin ellas, el
  bloque manda a WhatsApp. Ningún agente escribe esos números.
- Formulario «Ya pagué» (`src/Components/PaymentNotice/`) en el checkout y en
  `/success?plan=&price=` → `netlify/functions/pago-aviso.mts`
  (`/api/pago-aviso`): correo a `PAGOS.avisoA` (ortegapublicity@gmail.com,
  en `netlify/lib/config.ts`) y confirmación al cliente con agenda, WhatsApp y
  redes. No verifica el pago: Raúl lo comprueba en PayPal o en el banco.
  Límite: 5 por IP/hora, 3 por correo/día; copia en Blobs `pagos`.
- Los enlaces de PayPal deberían volver a
  `https://ortegafreelance.com/success?plan=<plan>&price=<monto>` (se
  configura en PayPal).

### 7j. LinkedIn Ads

Ficha de campaña, textos e imágenes en `.claude/anuncios/linkedin-automatizacion/`
(cuenta 517738224, crédito $342.12 en noviembre 2026). La campaña la crea y la
lanza Raúl; no hay acceso a la API de anuncios.

## 8. Variables de entorno (solo nombres; los valores están en Netlify)

`RESEND_API_KEY`, `RESEND_WEBHOOK_SECRET`, `SESSION_SECRET`, `TEAM_LOGIN`,
`MAIL_FROM` (opcional), `GEMINI_API_KEY`, `GEMINI_MODEL`, `BLOG_ADMIN_SECRET`,
`CONTENTFUL_SPACE_ID`, `CONTENTFUL_MANAGEMENT_TOKEN`,
`CONTENTFUL_ENVIRONMENT_ID`, `CONTENTFUL_BLOG_POST_TYPE`, `VITE_ACH_CUENTA`,
`VITE_ACH_RUTA`.

**Nunca** leas `.env` ni pidas o repitas valores. Los permisos locales también
bloquean `.env.example`.

## 9. Trampas de esta máquina

- **`npx vite build` se queda parado** sin usar CPU: iCloud desalojó
  `node_modules` (el 2026-11-11, 21.254 de 21.782 archivos). Lo rápido es
  compilar en una copia fuera de iCloud:
  `tar -c --exclude ./node_modules --exclude ./.git --exclude './.env*' . | tar -x -C <scratchpad>/build`,
  y allí `npm ci` y `npx vite build` (unos 6 s en total).
- **El Mac se duerme de noche** y corta las tareas a medias (la bitácora del
  2026-11-10 falló así). Las dos tareas de launchd se lanzan con
  `caffeinate -i`, que lo mantiene despierto mientras trabajan.
- **iCloud desaloja archivos del repo** (el disco está casi lleno: 93 % el
  2026-11-10), incluido casi todo lo interno de `.git`. Un proceso de fondo
  (launchd) no puede leer un archivo desalojado: falla con «Unknown system
  error -11». Así falló la bitácora del 2026-11-09. Soluciones ya montadas:
  - Las tareas de launchd arrancan con una copia **fuera de iCloud** de
    `bitacora-arranque.mjs` (`~/Library/Application Support/ortegafreelance-bitacora/`),
    que pide los archivos con `brctl download` y espera. Si cambias ese
    archivo en el repo, vuelve a copiarlo ahí.
  - `bitacora-nocturna.mjs` hace lo mismo con el `.git` de los repos con
    movimiento antes de `git log`. `brctl download` solo funciona archivo
    por archivo (por carpeta no hace nada).
  - En una sesión interactiva los archivos se descargan solos al leerlos,
    pero despacio: un `git log` puede tardar minutos. Se acelera con
    `find .git -type f -flags +dataless -print0 | xargs -0 -n 1 -P 8 brctl download`.

- **Cada deploy de producción cuesta 15 créditos de Netlify** (29 deploys se
  comieron 435 de 476 créditos en un periodo). `netlify.toml` tiene un
  `ignore`: si el commit solo cambia `.claude/`, `*.md` o `contenido-blog/`,
  Netlify cancela la build. Agrupa los cambios de código en menos PRs.

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

1. Arreglar el tiempo de espera del generador (§7). El parseo seguro en
   `AdminBlog.jsx` ya está (PR de la bitácora); quedan Flash, reintentos y
   *background*. La bitácora (§7b) no depende de esto.
2. Crear en GTM la etiqueta `add_payment_info` y publicar el contenedor.
3. Página de gracias tras PayPal para medir `purchase` real (la página
   `/success` ya tiene el aviso de pago; falta poner la URL de vuelta en
   cada enlace de PayPal). Falta un enlace de PayPal de $250 para el
   sistema de $500 (§7j).
4. Medición de 14 días a partir del 2026-11-21 (§5).
5. Pasar a la estética limpia lo que queda de la plantilla: el pie («PONTE EN
   CONTACTO» gigante), los testimonios y el círculo «ver más trabajos».
6. Rellenar las metas `<X>/<Y>` de `02-GOALS.md`, que pone el PO.
7. Redes (2026-11-12): hecho el token con `instagram_manage_insights`
   (usuario del sistema «Claude-IA-User», con @ortegafreelance y la página
   asignados como activos: un token de un usuario del sistema sin activos
   asignados no llega a la cuenta). Pendiente: si LinkedIn lo aprueba, la Community Management API
   (`r_member_postAnalytics`) para medir LinkedIn. El primer reel real por
   API aún no ha salido (probado solo contra servidor simulado).
