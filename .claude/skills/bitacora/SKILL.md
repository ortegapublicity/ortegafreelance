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

Sigue la plantilla al pie de la letra. Guarda el JSON en:

```
$BLOG_REPO/.claude/blog/borradores/AAAA-MM-DD-<slug-corto>.json
```

(Esa carpeta está en `.gitignore`: el repo es público y el borrador aún no
está aprobado.) Recorre el autochequeo de la plantilla y corrige antes de seguir.

## 5. Valida y envía

```bash
cd "$BLOG_REPO"
node .claude/scripts/blog-borrador.mjs .claude/blog/borradores/<archivo>.json --dry-run
node .claude/scripts/blog-borrador.mjs .claude/blog/borradores/<archivo>.json
```

- El primero valida y muestra el índice. Si falla, corrige el JSON.
- El segundo crea el **borrador** en Contentful. Nunca publica.
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
- Si el cliente fue anónimo: la pregunta de permiso para nombrarlo.
- Recordatorio: publicar es un clic de Raúl en Contentful (añadir imagen
  destacada si la plantilla del post la usa).

No publiques, no hagas commit del borrador y no lo compartas fuera.

## Modo nocturno (automático)

Cada noche a las 23:00 `.claude/scripts/bitacora-nocturna.mjs` hace este mismo
trabajo sin conversación: arma el resumen del `git log`, se lo pasa a
`claude -p` sin herramientas con esta plantilla y envía el borrador. Si Raúl
pregunta por un borrador nocturno, mira `~/Library/Logs/bitacora-nocturna.log`
y `.claude/blog/borradores/`. Detalle en `03-CONTEXTO-PROYECTO.md` §7b.

