# Equipo Web Ops · 8 agentes de Claude Code

Sistema de metaprompts para operar `ortegafreelance.com` con un equipo de
agentes jerarquizado: un Director que habla contigo, siete especialistas que
hablan con él.

---

## Antes de instalar: dos cosas que conviene tener claras

**1. Pixel Agents no orquesta nada.** Es un visualizador: convierte cada
sesión de Claude Code que ya corre en tu terminal en un personaje pixel-art
sentado en una oficina. Muestra qué está haciendo cada agente y te avisa
cuando uno espera permiso. Muy útil para ver este equipo funcionando — pero
la orquestación de verdad (quién es quién, qué modelo usa, qué puede tocar)
vive en Claude Code, en `.claude/agents/` y `.claude/settings.json`. Que es
exactamente lo que hay en este paquete.

**2. "Que se pidan permiso entre ellos" es organizativo, no de seguridad.**
Claude Code es explícito: un mensaje de un agente a otro **nunca** cuenta
como aprobación de un permiso, y ningún agente puede cambiar los permisos de
otro. Así que el protocolo 🟡 (especialista → Director) organiza *quién
decide qué*. Lo que de verdad impide que un agente haga algo es su lista de
`tools` y las reglas de `settings.json`. Por eso cada límite importante está
puesto dos veces: escrito en el prompt, y aplicado en la configuración.

---

## Instalación

```bash
cd /ruta/a/tu/proyecto-web

# 1. Copiar el paquete
cp -R equipo-web/.claude .
cp equipo-web/CLAUDE.md .

# 2. Hacer ejecutables los hooks
chmod +x .claude/scripts/*.sh

# 3. Verificar que los hooks funcionan (debe salir exit=2)
echo '{"tool_input":{"file_path":"a.ts","content":"sk_live_51ABCdefGHIjkl"}}' \
  | ./.claude/scripts/guard-secretos.sh; echo "exit=$?"

# 4. Arrancar con el Director al mando
claude --agent director-web
```

Si `~/.claude/agents/` o `.claude/agents/` no existía antes de arrancar la
sesión, reinicia Claude Code una vez: el watcher solo cubre directorios que
ya existían al empezar.

Comprueba que los ocho agentes cargaron y que los permisos son los que
esperas con `/permissions`.

---

## Qué hay dentro

```
CLAUDE.md                         contexto que carga cada agente
.claude/
├── settings.json                 permisos reales (la valla)
├── settings.comentado.jsonc      la misma config, explicada
├── agents/                       8 agentes
├── docs/
│   ├── 00-CONSTITUCION.md        mando + semáforo + protocolo
│   ├── 01-LOOPS.md               6 loops con disparador, pasos, salida y tope
│   └── 02-GOALS.md               objetivos, guardrails, definition of done
├── scripts/
│   ├── guard-secretos.sh         bloquea escribir credenciales
│   └── log-actividad.sh          traza para el loop de gobierno
└── reports/                      salida de los loops
```

## El equipo

| Agente | Modelo | Por qué ese modelo |
|---|---|---|
| `director-web` | **opus** | Juicio y delegación. Decide qué te llega a ti. |
| `arquitecto-pagos` | **opus** | Toca dinero real. Aquí no se ahorra. |
| `editor-contenido` | **fable** | Redacción editorial: donde más se nota la calidad. |
| `ingeniero-web` | sonnet | Implementación con volumen. |
| `motion-ui` | sonnet | anime.js / GSAP, microinteracciones. |
| `operador-infra` | sonnet | Variables, deploys, Playwright. |
| `vigia-qa` | sonnet | Verifica y tiene veto. |
| `analista-audiencia` | **haiku** | Corre a diario. Barato a propósito. |

Sobre **fable**: es un alias de modelo válido en el campo `model` de un
subagente, junto a `sonnet`, `opus` y `haiku`. Verifica que esté disponible en
tu plan con `/model` antes de arrancar. Si no lo está, cambia esa línea a
`model: opus` en `editor-contenido.md` y sigue igual.

## El semáforo

| | Quién decide | Qué |
|---|---|---|
| 🟢 | El especialista, solo | Código, contenido, ramas, build, medir |
| 🟡 | El Director | Navegación, publicar, dependencias, layout |
| 🔴 | **Tú** | Push, deploy, dinero, claves, DNS, borrar |

Lo 🔴 está además declarado en `permissions.ask`, así que Claude Code te
pregunta aunque un agente clasifique mal. Es la red debajo del criterio.

## Los loops

| Cuándo | Loop | Quién |
|---|---|---|
| Diario 07:00 | Observación | analista-audiencia |
| Mar/Jue | Editorial (el blog) | editor-contenido |
| Continuo | Producto web | ingeniero-web + motion-ui |
| Lunes | Conversión y pagos | arquitecto-pagos |
| Viernes | Salud técnica | operador-infra |
| 1er lunes del mes | Gobierno | director-web |

Cada loop tiene **condición de salida** y **tope**. Un loop que llega a su
tope para y reporta; no reintenta en silencio.

---

## Antes del primer arranque, haz estas tres cosas

**1. Rellena los `<...>` de `CLAUDE.md`.** Stack, hosting, rutas de contenido.
Sin eso los agentes adivinan, y adivinan mal.

**2. Pon los números de `02-GOALS.md`.** Sin metas, un agente optimiza lo que
le resulta fácil medir — que casi nunca es lo que te importa. Hasta que estén
puestos, deja correr solo L1 (observación) y L5 (salud técnica).

**3. Deja que `editor-contenido` genere `plantilla-blog.md` primero.**
Es el paso 0 del loop editorial y no es opcional: lee tus posts existentes y
extrae la anatomía real (frontmatter, longitud, voz, enlazado, imágenes). Sin
esa plantilla el agente inventa un formato que no es el tuyo. Revísala tú
antes de que escriba el primer post.

## Sobre el navegador

`operador-infra` trae Playwright vía MCP, que abre un navegador limpio y
automatizable — ideal para verificación reproducible (cargar páginas, medir,
capturar, probar formularios).

Eso **no** es la extensión de Claude para Chrome. Esa corre en tu navegador
con tu sesión iniciada y la manejas tú; no es controlable desde un subagente
de Claude Code. Es una distinción que conviene tener clara antes de diseñar
un flujo que dependa de ello.

## Sobre las API keys

El equipo gestiona **nombres y presencia** de variables, nunca valores:
compara qué espera el código, qué declara `.env.example` y qué está
configurado en el hosting, y te reporta huecos, sobras y claves sin rotar.

Las altas y rotaciones las haces tú. El agente te deja el comando preparado;
el valor lo introduces tú. Tres capas lo garantizan: los prompts lo dicen,
`settings.json` deniega leer `.env*`, y `guard-secretos.sh` bloquea la
escritura de cualquier cosa con forma de credencial.

## Empezar con calma

Arranca en observación una semana: solo L1 y L5, sin permitir cambios. Lee los
reportes diarios. Cuando el analista te esté diciendo cosas que reconoces como
ciertas, abre el loop editorial. Después el de producto. Los pagos, al final.

Si en el primer mes recibes más de cinco escalaciones 🔴 por semana, no está
mal calibrado el riesgo: está mal repartido el trabajo. Eso lo diagnostica el
loop de gobierno (L6).
