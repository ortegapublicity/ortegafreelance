---
name: bitacora
description: |
  Convierte el trabajo hecho en esta sesión (web de un cliente, integración, rediseño, automatización…) en un artículo para el blog de ortegafreelance.com con la voz de Raúl y la estructura del post de NEXO LAB (secciones con título que forman el índice con anclas), y lo deja como BORRADOR en Contentful. Lo escribe la propia sesión de Claude Code: no usa API key ni otra IA. Úsalo cuando Raúl escriba /bitacora, «publica esto en el blog», «haz el update del blog» o «sube lo de hoy a la bitácora», en cualquier repositorio.
triggers:
  - "bitacora"
  - "bitácora"
  - "publica esto en el blog"
  - "update del blog"
  - "post del blog con lo de hoy"
---

# /bitacora — del trabajo hecho a borrador del blog

Repositorio del blog (fijo, aunque estés en el repo de un cliente):

```
BLOG_REPO=~/Documents/ortegafreelance-web
```

Si en esta máquina el repo está en otra ruta, búscalo (`ls ~/Documents | grep -i ortega`)
y no uses `~/Documents/ortegafreelance` (sin `-web`): es un clon viejo y roto.

## 1. Lee la plantilla

Lee `$BLOG_REPO/.claude/docs/plantilla-blog.md` entera antes de escribir. Es la
restricción de forma, voz y permisos. No la resumas de memoria.

## 2. Reúne el material (solo lectura)

En orden de prioridad:

1. Lo que se hizo **en esta conversación**: decisiones, problemas, por qué.
2. El repositorio actual: `git log --since="<inicio del trabajo>" --stat`,
   la descripción de los PR (`gh pr view` / `gh pr list --state merged --limit 5`)
   y el README o docs del proyecto.
3. Si Raúl pasó un tema concreto en el mensaje (`/bitacora el checkout de X`),
   eso manda sobre lo demás.

Nunca leas `.env`, secretos, bases de datos de clientes ni correos. No hace
falta: el post cuenta decisiones, no configuración.

**En el repositorio del cliente solo lees.** No creas, cambias ni commiteas
nada allí (ni en Nexolab ni en ningún otro). Todo lo que escribe este skill va
a `$BLOG_REPO`, es decir, al blog de ortegafreelance.com.

Si la sesión no tiene una decisión contable (solo arreglos menores, limpieza,
cambios de texto), dilo y propone esperar a tener material, o juntar varias
sesiones. No rellenes.

## 3. Permiso del cliente

- Busca el nombre del cliente en `$BLOG_REPO/src/data/caseStudies.js` y en los
  títulos de `https://ortegafreelance.com/all-blog`. Si está → puedes nombrarlo.
- Si no está → escribe el post **sin nombre** (sector + qué vende) y, al
  terminar, pregunta a Raúl si puede ir con nombre. No esperes su respuesta
  para crear el borrador anónimo.
- Fuera siempre: precios o facturación no públicos, correos, teléfonos, IDs,
  dominios internos, variables de entorno, claves.

## 4. Escribe

Sigue la plantilla al pie de la letra, sobre todo su sección **«Variedad»**:
antes de titular, mira los títulos recientes (`--listar` y los borradores
locales) y usa una fórmula distinta a la de los dos posts anteriores. «De X a
Y» está gastada, igual que la sección «La regla: …» y el cierre «ahí es donde
empezaría a auditar». El validador rechaza lo repetido. Guarda el JSON en:

```
$BLOG_REPO/.claude/blog/borradores/AAAA-MM-DD-<slug-corto>.json
```

(Esa carpeta está en `.gitignore`: el repo es público y el borrador aún no
está aprobado.) Recorre el autochequeo de la plantilla y corrige antes de seguir.

## 5. Portadas, validación y envío

Incluye en el JSON (secciones «Formato de entrega», «Portada» y «Recommended
posts» de la plantilla):

- El español arriba (`title`, `excerpt`, `body`) y la versión en inglés
  completa en `en`.
- `cover.svg`: una ilustración propia del tema, dibujada por ti en SVG. El
  panel turquesa con el isotipo en mosaico y el título en blanco los pone la
  plantilla; no repitas la ruta de círculos.
- `recommended`: 2 IDs de posts publicados relacionados. Sácalos de
  `node .claude/scripts/blog-borrador.mjs --listar`.
- `linkedin`: el caption de LinkedIn en español e inglés con sus hashtags
  (sección «LinkedIn» de la plantilla). Revísalo con
  `node .claude/scripts/linkedin-publicar.mjs --simular <archivo>.json`.

```bash
cd "$BLOG_REPO"
node .claude/scripts/blog-borrador.mjs .claude/blog/borradores/<archivo>.json --dry-run
node .claude/scripts/portada-blog.mjs .claude/blog/borradores/<archivo>.json
node .claude/scripts/blog-borrador.mjs .claude/blog/borradores/<archivo>.json
```

- El segundo genera `portada-es.jpg` y `portada-en.jpg` en
  `contenido-blog/<archivo>/` e imprime «Imágenes: file://…». Mira las dos
  imágenes (Read) antes de seguir: si un texto se sale o se pisa, acorta las
  etiquetas y repite.
- Después de enviar, añade el enlace de Contentful al `LEEME.txt` de esa
  carpeta y una línea a `contenido-blog/INDICE.md`:
  `- AAAA-MM-DD · título · enlace Contentful · file://carpeta`

- El primero valida las dos versiones y muestra sus índices. Si falla, corrige el JSON.
- Para cambiar SOLO la portada de un borrador ya enviado (sin tocar sus
  textos): `node .claude/scripts/blog-borrador.mjs <archivo>.json --solo-portadas`.
- El último sube las dos portadas y guarda el **borrador** en Contentful:
  español en `es-ES`, inglés en `en-US` y cada portada como imagen destacada
  de su idioma. Nunca publica. Recuerda lo enviado en
  `<archivo>.contentful.json`: si lo vuelves a lanzar, actualiza la misma
  entrada (no duplica). `--entry ID` corrige un borrador existente.
- La frase de administración la saca el script del Llavero de macOS; tú no la
  ves ni la pides. Si el script dice que no está en el Llavero (código 77),
  da a Raúl el comando que imprime el script para guardarla y, mientras tanto,
  la alternativa: pegar el JSON en https://ortegafreelance.com/admin-blog →
  «Pegar artículo de Claude».
- Si responde que no existe `/api/blog-draft` (404 o respuesta no JSON), la
  función aún no está desplegada y el panel tampoco servirá: entrega el JSON
  y avisa de que falta fusionar el PR de la bitácora en ortegafreelance.

## 6. Entrega

Responde corto:

- Título y el índice (los títulos de sección).
- Enlace «Revisar y publicar» de Contentful que devolvió el script.
- **Siempre** el enlace a la carpeta de imágenes (`file://…/contenido-blog/<archivo>`),
  con los nombres `portada-es.jpg` y `portada-en.jpg`.
- Si el cliente fue anónimo: la pregunta de permiso para nombrarlo.
- El gancho del caption de LinkedIn (su primera línea).
- Recordatorio: publicar es un clic de Raúl en Contentful. Al publicar la
  entrada, que publique también sus referencias (las dos portadas), o la
  imagen no saldrá en la web. Cuando lo publique, su LinkedIn se programa
  solo para el siguiente martes, miércoles o jueves a las 9:10.

No publiques, no hagas commit del borrador y no lo compartas fuera.

## Modo nocturno (automático)

Cada noche a las 23:00 `.claude/scripts/bitacora-nocturna.mjs` hace este mismo
trabajo sin conversación: arma el resumen del `git log`, se lo pasa a
`claude -p` sin herramientas con esta plantilla, genera las portadas y envía
el borrador. Si Raúl pregunta por un borrador nocturno, mira
`contenido-blog/INDICE.md`, `~/Library/Logs/bitacora-nocturna.log` y
`.claude/blog/borradores/`. Detalle en `03-CONTEXTO-PROYECTO.md` §7b.

## LinkedIn (automático)

Cada día a las 9:10 `.claude/scripts/linkedin-publicar.mjs --diario` mira qué
posts de la bitácora ya están publicados en el blog y los programa (uno por
día, de martes a jueves). El día que toca:

- Sin token de LinkedIn en el Llavero: avisa y deja
  `contenido-blog/<archivo>/linkedin.html` (texto para copiar y portada).
- Con token: publica solo, con la portada en español.

`--estado` muestra la cola; `--marcar <archivo> cancelado` saca un post. No
publiques en LinkedIn a mano con `--ahora` salvo que Raúl lo pida en ese
momento. Detalle y alta del token en `03-CONTEXTO-PROYECTO.md` §7e.

