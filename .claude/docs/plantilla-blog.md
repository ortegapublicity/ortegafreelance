# Plantilla del blog · ortegafreelance.com

> Restricción, no sugerencia. La usan el skill `/bitacora` y el agente
> `editor-contenido`. Aplica **solo al blog de ortegafreelance.com**.
>
> Modelo de voz (no de estructura fija: ver «Variedad»): el post «Del clic en el
> anuncio a la descarga en 4 clics: una ruta de venta 100 % en código para
> NEXO LAB» (13-10-2026). Se toma solo como referencia de forma y voz: nada de
> esto modifica el sitio ni el repositorio de Nexolab.
> https://ortegafreelance.com/blog/del-clic-en-el-anuncio-a-la-descarga-en-4-clics-una-ruta-de-venta-100-en-codigo-para-nexo-lab

## Cómo se ve en la web

- El blog vive en Contentful (`blogPage`, campos `title` y `body` en rich text).
- `BlogDetails.jsx` convierte **cada título de sección en una entrada del
  «Índice del artículo»** con ancla (`slugify` del texto). Por eso los títulos
  son el glosario: tienen que leerse solos y prometer lo que viene debajo.
- `heading` nivel 3 → `<h4>` en la página. Es el que usa la referencia; úsalo
  para todas las secciones. El nivel 2 solo si de verdad hay subsecciones.
- El slug sale del título. La fecha y los minutos de lectura los pone la web.

## Anatomía

| Parte | Regla |
|---|---|
| Título | Promesa concreta, con número o resultado si lo hay. **La fórmula cambia de un post a otro** (ver «Variedad»). ≤ 100 caracteres |
| Excerpt | 1–2 frases: el problema y lo que se hizo. Sin adjetivos de agencia |
| Secciones | 5–7, cada una con título. **La primera ya es un título** (el gancho) y la última es el cierre («Conclusión», «Cierre», «La conclusión clave»…) |
| Párrafos | 1–3 por sección, 2–4 frases cada uno |
| Lista | Al menos una, con el arranque en negrita: `**Clic 1, abrir la página:** explicación` |
| Largo | 500–900 palabras (≈ 3–4 min) |
| Cita / quote | Opcional, solo si aporta |
| Emojis, HTML | Nunca |

### Contenido que no puede faltar

El orden y los nombres de las secciones **varían**; estas piezas, no:

1. **Gancho**: por qué le importa esto al negocio (ver los tipos de apertura
   en «Variedad»). Luego quién es el cliente en una línea (sector, qué vende)
   y qué hice.
2. **El criterio** que guió las decisiones, dicho en una frase. Puede ser una
   sección propia o ir dentro del gancho; no la titules siempre igual.
3. **2–4 secciones de decisiones**, una por pieza (pago, correo, animación,
   medición…). Cada una: qué había, qué hice, por qué así y qué evita. Nombra
   la tecnología real (Stripe, Resend, GA4, Netlify, Astro…).
4. **Cómo se mide** que funciona (eventos, embudo, lo que se va a mirar).
   Puede ser una sección o un párrafo dentro de otra.
5. **Cierre**: la idea que se lleva el lector (ver los tipos de cierre).

## Variedad (obligatoria)

Corrección de Raúl (2026-11-10): cinco posts seguidos salieron con el título
«De X a Y: …», la segunda sección «La regla: …» y el cierre «ahí es donde
empezaría a auditar». Sus 15 posts publicados usan muchas más fórmulas; hay
que rotarlas. `blog-variedad.mjs` lo comprueba y rechaza lo repetido.

**Título: elige una fórmula distinta a la de los dos posts anteriores.**
Todas salen de su propio blog:

| Fórmula | Ejemplo publicado |
|---|---|
| Pregunta que se hace el cliente | «¿Es momento de invertir en Venezuela? Claves digitales para una expansión segura en LATAM» |
| «Cómo…» | «Cómo la estrategia de contenidos se convierte en el mayor activo de crecimiento de una marca» |
| Tema + «cómo logré…» | «Finanzas digitales estables: cómo logré que una empresa protegiera su capital…» |
| Tesis o apuesta + ángulo | «La apuesta por USDC como la futura stablecoin dominante: análisis desde Latinoamérica» |
| «Más allá de…» | «Más allá del "Hecho en China": OKRs, embudos B2B y cómo escalar…» |
| «El poder de…: la fórmula para…» | «El Poder del Diseño con Propósito: La Fórmula para Escalar…» |
| Tema + gerundio | «Estrategia Creativa Meta Andromeda: Transformando el Diseño en Rendimiento…» |
| Afirmación sin dos puntos | «Estrategia Integrada de Diseño y Marketing Que Construye Marcas con Propósito» |
| Número + sustantivo | «3 decisiones que quitaron un panel, un plan y un límite» (aún sin usar) |
| «De X a Y» | Gastada: **como mucho una vez cada 6 posts** |

**Apertura: rota el tipo de gancho.** El coste del problema («Cada clic de más
es tráfico pagado…»); un cambio del sector («Cuando Meta presentó
Andromeda…»); la pregunta del cliente («La pregunta ronda en la mente de
muchos empresarios…»); una escena del proyecto; una tesis que contradice lo
habitual; un dato.

**Secciones: no repitas etiquetas fijas.** «La regla: …» ya se usó cuatro
veces: nombra el criterio con sus propias palabras («Quien escribe no necesita
publicar»). La sección de medición tampoco se llama siempre «Medir». Algunos
posts suyos llevan una sección «Puntos clave» en lista antes del cierre: es
una variación válida.

**Cierre: rota.** Una idea que resume (con o sin metáfora); una pregunta que
el lector puede hacerse sobre su propio negocio; un siguiente paso concreto
para esta semana; o, una de cada tres veces como mucho, una invitación suave a
conversar, como en sus posts de 2025 («agenda una videollamada para…»).
Prohibido volver a «ahí es donde empezaría a auditar/revisar».

## Voz

- Primera persona (yo hice, reconstruí, lo reemplacé). Al lector, de tú.
- Frases cortas, voz activa, verbos de decisión. Explica el porqué en llano:
  el lector es dueño de negocio, no ingeniero, pero respeta los detalles.
- Especificidad sobre adjetivos: «pesa unos 14 KB», «caduca a los siete días»,
  «cuatro clics como máximo». Si no hay número, describe el cambio sin adornar.
- Frases clave en inglés solo cuando son el término del oficio (lookup key,
  checkout, webhook) y sin abusar.
- Prohibido: «en el mundo actual», «en la era digital», «no es ningún
  secreto», «potenciar», «sinergia», y la venta agresiva (la invitación suave
  del cierre sí cabe, ver «Variedad»).

## Enfoque comercial: el dolor que resuelvo (desde 2026-11-12)

Pedido de Raúl: los posts están bien; ahora tienen que **hablar de lo que
resuelve**, porque el blog y las redes existen para encontrar a quien le
pague por resolverlo. Lo que vende: automatizar el marketing de un negocio
(contenido que se escribe y se publica solo, anuncios, webs que convierten)
con Claude como herramienta.

- **Arranca desde el dolor del lector, no desde la tecnología.** Antes de
  escribir, nombra en una frase el problema de un dueño de negocio que este
  trabajo resuelve: «publico en LinkedIn solo cuando me acuerdo», «pago
  anuncios y no sé qué funciona», «mi web no me trae clientes», «pierdo horas
  en tareas repetidas», «no sé si me pagaron hasta que reviso el banco». El
  gancho del post, la primera línea de LinkedIn y la del carrusel salen de ahí.
- **Cada decisión técnica se traduce a lo que le ahorra o le gana al
  negocio** (horas, clientes, dinero, tranquilidad). Primero el efecto, luego
  la herramienta.
- **El lector se tiene que reconocer**: describe la situación con detalles
  que solo conoce quien la vive. Mejor «escribes el post el domingo por la
  noche» que «falta de constancia».
- **Una prueba, no una promesa**: el caso real (el propio sistema de Raúl o
  el de un cliente con permiso) demuestra que se puede.
- **Puerta abierta, sin presión**: el cierre deja claro que esto se le puede
  montar al lector (rota con los otros cierres de «Variedad»; la invitación a
  agendar sigue siendo como mucho una de cada tres veces).
- Lo mismo en LinkedIn y en el carrusel: la lección del post contada como
  «el problema que tenía → cómo lo resolví → lo que cambia para tu negocio».

## Datos de clientes (permiso)

- **Se puede nombrar** a un cliente si aparece en `src/data/caseStudies.js`
  o ya tiene un post publicado en el blog. Si no, se pregunta a Raúl; mientras
  tanto se describe sin nombre («una agencia de neuromarketing que vende ebooks»).
- **Nunca**: cifras de facturación o precios del cliente que no sean públicos,
  correos, teléfonos, IDs, URLs de paneles internos, nombres de variables de
  entorno, claves ni fragmentos de configuración.
- No se inventan cifras, testimonios ni resultados. Si aún no hay resultados
  medidos, se dice qué se va a medir.

## Formato de entrega (JSON)

```json
{
  "title": "…",
  "excerpt": "…",
  "body": [
    { "type": "heading", "level": 3, "text": "Gancho" },
    { "type": "paragraph", "text": "Texto con **negrita** y *cursiva* con moderación." },
    { "type": "bulletList", "items": ["**Paso 1, …:** …", "**Paso 2, …:** …"] },
    { "type": "quote", "text": "Opcional" },
    { "type": "heading", "level": 3, "text": "Conclusión" },
    { "type": "paragraph", "text": "…" }
  ],
  "cover": {
    "title_en": "English title",
    "svg": "<defs>…</defs><rect width=\"1008\" height=\"945\" fill=\"url(#bg)\"/>…"
  },
  "recommended": ["idPostPublicado1", "idPostPublicado2"],
  "linkedin": {
    "es": "Gancho en una línea.\n\nPárrafo…\n\n→ Punto\n→ Punto\n\nIdea.\n\n¿Pregunta al lector?",
    "en": "Same post in English…",
    "hashtags": ["DesarrolloWeb", "MarketingDigital", "Freelance"],
    "hashtags_en": ["WebDevelopment", "DigitalMarketing", "Freelance"]
  },
  "en": {
    "title": "…",
    "excerpt": "…",
    "body": [ "…los mismos bloques y secciones, traducidos…" ]
  }
}
```

- Lo de arriba (`title`, `excerpt`, `body`) es el **español**, que va al idioma
  `es-ES` de Contentful. `en` es la **versión en inglés** completa, que va a
  `en-US` (el idioma principal de Contentful). Traducción natural, inglés de
  negocio, con las mismas secciones.

Lo valida `netlify/functions/lib/articleDraft.js` (mismas reglas en local y en
el servidor).

## Autochequeo

- [ ] El título promete algo concreto y usa una fórmula distinta a la de los dos posts anteriores (nunca «De X a Y» si salió en los últimos 6)
- [ ] 5–7 títulos de sección que se entienden solos en el índice, sin «La regla: …»
- [ ] Apertura y cierre de un tipo distinto al del post anterior
- [ ] Una lista con arranques en negrita
- [ ] Tecnologías reales nombradas y el porqué de cada decisión
- [ ] Se dice cómo se mide
- [ ] Sin cifras inventadas, sin datos privados, sin emojis, sin venta agresiva
- [ ] 500–900 palabras
- [ ] `en` con la versión completa en inglés y las mismas secciones
- [ ] `cover.svg` con una ilustración del tema (no la ruta de nodos)
- [ ] `recommended` con 2 posts publicados relacionados
- [ ] `linkedin` con el caption en español e inglés y sus hashtags
- [ ] `meta` con el carrusel: tendencia segura que conecte, gancho con SVG propio, cierre hacia «Mis Blogs», caption con palabras clave y alt

## Portada (ES y EN)

Cada post lleva dos portadas de 1680×945, una en español y otra en inglés.

**Lo fijo (identidad):** panel derecho turquesa `#00b0a2` con el **isotipo
de Ortega Freelance en mosaico** muy tenue (el del favicon) y el **título en
blanco** (Exo 2). Es lo que se repite en todas las portadas publicadas.

**Lo que cambia según el tema:** la escena de la izquierda. Es una
**ilustración propia de cada post** (`cover.svg`), como en las portadas
antiguas (petróleo para Venezuela, embudo y fábricas para el post de China…).
No se repite la ruta de círculos azul, morado, naranja y verde del post de
NEXO LAB: esa fue la ilustración de ese tema, no una plantilla.

- `cover.svg`: el contenido de un `<svg viewBox="0 0 1008 945">`, sin la
  etiqueta `<svg>`. Estilo plano y moderno, fondo propio a sangre, objetos
  reconocibles del tema y paleta de fondo variable. Acentos de marca:
  `#3a7bff`, `#7b2cbf`, `#ff6b35`, `#ffd60a`, `#26d1c4`.
  - Sin texto ni números dentro, porque sirve para los dos idiomas.
  - Prohibido: `<script>`, `<style>`, `<image>`, `<foreignObject>`, `<a>`,
    `on…=` y URLs (solo `href="#id"` propios). Máximo 60.000 caracteres.
    `portada-blog.mjs` lo rechaza si no cumple.
- `cover.title_en`: el título en inglés (si hay `en.title`, manda ese).
- Respaldo, solo si no hay `svg`: `steps` de 3 a 5 pasos `{icon, es, en}` y
  `chips`, que pintan la ruta de nodos. Evítalo.
- Ejemplos aprobados: las portadas del post de la home (navegador, preloader
  tachado, calendario) y del CMS de Todxs Podemos Ser (panel de
  administración, panel de quien escribe, cola de revisión).
- Plantilla: `.claude/scripts/portada-blog.html`. Generador:
  `node .claude/scripts/portada-blog.mjs <borrador.json>`. Mira siempre las
  dos imágenes antes de enviar.
- Salida: `contenido-blog/<borrador>/portada-es.jpg`, `portada-en.jpg` y
  `LEEME.txt`. `blog-borrador.mjs` las **sube solo** a Contentful como imagen
  destacada (la ES en es-ES y la EN en en-US). `contenido-blog/INDICE.md`
  lista todos los borradores con su enlace de Contentful y el de su carpeta
  de imágenes.

## Recommended posts

El borrador lleva `recommended`: los IDs de **2 posts publicados**
relacionados con el tema. Van al campo «Recommended posts» en los dos idiomas
(English (United States) y Spanish (Spain)).

- Lista de publicados: `node .claude/scripts/blog-borrador.mjs --listar`.
- Si `recommended` falta o no trae IDs publicados, el servidor pone los dos
  posts publicados más recientes.

## LinkedIn

Cada borrador lleva `linkedin`: la publicación que invita a leer el post en
el blog. `linkedin-publicar.mjs` le añade los hashtags y la línea «Enlace al
artículo completo en el primer comentario», la publica cuando Raúl publica el
post en Contentful y deja el enlace en el primer comentario.

- **Perspectiva profesional, en primera persona.** No resume el artículo:
  cuenta **una** lección o decisión con un detalle concreto, y deja el resto
  para el blog. Parte del **dolor del lector** (ver «Enfoque comercial»): el
  dueño de negocio tiene que pensar «eso me pasa a mí».
- **Gancho en la primera línea** (≤ 160 caracteres), sola, seguida de una
  línea en blanco: LinkedIn corta el texto a las tres líneas con «…ver más».
  Rota el tipo como en los títulos: una confesión con cifra («Mi web hacía
  esperar 1,5 segundos. Por decoración.»), una pregunta incómoda, una
  afirmación que contradice lo habitual, una escena.
- **Cuerpo en párrafos de una o dos frases**, con 2–4 puntos que empiezan por
  «→». Sin negritas ni Markdown (LinkedIn no los pinta). Sin emojis.
- **Termina con una pregunta real al lector**: los comentarios son lo que más
  alcance da. Que se pueda contestar desde la experiencia propia, no un «¿qué
  opinas?».
- 450–1.400 caracteres por idioma (lo ideal, 700–1.100). Sin enlaces ni
  hashtags dentro del texto.
- `hashtags` (español) y `hashtags_en`: 3–5 cada uno, específicos del tema,
  solo letras y números (`DesarrolloWeb`, `MetaAds`, `UX`).
- Mismas reglas de datos de clientes que el post.
- Ejemplos aprobados: los captions de los posts del 2026-11-07 en
  `.claude/blog/borradores/`.

## Instagram y Facebook (carrusel)

Cada borrador lleva `meta`: un carrusel de 4 a 6 imágenes (1080×1350, 4:5)
que se apoya en **algo que la gente ya está mirando** para llevar al artículo.
Lo genera `carrusel-meta.mjs` (plantilla `carrusel-meta.html`) en
`contenido-blog/<borrador>/meta/`, con `meta.html` para publicarlo.

**La técnica (trendjacking seguro):** se toma una tendencia del momento y se
usa como metáfora de la lección del post. Ejemplo aprobado (2026-11-11): «La
LVBP estrena una máquina que revisa el strike. El umpire sigue en el plato.»
para el post «la máquina escribe, yo decido».

- **Fuente:** las tendencias de hoy (Google Trends de Venezuela y EE. UU.,
  que la tarea nocturna lee sola) o un tema de temporada vigente (LVBP,
  Serie del Caribe, regreso a clases, Navidad, Black Friday, lanzamientos
  de tecnología…).
- **Solo temas seguros:** deportes, cultura, tecnología, lanzamientos,
  temporadas. **Nunca** tragedias, desastres, muertes, crímenes, política,
  conflictos ni personas en una polémica.
- **Nunca la imagen de personas reales** (ni caricaturas reconocibles),
  logos de equipos o marcas, ni nada que sugiera que alguien respalda el
  post. Se nombra el hecho («la LVBP estrena…»), no se usa a sus
  protagonistas. Ilustraciones propias en SVG.
- La tendencia tiene que **conectar de verdad** con la lección; si no
  conecta, no se fuerza.

**Diapositivas:** `gancho` (ilustración SVG de 1080×760 **de la tendencia
misma**, lo que la gente ya está mirando, con algún guiño al tema del post; +
titular de la tendencia conectado con la idea, ≤ 90 caracteres) → 2–4 `punto` (titular
corto + una o dos frases) → `cierre` («¿Quieres ver…?» + texto hacia el
perfil + botón «Mis Blogs»). Sin enlaces en las imágenes.

**Texto (caption), pensado para la búsqueda de Instagram y Facebook:**
- La **primera línea** (≤ 125 caracteres, lo que se ve antes de «más»)
  lleva las **palabras clave** de lo que alguien buscaría («Automatización de
  contenido con IA», «diseño web para negocios», «campañas de Meta Ads»…),
  dichas con naturalidad.
- Luego la tendencia, la conexión y la lección en párrafos cortos, con las
  palabras clave repetidas sin forzarlas.
- **Llamada a la acción:** «El artículo completo está en el enlace de mi
  perfil: «Mis Blogs»». Sin enlaces (en Instagram no son clicables).
- Termina con una pregunta al lector.
- 300–2.200 caracteres. `hashtags`: 3–8, específicos (tema + sector +
  tendencia + ubicación: `MarketingDigitalVenezuela`).
- `alt`: un texto alternativo por imagen (accesibilidad y buscador).

**El perfil de Instagram tiene que tener un enlace llamado «Mis Blogs»** que
lleve a https://ortegafreelance.com/all-blog.

```json
"meta": {
  "tendencia": { "tema": "…", "por_que": "cómo conecta con el post", "fuente": "…" },
  "slides": [
    { "tipo": "gancho", "titulo": "…", "texto": "…", "svg": "<defs>…</defs>…" },
    { "tipo": "punto", "titulo": "…", "texto": "…" },
    { "tipo": "cierre", "titulo": "¿Quieres ver…?", "texto": "…en el enlace de mi perfil.", "boton": "Mis Blogs" }
  ],
  "caption": "Palabras clave en la primera línea…\n\n…«Mis Blogs».\n\n¿Pregunta?",
  "hashtags": ["…"],
  "alt": ["…", "…", "…"]
}
```
