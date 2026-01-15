const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '..', 'src', 'i18n.js');
const text = fs.readFileSync(file, 'utf8');

function extractBlock(lang) {
  const start = text.indexOf(`${lang}: {`);
  if (start === -1) return null;
  // find the "translation: {" inside
  const transIndex = text.indexOf('translation: {', start);
  if (transIndex === -1) return null;
  // find the matching closing brace for translation block
  let i = transIndex + 'translation: {'.length;
  let depth = 1;
  for (; i < text.length; i++) {
    const ch = text[i];
    if (ch === '{') depth++;
    else if (ch === '}') {
      depth--;
      if (depth === 0) break;
    }
  }
  const block = text.substring(transIndex + 'translation: {'.length, i);
  return block;
}

function keysFromBlock(block) {
  const re = /"([^"\\]+)"\s*:/g;
  const keys = new Set();
  let m;
  while ((m = re.exec(block)) !== null) {
    keys.add(m[1]);
  }
  return keys;
}

const enBlock = extractBlock('en');
const esBlock = extractBlock('es');
if (!enBlock || !esBlock) {
  console.error('No se pudo extraer bloques en/es');
  process.exit(1);
}
const enKeys = keysFromBlock(enBlock);
const esKeys = keysFromBlock(esBlock);

const missing = [];
for (const k of enKeys) {
  if (!esKeys.has(k)) missing.push(k);
}
console.log('Total en keys:', enKeys.size);
console.log('Total es keys:', esKeys.size);
console.log('Keys in en missing in es:', missing.length);
missing.forEach(k => console.log('-', k));

const extra = [];
for (const k of esKeys) {
  if (!enKeys.has(k)) extra.push(k);
}
console.log('Keys in es not in en:', extra.length);
extra.forEach(k => console.log('+', k));
