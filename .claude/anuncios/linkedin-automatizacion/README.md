# Anuncio de LinkedIn · Automatización de contenido (noviembre 2026)

Cuenta de Campaign Manager: **517738224** · Crédito disponible: **$342.12**
Lo crea y lo lanza Raúl (gastar dinero = su clic). Claude no tiene acceso a la
API de anuncios.

## Imágenes (esta carpeta)

| Archivo | Oferta | Formato |
|---|---|---|
| `sistema-h.jpg` | Sistema que publica solo · $500 (2 × $250) | 1200×627 horizontal |
| `sistema-c.jpg` | ídem | 1080×1080 cuadrado (mejor en móvil) |
| `ads-h.jpg` | Gestión de anuncios · $1050/trimestre | 1200×627 |
| `ads-c.jpg` | ídem | 1080×1080 |

Regenerar: abrir `anuncio.html?v=sistema&f=c` (o `v=ads`, `f=h`) con Chrome
headless, como `.claude/scripts/og-portada.html`.

## Estructura

Un **grupo de campañas** «Automatización · nov 2026» con **dos campañas** por
geografía (en EE. UU. el clic cuesta 3–5 veces más; juntas, EE. UU. se come el
presupuesto):

| Campaña | Ubicaciones | Presupuesto |
|---|---|---|
| A · LatAm | México, Colombia, Argentina, Chile, Perú, Venezuela, Ecuador, Rep. Dominicana, Panamá, Costa Rica, Guatemala, Uruguay, Puerto Rico | $230 total · $11/día · 21 días |
| B · Norteamérica | Estados Unidos, Canadá | $110 total · $10/día · 11 días |

Cada campaña lleva los **dos anuncios** (sistema y ads, versión cuadrada) para
que LinkedIn reparta según rendimiento. A los 7 días, pausar el que tenga peor
CTR.

## Ajustes de cada campaña

- **Objetivo:** Visitas al sitio web.
- **Idioma del perfil:** Español. (Esto es lo que filtra a los hispanohablantes;
  en Norteamérica es lo que separa el público.)
- **Público (combinar con Y):**
  - Tamaño de empresa: 1–10, 11–50, 51–200.
  - Antigüedad (seniority): Propietario, Socio, Director, CXO.
  - Funciones: Emprendimiento, Marketing, Desarrollo de negocio, Ventas.
- **Ampliación de público (Audience Expansion):** desactivada.
- **LinkedIn Audience Network:** desactivada (solo feed).
- **Formato:** Anuncio con una sola imagen.
- **Puja:** Entrega máxima (automática). Si el CPC pasa de $4 en LatAm, cambiar a
  límite de costo $3.
- **Conversión:** con el Insight Tag ya instalado, crear la conversión
  «Agendó / fue al checkout» por URL que contenga `/checkout` o `/success`.

## Destino (con UTM)

- Anuncio sistema:
  `https://ortegafreelance.com/?utm_source=linkedin&utm_medium=paid&utm_campaign=automatizacion-nov26&utm_content=sistema#agenda`
- Anuncio ads:
  `https://ortegafreelance.com/?utm_source=linkedin&utm_medium=paid&utm_campaign=automatizacion-nov26&utm_content=ads#agenda`

## Textos

### Anuncio 1 · Sistema que publica solo ($500)

**Texto introductorio**

> ¿Publicas en LinkedIn solo cuando te acuerdas?
>
> Te instalo un sistema con Claude que escribe con el contexto de tu negocio y
> publica por ti en LinkedIn e Instagram. Con blog en tu web o sin él.
>
> $500 en dos pagos de $250. Agenda 20 minutos y te lo enseño funcionando con
> mi propia marca.

**Titular:** Tu marca publica sola mientras tú trabajas
**Botón:** Más información

Alternativa de primera línea para probar:
«Mi blog y mi LinkedIn se publican solos. El tuyo puede hacer lo mismo.»

### Anuncio 2 · Gestión de anuncios ($1050/trimestre)

**Texto introductorio**

> Si tus campañas dependen de que tengas tiempo, no van a crecer.
>
> Gestiono tus anuncios en Meta, Google y LinkedIn cada trimestre: estrategia,
> piezas, medición y ajustes semanales. Tú te enfocas en atender a los clientes
> que llegan.
>
> $1050 por trimestre. Agenda una llamada y revisamos tu caso.

**Titular:** Tus anuncios en marcha, sin perseguir a nadie
**Botón:** Más información

## Lo que hay que tener claro antes de vender el sistema de $500

- El cliente necesita su propia suscripción de Claude (Pro, unos $20/mes) y
  VS Code; se dice en la llamada, no en el anuncio.
- Publicar en LinkedIn e Instagram por API exige que el cliente cree sus apps y
  tokens (como hicimos aquí). Contar 1–2 sesiones para eso.
- Falta un enlace de pago de PayPal de $250 para esta oferta (el checkout solo
  tiene los planes de $1050, $1650 y $2250).

## Medición

Revisar a los 7 y a los 21 días: CTR (meta > 0,6 %), CPC, visitas a `#agenda`
en GA4 (`utm_campaign=automatizacion-nov26`) y llamadas agendadas en Calendly.
