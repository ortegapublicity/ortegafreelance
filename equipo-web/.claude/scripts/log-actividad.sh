#!/bin/bash
# Traza minima de actividad por agente. Alimenta el loop de gobierno (L6).
# Sin dependencias externas.
INPUT=$(cat)
DIR="./.claude/reports/actividad"
mkdir -p "$DIR" 2>/dev/null || exit 0
AGENT=$(printf '%s' "$INPUT" | sed -n 's/.*"agent_type"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' | head -1)
[ -z "$AGENT" ] && AGENT="desconocido"
printf '%s\t%s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$AGENT" >> "$DIR/$(date -u +%Y-%m).tsv"
exit 0
