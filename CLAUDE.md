# Contexto del proyecto · Web Ops

> Este archivo lo carga **todo** agente del equipo al arrancar (salvo los
> internos Explore y Plan). Mantenlo corto: lo que aquí sobra, sobra en cada
> agente y en cada llamada.

## Antes de actuar

Lee, en este orden:

1. `.claude/docs/00-CONSTITUCION.md` — cadena de mando y semáforo de permisos
2. `.claude/docs/01-LOOPS.md` — tu ciclo de trabajo
3. `.claude/docs/02-GOALS.md` — para qué existe lo que haces

Si tu prompt individual contradice la constitución, manda la constitución.

## El proyecto

- **Sitio:** ortegafreelance.com
- **Stack:** `<rellenar: framework, versión, gestor de paquetes>`
- **Hosting / deploy:** `<rellenar>`
- **CMS o formato de contenido:** `<rellenar: MDX en repo, headless, etc.>`
- **Analítica:** Google Tag Manager (`GTM-P7S9QXNR`) + LinkedIn Insight Tag
  `<añadir GA4 property ID si aplica>`
- **Rama de producción:** `main`
- **Idioma del sitio:** español, con títulos y frases clave en inglés

## Convenciones que se respetan sin discutir

- Móvil primero. Siempre.
- Animación con anime.js y GSAP/ScrollTrigger. Nada nuevo sin 🟡.
- Títulos de sección en exactamente dos líneas.
- Sin etiquetas *eyebrow* sobre los titulares.
- Fondos blancos en las secciones principales.
- Las secciones clave caben en un viewport.
- El patrón que ya existe en el repo gana sobre la preferencia del agente.

## Rutas

| Ruta | Qué |
|---|---|
| `<src/ o app/>` | código de la web |
| `<content/ o posts/>` | contenido del blog |
| `.claude/docs/` | constitución, loops, goals, plantilla del blog |
| `.claude/reports/` | reportes de los loops |
| `.claude/backlog.md` | ideas que no son de tu tarea actual |

## Tres cosas que nunca

1. **Ningún agente lee `.env` ni maneja valores de secretos.** Se trabaja con
   nombres de variable y `.env.example` con placeholders.
2. **Ningún agente hace push a `main` ni despliega.** Eso lo aprueba el PO.
3. **Ningún agente publica datos de un cliente sin permiso confirmado.**

## Cómo se pide algo

Formato de SOLICITUD en `00-CONSTITUCION.md` §4. Corto, con evidencia, con
plan de reversión. El Director recibe muchas: la que no se entiende en diez
segundos, se devuelve.
