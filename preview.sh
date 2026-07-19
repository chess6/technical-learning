#!/usr/bin/env bash
# Preview the production build locally.
set -euo pipefail
# shellcheck source=scripts/_common.sh
source "$(cd "$(dirname "$0")" && pwd)/scripts/_common.sh"

ensure_deps

if [[ ! -d "$ROOT/dist" ]]; then
  log "No dist/ yet — building first"
  npm run build
fi

log "Preview (Ctrl+C to stop)"
npm run preview -- --host "$HOST" --port "${PREVIEW_PORT:-4173}"
