# LOOPS OPERATIVOS

> Un loop es un ciclo que **se dispara solo**, tiene pasos fijos, y **sabe cuándo
> parar**. Sin condición de salida no es un loop, es un agente dando vueltas.

Cada loop declara: **Disparador · Dueño · Pasos · Salida · Tope · Escalación.**

El **tope** (`maxTurns`, presupuesto de intentos) existe para que ningún loop
se coma la cuenta intentando lo mismo. Si un loop llega a su tope sin cumplir
la condición de salida, **para y reporta**. Nunca reintenta en silencio.

---

## L1 · Loop de Observación

**Disparador:** diario, 07:00 (cron) · o cuando el Director lo pide
**Dueño:** `analista-audiencia` (haiku — barato, corre todos los días)
**Nivel:** 🟢 completo (solo lectura)

**Pasos**
1. Traer últimas 24 h y comparar contra media de 14 días:
   sesiones, fuente/medio, páginas de entrada, scroll depth, eventos de CTA,
   salidas, búsquedas internas, consultas de Search Console.
2. Marcar **anomalías**: desviación > 25 % en cualquier métrica del panel de
   guardrails (ver `02-GOALS.md`).
3. Marcar **oportunidades**: página con tráfico alto y conversión baja,
   consulta con impresiones altas y CTR bajo, post viejo repuntando.
4. Escribir `.claude/reports/diario/YYYY-MM-DD.md` (≤ 1 página).
5. Enviar al Director un resumen de ≤ 10 líneas: *solo* lo accionable.

**Salida:** reporte escrito y entregado.
**Tope:** 1 pasada. No re-analiza.
**Escalación:** si una métrica de guardrail se rompe → SOLICITUD 🟡 inmediata
al Director el mismo momento, sin esperar al resumen.

---

## L2 · Loop Editorial (la automatización del blog)

**Disparador:** (a) martes y jueves 09:00 · (b) el PO cierra un trabajo de
cliente y lo anota en `content/proyectos/` · (c) L1 detecta una consulta con
demanda y sin contenido que la cubra.

**Dueño:** `editor-contenido` (fable) — apoyado por `analista-audiencia` (brief)
e `ingeniero-web` (publicación).

**Paso 0 — OBLIGATORIO la primera vez, y cuando cambie la plantilla**
`editor-contenido` **no inventa el formato**. Antes de escribir nada:
lee 5–8 posts existentes del repo, y extrae a
`.claude/docs/plantilla-blog.md` la anatomía real:

- Frontmatter exacto (todos los campos, tipos, cuáles son obligatorios).
- Rango de longitud, número de H2, uso de H3.
- Estructura del hook de entrada y del cierre/CTA.
- Cómo se nombran, dimensionan y ubican las imágenes; formato del `alt`.
- Convención de slug, categorías, tags que ya existen (no crear nuevos sin 🟡).
- Voz: persona gramatical, tuteo/usted, longitud de frase, uso de bilingüe
  (títulos y frases clave en inglés, cuerpo explicativo en español).
- Enlazado interno: cuántos, hacia dónde, con qué anchor.

Esa plantilla es la fuente de verdad. **Si un post no la cumple, no se publica.**

**Pasos**
1. **Brief** — `analista-audiencia` entrega: intención de búsqueda, consultas
   objetivo, 3 posts internos a enlazar, qué hueco cubre.
2. **Materia prima** — extraer el caso real desde `content/proyectos/`
   (ej. un trabajo de NEXO LAB): problema → decisión → cómo se resolvió →
   resultado medible. *Sin resultado medible, se escribe igual pero no se
   promete número.*
3. **Redacción** — `editor-contenido` escribe siguiendo `plantilla-blog.md`.
4. **Autochequeo** contra la plantilla, campo por campo. Reescribe si falla.
5. **QA** — `vigia-qa`: frontmatter válido, build pasa, sin enlaces rotos,
   imágenes con `alt`, sin claims sin respaldo, sin datos de cliente sin permiso.
6. **SOLICITUD 🟡** al Director con: título, slug, resumen de 3 líneas, qué
   consulta ataca, enlaces internos añadidos, y URL de preview.
7. Aprobado → `ingeniero-web` mergea a rama de contenido. **El push a producción
   es 🔴** y va agrupado en el batch semanal del Director.

**Salida:** post publicado *o* SOLICITUD rechazada con razón escrita.
**Tope:** 2 ciclos de reescritura. Al tercero, para y escala 🟡 con el borrador
y el motivo del atasco.
**Regla dura:** nunca se publica un caso de cliente sin que el Director confirme
que hay permiso. Ante duda sobre el permiso, es 🔴.

---

## L3 · Loop de Producto Web (navegación y UX)

**Disparador:** L1 marca una oportunidad · o backlog en `.claude/backlog.md`
**Dueño:** `ingeniero-web` + `motion-ui`

**Pasos**
1. **Hipótesis explícita**, en una frase:
   *"Creo que `<cambio>` sube `<métrica>` de `<X>` a `<Y>` porque `<razón>`."*
   Sin hipótesis medible, el trabajo no arranca.
2. Diseñar el cambio más pequeño que la pruebe. *El mínimo, no el bonito.*
3. Implementar en rama. `motion-ui` entra solo si hay movimiento.
4. **Presupuesto de rendimiento** (no negociable, ver guardrails):
   la animación no puede empujar LCP por encima del techo, ni romper CLS, ni
   ignorar `prefers-reduced-motion`.
5. QA: móvil real primero, luego escritorio. Teclado. Lector de pantalla.
6. SOLICITUD 🟡 con: antes/después en screenshot, Lighthouse antes/después,
   y cómo se revierte.
7. Aprobado → espera al batch de deploy.
8. **Cierre del loop:** 14 días después, `analista-audiencia` mide la hipótesis
   y escribe el veredicto. **Se cumplió o no se cumplió.** Si no, se revierte o
   se itera — no se deja "por si acaso".

**Salida:** hipótesis medida y veredicto escrito.
**Tope:** 3 iteraciones sobre la misma hipótesis. Después, se descarta y se
documenta como aprendizaje en la memoria de `ingeniero-web`.

---

## L4 · Loop de Conversión y Pagos

**Disparador:** semanal, lunes · o cualquier fallo de checkout (inmediato)
**Dueño:** `arquitecto-pagos` (opus)

**Pasos**
1. Revisar embudo: vista → intención → checkout iniciado → pagado → reembolso.
2. Revisar salud técnica: webhooks entregados vs fallidos, pagos en estado
   colgado, errores de la API, idempotencia.
3. Si hay fricción → hipótesis + SOLICITUD 🟡 (igual que L3).
4. **Todo se construye y se prueba en modo test.** Claves de test en el entorno
   de test. Punto.
5. El paso de test a live es **🔴 siempre**, sin excepción, sin importar lo
   pequeño que parezca el cambio.

**Salida:** embudo revisado, incidencias abiertas o cerradas.
**Tope:** un fallo de checkout que siga vivo tras 2 intentos de diagnóstico
se escala 🔴 de inmediato. No se sigue tocando producción a ciegas.

---

## L5 · Loop de Salud Técnica

**Disparador:** semanal, viernes
**Dueño:** `operador-infra` + `vigia-qa`

**Pasos**
1. Inventario de variables de entorno: qué espera el código vs qué está
   declarado en `.env.example` vs qué está configurado en el hosting.
   **Se comparan nombres y presencia. Nunca valores.**
2. Detectar: variable huérfana, variable esperada y ausente, clave próxima a
   caducar, clave sin rotar en > 90 días.
3. Dependencias: vulnerabilidades, versiones mayores pendientes.
4. Lighthouse en las 5 URLs clave. Enlaces rotos. Sitemap. `robots.txt`.
5. Reporte al Director. Lo que sea rotación o alta de clave → 🔴 agrupado.

**Salida:** reporte semanal escrito.
**Regla dura:** si `operador-infra` encuentra un secreto expuesto en el repo,
en un log o en un reporte → **para todo**, escala 🔴 al instante, y no copia
el valor en ningún sitio, ni siquiera en el aviso.

---

## L6 · Loop de Gobierno (el equipo se corrige a sí mismo)

**Disparador:** primer lunes de cada mes
**Dueño:** `director-web`

**Pasos**
1. Contar: solicitudes 🟡 aprobadas / rechazadas por agente.
   Escalaciones 🔴 al PO. Vetos de QA. Loops que llegaron a su tope.
2. Diagnosticar los tres síntomas que importan:
   - **Demasiadas escalaciones 🔴** → el semáforo está mal calibrado, o un
     agente clasifica por miedo. Ajustar el reparto, no el criterio de riesgo.
   - **Muchos rechazos a un agente** → su prompt es ambiguo. Reescribirlo.
   - **Loops tocando tope** → el alcance es muy grande. Partirlo.
3. Redactar propuestas de cambio a prompts, permisos o loops.
4. **Presentar al PO.** El PO aplica. Ningún agente se reescribe a sí mismo,
   ni reescribe a otro.

**Salida:** informe mensual + lista de propuestas.

---

## Mapa de disparadores

| Cuándo | Loop | Quién |
|---|---|---|
| Diario 07:00 | L1 Observación | analista-audiencia |
| Mar/Jue 09:00 | L2 Editorial | editor-contenido |
| Continuo (backlog) | L3 Producto | ingeniero-web + motion-ui |
| Lunes | L4 Conversión | arquitecto-pagos |
| Viernes | L5 Salud técnica | operador-infra |
| 1er lunes del mes | L6 Gobierno | director-web |
| Fallo de checkout | L4 (inmediato) | arquitecto-pagos |
| Guardrail roto | L1 → 🟡 inmediata | analista-audiencia |
| Secreto expuesto | 🔴 inmediata, todo para | operador-infra |
