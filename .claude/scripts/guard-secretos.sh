#!/bin/bash
# Backstop mecanico: bloquea escritura de secretos aunque el agente se equivoque.
# PreToolUse matcher "Write|Edit". Exit 2 = bloquea y devuelve el motivo al agente.
# Sin dependencias externas: no necesita jq.

INPUT=$(cat)
[ -z "$INPUT" ] && exit 0

# file_path del payload (sin jq)
FILE=$(printf '%s' "$INPUT" | sed -n 's/.*"file_path"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' | head -1)

# 1) Nunca escribir archivos de entorno reales
case "$FILE" in
  *.env|*.env.local|*.env.production|*.env.development|*.env.*.local|*/secrets/*|*.pem|*.key)
    echo "BLOQUEADO: no se escriben archivos de entorno ni de credenciales ($FILE)." >&2
    echo "Regla dura de 00-CONSTITUCION.md 5.1. Edita .env.example con placeholders." >&2
    echo "Si hace falta un valor real, escala 🔴 para que lo ponga el PO." >&2
    exit 2
    ;;
esac

# 2) Credenciales reales en el contenido. Los placeholders *_test_* y <...> no coinciden.
PATRONES='sk_live_[A-Za-z0-9]\{10,\}\|rk_live_[A-Za-z0-9]\{10,\}\|pk_live_[A-Za-z0-9]\{10,\}\|whsec_[A-Za-z0-9]\{16,\}\|AKIA[0-9A-Z]\{16\}\|ghp_[A-Za-z0-9]\{20,\}\|github_pat_[A-Za-z0-9_]\{20,\}\|re_[A-Za-z0-9]\{24,\}\|xox[baprs]-[A-Za-z0-9-]\{12,\}\|AIza[0-9A-Za-z_-]\{30,\}\|BEGIN [A-Z ]*PRIVATE KEY'

MATCH=$(printf '%s' "$INPUT" | grep -o "$PATRONES" | head -1 | cut -c1-12)

if [ -n "$MATCH" ]; then
  echo "BLOQUEADO: el contenido parece contener una credencial real (prefijo: ${MATCH}...) en $FILE" >&2
  echo "Regla dura de 00-CONSTITUCION.md 5.1: los secretos no se escriben en archivos." >&2
  echo "Usa un placeholder en .env.example y escala 🔴 para que el PO ponga el valor." >&2
  echo "No copies el valor detectado en ningun reporte, log ni mensaje." >&2
  exit 2
fi

exit 0
