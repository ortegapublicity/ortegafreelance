#!/usr/bin/env node
// Atajo: guarda el token de LinkedIn en el Llavero y lo comprueba.
//   node .claude/scripts/linkedin-token.mjs
// Ver guardar-token.mjs.
process.argv.splice(2, 0, "linkedin");
await import("./guardar-token.mjs");
