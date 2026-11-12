---
name: reel-automatico
description: |
  Edita automáticamente un reel vertical (1080×1920, 15–25 s) a partir de una carpeta con los videos de un cliente y sus activos de marca (logo, colores, piezas de campaña): intro animada con el logo, textos animados en cada toma, transiciones entre planos, logo flotante y cierre con la cuenta de Instagram. Cuando Raúl da la ruta, busca el guion; si no está, lo pide; si no existe, lo escribe con el contexto de la carpeta. Usa ffmpeg y Chrome headless, sin IA de video de pago. Úsalo cuando Raúl diga «edita estos videos», «hazme un reel con…», «reel de <cliente>», o pase una ruta de videos para editar.
triggers:
  - "edita estos videos"
  - "editar videos"
  - "hazme un reel"
  - "reel de"
  - "reel automatico"
  - "reel automático"
---

# Reel automático desde videos y activos de marca

Probado el 2026-11-12 con el reel de Navidad de El Paisita (5 clips de iPhone en 4K
HEVC, logo dorado 3D de 53 MB): 21 s de reel en unos 5 minutos de render.

## Qué sale

En la carpeta de salida:

| Archivo | Para qué |
|---|---|
| `<nombre>-sin-audio.mp4` | **El que se sube.** En Instagram se le pone música de la biblioteca (por API o fuera de la app no se puede usar esa música y es lo que más alcance da) |
| `<nombre>-con-sonido.mp4` | Con el sonido ambiente de los clips, normalizado a −16 LUFS y mezclado en cada transición |
| `<nombre>-portada.jpg` | Portada del reel (el último fotograma de la intro) |
| `<nombre>-prueba.jpg` | Hoja de fotogramas clave para revisar antes del render completo |

Estructura del video:

1. **Intro (≈3 s):** fondo con el degradado de la marca, zoom lento y un efecto
   (nieve, brillos o confeti). El logo entra con rebote y giro, lo cruza un
   destello y flota. El título manuscrito se escribe de izquierda a derecha,
   luego el subtítulo y la línea de marca.
2. **Tomas (3–4 s cada una):** recorte vertical; texto en un recuadro que entra
   con rebote después de la transición, con un subrayado que se dibuja y un
   icono que gira; se desvanece antes del siguiente plano.
3. **Transiciones** distintas entre planos: círculo, deslizamientos, barrido
   radial, destello… El audio se cruza en cada una.
4. **Logo flotante** pequeño arriba, que se balancea como un adorno, solo
   durante las tomas.
5. **Cierre (≈3 s):** logo, frase manuscrita, cuenta de Instagram en una
   etiqueta que aparece de golpe, línea de marca y fundido a negro.

## Qué tiene que traer la persona

Una carpeta (o la ruta de varias) con:

| Material | Requisito |
|---|---|
| **Videos** | Los clips originales del teléfono (MOV/MP4, cualquier resolución; mejor verticales). 3–8 clips de al menos 2 s útiles. Sin editar ni comprimir por WhatsApp |
| **Logo** | PNG con **fondo transparente**, ≥ 800 px. Si hay versión de campaña (Navidad, aniversario…), esa |
| **Colores y tipografías** | Manual de marca, o piezas de la campaña de las que sacarlos. Las fuentes tienen que estar en Google Fonts (si no, la más parecida) |
| **Cuenta de Instagram** | El @ exacto |
| **Concepto** | Una frase: qué se celebra o qué se vende (el nombre de la carpeta a veces lo dice: «NAVIDAD») |
| **Guion** (opcional) | Ver «El guion». Si no hay, Claude lo escribe |

Requisitos del ordenador: macOS con Google Chrome, Node 18+ y ffmpeg
(`brew install ffmpeg`, unos 100 MB; **pide permiso antes de instalarlo**).
Comprobar con `ffmpeg -version`, `node -v` y que exista
`/Applications/Google Chrome.app`.

## Qué hace Claude cuando recibe la ruta

### 1. Inventario (sin tocar los originales)

- `ls` de la carpeta y de sus subcarpetas de material. Si la ruta está en
  iCloud y algún archivo no está descargado (`brctl download <archivo>` lo
  baja; un proceso «colgado» leyendo un archivo de iCloud suele ser eso).
- `ffprobe` de cada video: duración, resolución, códec, rotación y pistas de
  audio. Los iPhone graban 4K HEVC con rotación −90: ffmpeg lo endereza solo.
- **Duplicados:** dos clips con la misma duración y el mismo contenido en
  distinta resolución (por ejemplo, el original 4K y la copia 1080 que se
  reenvió). Se usa el de más calidad y se dice cuál se descartó.
- Hoja de contacto de cada clip (3 fotogramas: 15 %, 50 %, 85 %) para ver qué
  pasa en cada uno:
  `ffmpeg -ss <t> -i <clip> -frames:v 1 -vf scale=-2:420 f.jpg` y `hstack`/`vstack`.
- Activos de marca: logos (preferir PNG con alfa, comprobar con
  `sips -g hasAlpha`), piezas de la campaña (de ahí salen colores, fuentes y
  el @), manual de marca.
- Volumen de cada clip (`-af volumedetect`) para saber si hay sonido útil.

### 2. Buscar el guion

Busca en la carpeta y una o dos subcarpetas arriba y abajo, sin distinguir
mayúsculas:

- `guion*.json`, `guion-reel.json`: el formato de esta skill. Se usa tal cual
  tras validarlo.
- `guion*`, `script*`, `copy*`, `textos*`, `*reel*` en `.md`, `.txt`,
  `.docx`, `.pdf` o una nota: es un guion escrito por una persona. Se
  convierte al formato JSON, se respeta su texto y se le muestra a Raúl lo que
  se interpretó (orden de tomas, textos, duraciones) antes de renderizar.

**Si no hay guion:** se le pregunta a Raúl en una sola pregunta, con opciones:
«¿Tienes un guion para este reel? (a) te lo paso, (b) escríbelo tú con lo que
ves en los videos». Si contesta que lo escriba Claude, o que no tiene, pasa al
punto 3.

### 3. Escribir el guion (si no existe)

Con lo que hay en la carpeta, sin inventar:

- **Concepto:** del nombre de la carpeta o de la campaña (NAVIDAD →
  invitación a celebrar), de las piezas de campaña («Celebra con nosotros»)
  y de lo que se ve en los clips.
- **Orden de las tomas:** un recorrido con sentido (llegar → producto →
  ambiente → letrero o lugar al final). La toma más llamativa, lo antes
  posible.
- **Textos (uno por toma, ≤ 45 caracteres, ≤ 2 líneas):** describen lo que
  se ve y por qué apetece. Una palabra clave en `**negrita**` (sale en el
  color de acento). Nada de precios, promociones, ingredientes o afirmaciones
  que no se vean o no consten: si algo es dudoso, redacción neutra y avisar
  («algo frío para acompañar» en vez de «jugos naturales»).
- **Intro:** título corto y manuscrito (1–2 palabras) + subtítulo con la
  marca. **Cierre:** frase de invitación + el @.
- **Duración total:** 15–25 s. Tomas de 3–4 s (la última, hasta 4,5 s si
  termina en el letrero o el logo del local).
- **Colores:** del logo y de las piezas de campaña (tres tonos para el
  degradado del fondo, de claro a oscuro; un acento; el color de la etiqueta
  del @). Si no hay piezas, del logo.
- Guardar como `guion-reel.json` en la carpeta de salida (dentro de la del
  cliente, p. ej. `Reels <Concepto> <año>/`) y enseñárselo a Raúl en una
  tabla antes del render completo.

### 4. Revisar antes de renderizar

```bash
node ~/.claude/skills/reel-automatico/herramienta/hacer-reel.mjs <guion-reel.json> --prueba
```

Tarda unos 15 s. Mirar la hoja (`<nombre>-prueba.jpg`): intro al principio,
a mitad y al final; dos textos sobre su toma; el cierre. Comprobar que:

- ninguna letra manuscrita sale cortada;
- los textos caben en dos líneas y se leen;
- los colores son los de la marca;
- nada importante cae en los 250 px de arriba ni en los ~420 px de abajo.

### 5. Render completo y verificación

```bash
node ~/.claude/skills/reel-automatico/herramienta/hacer-reel.mjs <guion-reel.json>
```

Unos 5 minutos para 20 s (renderiza unos 360 fotogramas de piezas animadas
con varios Chrome en paralelo). Después, sacar 8–10 fotogramas repartidos
(incluidos los puntos medios de las transiciones) y revisarlos antes de
decir que está listo. Decir qué se vio y qué no (los fotogramas no son ver el
video reproducido).

### 6. Entrega

Rutas de los tres archivos, qué texto hay que confirmar con el cliente, y la
recomendación de subir la versión sin audio con música de Instagram. **No
se publica en las cuentas del cliente** sin que lo pida Raúl.

## El guion (`guion-reel.json`)

Rutas relativas al propio guion. Ejemplo completo con una marca ficticia en
`herramienta/guion-ejemplo.json`.

| Campo | Qué es |
|---|---|
| `nombre` | Base de los archivos de salida |
| `concepto` | Una frase (documentación; no sale en el video) |
| `carpetaVideos` | Carpeta de los clips |
| `salida` | Carpeta de salida (por defecto, la del guion) |
| `marca.logo` | PNG con transparencia (se reduce solo a 1000 px) |
| `marca.usuario` | El @ de Instagram (cierre) |
| `marca.linea` | Línea corta en mayúsculas («AREPAS Y EMPANADAS · DESDE 1980») |
| `tema.fondo` | Tres colores del degradado del fondo, de claro a oscuro |
| `tema.acento`, `acento2`, `acentoClaro` | Degradado del título y color de las palabras en negrita |
| `tema.etiqueta`, `textoEtiqueta` | Etiqueta del @ |
| `tema.cajaTexto` | Fondo del recuadro de los textos (con transparencia) |
| `tema.fuenteTitulo`, `fuenteTexto` | Nombres de Google Fonts (manuscrita y de texto) |
| `tema.efecto` | `nieve`, `brillos`, `confeti` o `ninguno` |
| `tema.icono` | Emoji del recuadro (`⭐`, `🎄`, `🔥`…; `""` para ninguno) |
| `intro` | `{ titulo, subtitulo?, linea?, segundos }` |
| `clips[]` | `{ archivo, desde, hasta, texto? }` en segundos del clip original. `**palabra**` en color de acento. Mínimo 1,5 s; texto ≤ 60 caracteres |
| `outro` | `{ titulo, usuario?, linea?, segundos }` |
| `transiciones` | Opcional: lista de transiciones de `xfade` (por defecto, una rotación) |
| `duracionTransicion` | Opcional, 0,45 s |
| `logoFlotante` | Opcional, `true` por defecto |

## Cómo funciona por dentro (para mantenerlo)

- **Piezas animadas = HTML + CSS.** `herramienta/plantillas/pieza.html` lleva
  la intro, el cierre y el texto, con animaciones CSS. El script la abre en
  Chrome headless **una vez por fotograma** (`?t=segundos`) y la página
  congela cada animación en ese instante poniendo un **retraso negativo
  (retraso − t) y pausa**. Con la API `getAnimations()` no funcionaba de
  forma fiable. Los textos se renderizan con fondo transparente
  (`--default-background-color=00000000`).
- **Logo y fuentes en data URI** dentro de la página (sin red por
  fotograma). Las fuentes se bajan una vez a `.reel-cache/` en la salida.
- **ffmpeg:** cada toma se recorta a 1080×1920 (`force_original_aspect_ratio=increase,crop`)
  y lleva su texto con `tpad` (entra tras la transición) y fundido de alfa;
  luego `xfade` + `acrossfade` encadenan todo; el logo flotante es un
  `rotate` con `sin(t)` sobre fondo transparente; `loudnorm` al final.
- Clips sin audio: se rellena con silencio. Los MOV del iPhone traen dos
  pistas de audio (AAC y APAC): se usa la primera.

## Trampas conocidas

| Qué pasó | Por qué / cómo se evita |
|---|---|
| La «L», la «E» y la «T» manuscritas salían cortadas | Las mayúsculas con adornos se salen de su caja y `background-clip: text` solo pinta dentro: `padding` amplio en `.script` |
| El título dorado no aparecía | El efecto de escribir (`clip-path`) y el degradado en el mismo elemento: se separan en contenedor e hijo |
| Todo el texto dorado invisible y la etiqueta sin color | El marcador de las fuentes también estaba escrito en el comentario de la plantilla y se sustituía allí: no escribir los marcadores literales en comentarios; usar `replaceAll` |
| Fotogramas iguales en todos los instantes | Congelar con `getAnimations()` no se aplicaba; retraso negativo + pausa sí |
| Un PNG de 50 MB hacía eterno cada fotograma | El script reduce el logo a 1000 px antes |
| El ffmpeg de Homebrew no tiene `drawtext` | No hace falta: los textos son imágenes de Chrome. Para subtítulos de voz, `brew install ffmpeg-full` y una herramienta de transcripción (pedir permiso) |
| Archivos de iCloud no descargados | `brctl download <archivo>` antes de leerlos |
| Copias repetidas del mismo clip | Comparar duración y contenido; usar la de mayor resolución |

## Variantes que se piden a menudo

- **Versión corta para historias (10–12 s):** 3 tomas de 3 s, intro y cierre
  de 2,5 s.
- **Otro idioma:** copiar el guion, traducir textos, título y cierre, y
  cambiar `nombre`.
- **Al ritmo de una canción:** pedir el audio; ajustar `desde/hasta` a los
  golpes (`ffmpeg -af silencedetect` o a oído con Raúl) y mezclar la canción
  en lugar del sonido ambiente.
- **Subtítulos de lo que se habla:** solo si hay voz a cámara; necesita
  transcripción (whisper.cpp) y pedir permiso para instalarla.
