#!/usr/bin/env node
// Guarda el token de LinkedIn en el Llavero de macOS y lo comprueba.
//
//   node .claude/scripts/linkedin-token.mjs
//
// Por qué existe (2026-11-11): las dos formas «rápidas» fallaron.
// - La pregunta de `security add-generic-password -w` corta a 128 caracteres,
//   y un token de LinkedIn es más largo.
// - `-w "$(pbpaste)"` guarda lo que haya en el portapapeles, que al pegar el
//   comando en la terminal ya es el propio comando, no el token.
// Este asistente pide el token sin mostrarlo, sin límite de longitud, y se lo
// pasa a `security` por su entrada estándar (no aparece en la lista de
// procesos). Nunca lo imprime ni lo guarda en disco.

import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const SERVICE = "ortegafreelance-linkedin";
const ACCOUNT = process.env.USER || "raul";

function askHidden(question) {
  return new Promise((resolve) => {
    const { stdin, stdout } = process;
    if (!stdin.isTTY) {
      console.error("Ejecútalo en una terminal: necesita que pegues el token.");
      process.exit(64);
    }
    stdout.write(question);
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding("utf8");
    let value = "";
    const onData = (chunk) => {
      for (const ch of chunk) {
        if (ch === "\r" || ch === "\n") {
          stdin.setRawMode(false);
          stdin.pause();
          stdin.off("data", onData);
          stdout.write("\n");
          return resolve(value);
        }
        if (ch === "\u0003") {
          stdout.write("\nCancelado.\n");
          process.exit(130);
        }
        if (ch === "\u007f" || ch === "\b") value = value.slice(0, -1);
        else value += ch;
      }
    };
    stdin.on("data", onData);
  });
}

const token = (await askHidden("Pega el token de LinkedIn y pulsa Enter (no se verá en pantalla): ")).trim();

if (!token) {
  console.error("No llegó nada. No se guardó.");
  process.exit(65);
}
if (/\s/.test(token) || /[$();<>|"'`]/.test(token)) {
  console.error(
    "Eso no parece un token: tiene espacios o símbolos como $ ( ) ; < >. ¿Se pegó un comando?\n" +
      "Copia solo el token del generador de LinkedIn y vuelve a ejecutar este asistente. No se guardó nada."
  );
  process.exit(65);
}
if (token.length < 150) {
  console.error(`Ese token mide ${token.length} caracteres; los de LinkedIn suelen ser bastante más largos. Lo guardo igual y lo compruebo.`);
}

const quoted = `"${token.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
const r = spawnSync("/usr/bin/security", ["-i"], {
  input: `add-generic-password -U -a ${ACCOUNT} -s ${SERVICE} -w ${quoted}\n`,
  encoding: "utf8",
});
if (r.status !== 0) {
  console.error("El Llavero no aceptó el token.", (r.stderr || "").trim().slice(0, 200));
  process.exit(1);
}
console.log(`Guardado en el Llavero (servicio "${SERVICE}", ${token.length} caracteres). Compruebo con LinkedIn…`);

const check = spawnSync(process.execPath, [join(dirname(fileURLToPath(import.meta.url)), "linkedin-publicar.mjs"), "--verificar"], {
  stdio: "inherit",
});
process.exit(check.status ?? 1);
