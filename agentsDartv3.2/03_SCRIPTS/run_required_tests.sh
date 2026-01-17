#!/usr/bin/env bash
set -euo pipefail

# Runs required repo checks for v3.2.

npm ci
npm run check
npm run test
npm run build

echo "OK: required tests passed."
