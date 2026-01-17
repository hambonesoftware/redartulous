#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="${1:-.}"

# Fail if any gameplay background code writes to texture offset.y
# We intentionally allow mentions in docs/tests, but not in src/client/game.
MATCHES=$(grep -RIn --exclude-dir=node_modules --exclude-dir=dist --exclude=*.md --exclude=*.txt "offset\.y\s*=" "$ROOT_DIR/src/client/game" || true)

if [[ -n "$MATCHES" ]]; then
  echo "ERROR: Found forbidden offset.y writes in src/client/game:" >&2
  echo "$MATCHES" >&2
  exit 1
fi

echo "OK: No offset.y writes found in src/client/game."
