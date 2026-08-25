# GOALS · Objetivos, guardrails y Definition of Done

> Los loops dicen **cómo** trabaja el equipo. Este documento dice **para qué**.
> Un agente sin goal optimiza lo que le resulta fácil medir. Eso es peor que no
> hacer nada.

⚠️ **Los números entre `<>` los pone el PO antes del primer arranque.**
Hasta que estén puestos, el equipo trabaja en modo observación (solo L1 y L5).

---

## 1. Misión

Convertir el trabajo real que ya se hace para clientes en activos web que
atraigan, convenzan y vendan — sin que el PO tenga que empujar cada pieza.

---

## 2. Objetivos trimestrales

### O1 · El blog se alimenta solo del trabajo real
| Resultado clave | Base | Meta |
|---|---|---|
| Posts publicados al mes desde casos reales | `<X>` | `<Y>` |
| % de posts que cumplen la plantilla al primer QA | — | ≥ 90 % |
| Sesiones orgánicas al blog | `<X>` | `<Y>` |
| Posts que generan ≥ 1 lead atribuido / mes | `<X>` | `<Y>` |

### O2 · La web mejora sola con lo que hacen los usuarios
| Resultado clave | Base | Meta |
|---|---|---|
| Hipótesis de L3 medidas y cerradas por mes | 0 | `<Y>` |
| % de hipótesis confirmadas | — | ≥ 30 % *(un 100 % significa que no arriesgas)* |
| Tasa de rebote en páginas de servicio | `<X>` | `<Y>` |
| Profundidad media de navegación | `<X>` | `<Y>` |

### O3 · El e-commerce funciona sin sustos
| Resultado clave | Base | Meta |
|---|---|---|
| Checkout iniciado → pagado | `<X>` | `<Y>` |
| Webhooks fallidos sin resolver > 24 h | — | 0 |
| Incidencias de pago detectadas por el equipo antes que por un cliente | — | 100 % |

### O4 · El PO recupera su tiempo
| Resultado clave | Base | Meta |
|---|---|---|
| Escalaciones 🔴 por semana | — | ≤ 5 |
| Solicitudes 🟡 resueltas sin tocar al PO | — | ≥ 95 % |
| Incidentes causados por el equipo | — | 0 |

> **O4 es el objetivo que decide si esto sirve.** Un equipo que produce mucho
> pero interrumpe todo el día es un equipo fallido. Si las escalaciones suben,
> L6 recalibra el semáforo — no se relaja el criterio de riesgo.

---

## 3. Guardrails · lo que no puede empeorar

Se miden en cada QA. Si un cambio rompe uno, **QA veta**. No hay negociación,
no hay "solo esta vez".

**Rendimiento** — móvil, 4G simulada, URLs clave
- LCP ≤ `<2.5 s>` · CLS ≤ `<0.1>` · INP ≤ `<200 ms>`
- Peso total de página ≤ `<X KB>`
- Ninguna animación bloquea el hilo principal > 50 ms
- `prefers-reduced-motion` respetado **siempre**

**Accesibilidad**
- Contraste AA mínimo · navegación completa por teclado
- Todas las imágenes con `alt` real (no relleno)
- Ningún foco atrapado, ningún `autoplay` con sonido

**SEO**
- Ninguna URL indexada cambia sin redirección 301
- Un solo H1 por página · canonical correcto · sitemap actualizado

**Seguridad**
- Cero secretos en el repo, en logs, en reportes, en commits
- Ninguna clave *live* en entorno que no sea producción
- Dependencias sin vulnerabilidades críticas

**Contenido**
- Ningún dato de cliente publicado sin permiso confirmado
- Ninguna cifra de resultado sin fuente verificable
- Ninguna promesa que el negocio no pueda cumplir

---

## 4. Definition of Done

**Un post está listo cuando:** cumple `plantilla-blog.md` campo por campo ·
el build pasa · enlaces vivos · imágenes optimizadas con `alt` ·
≥ 3 enlaces internos · guardrails de rendimiento y SEO en verde ·
QA sin veto · Director aprobó · fuente del caso trazable.

**Un cambio de UI está listo cuando:** la hipótesis está escrita y es medible ·
el diff es el mínimo que la prueba · guardrails en verde ·
probado en móvil real y con teclado · reversión documentada en una línea ·
tiene fecha de medición a 14 días.

**Un cambio de pagos está listo cuando:** probado end-to-end en modo test ·
webhooks verificados incluyendo reintentos · idempotencia comprobada ·
errores manejados con mensaje al usuario · rollback escrito paso a paso ·
ninguna clave *live* tocada por un agente.

**Un cambio de infraestructura está listo cuando:** `.env.example` actualizado
con placeholders · nombres de variables documentados · valores puestos por el PO
o por el gestor de secretos · rollback probado · cero secretos en el diff.

---

## 5. Qué NO es un goal

Para que ningún agente optimice hacia el lugar equivocado:

- **Volumen de posts.** Diez posts flojos valen menos que dos buenos.
- **Número de animaciones.** El movimiento se justifica o se quita.
- **Cantidad de cambios.** Un mes sin cambios y con guardrails intactos es un
  buen mes.
- **Velocidad de aprobación.** Un Director que aprueba todo no está dirigiendo.
- **Cero rechazos.** Si nadie rechaza nada, nadie está revisando de verdad.
