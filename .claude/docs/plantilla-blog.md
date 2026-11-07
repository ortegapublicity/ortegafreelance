# Plantilla del blog · ortegafreelance.com

> Restricción, no sugerencia. La usan el skill `/bitacora` y el agente
> `editor-contenido`. Aplica **solo al blog de ortegafreelance.com**.
>
> Modelo de estilo: el post del blog de ortegafreelance.com «Del clic en el
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
| Título | Promesa concreta con número o resultado + para quién. Formato «De X a Y: qué se hizo para CLIENTE». ≤ 100 caracteres |
| Excerpt | 1–2 frases: el problema y lo que se hizo. Sin adjetivos de agencia |
| Secciones | 5–7, cada una con título. **La primera ya es un título** (el gancho), la última se llama **«Conclusión»** |
| Párrafos | 1–3 por sección, 2–4 frases cada uno |
| Lista | Al menos una, con el arranque en negrita: `**Clic 1, abrir la página:** explicación` |
| Largo | 500–900 palabras (≈ 3–4 min) |
| Cita / quote | Opcional, solo si aporta |
| Emojis, HTML | Nunca |

### Orden de las secciones

1. **Gancho**: el coste del problema para el negocio, en una frase que duela
   («Cada clic de más es tráfico pagado que ya perdiste»). Luego quién es el
   cliente en una línea (sector, qué vende) y qué reconstruí.
2. **La regla o el criterio** que guió las decisiones, en una frase.
3. **2–4 secciones de decisiones técnicas**, una por pieza (pago, correo,
   animación, medición…). Cada una: qué había, qué hice, por qué así y qué
   evita. Nombra la tecnología real (Stripe, Resend, GA4, Netlify, Astro…).
4. **Medir**: cómo se sabe si funciona (eventos, embudo, deduplicación).
5. **Conclusión**: la idea general en una metáfora corta («una ruta de
   conversión es una cadena»), qué eliminé o simplifiqué, y una frase final
   dirigida al lector en tú que le diga dónde empezaría a auditar. Sin «contáctame».

## Voz

- Primera persona (yo hice, reconstruí, lo reemplacé). Al lector, de tú.
- Frases cortas, voz activa, verbos de decisión. Explica el porqué en llano:
  el lector es dueño de negocio, no ingeniero, pero respeta los detalles.
- Especificidad sobre adjetivos: «pesa unos 14 KB», «caduca a los siete días»,
  «cuatro clics como máximo». Si no hay número, describe el cambio sin adornar.
- Frases clave en inglés solo cuando son el término del oficio (lookup key,
  checkout, webhook) y sin abusar.
- Prohibido: «en el mundo actual», «en la era digital», «no es ningún
  secreto», «potenciar», «sinergia», llamadas a la acción de venta.

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
  ]
}
```

Lo valida `netlify/functions/lib/articleDraft.js` (mismas reglas en local y en
el servidor).

## Autochequeo

- [ ] El título promete un resultado concreto y nombra al cliente (si hay permiso)
- [ ] 5–7 títulos de sección que se entienden solos en el índice
- [ ] Primera sección = gancho con el coste del problema; última = «Conclusión»
- [ ] Una lista con arranques en negrita
- [ ] Tecnologías reales nombradas y el porqué de cada decisión
- [ ] Sección de medición
- [ ] Sin cifras inventadas, sin datos privados, sin emojis, sin CTA de venta
- [ ] 500–900 palabras
