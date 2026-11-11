#!/usr/bin/env node
// Atajo: guarda el token de Instagram en el Llavero y lo comprueba.
//   node .claude/scripts/instagram-token.mjs
// Ver guardar-token.mjs.
process.argv.splice(2, 0, "instagram");
await import("./guardar-token.mjs");
