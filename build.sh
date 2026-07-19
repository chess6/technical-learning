#!/usr/bin/env bash
# Production typecheck + build.
set -euo pipefail
# shellcheck source=scripts/_common.sh
source "$(cd "$(dirname "$0")" && pwd)/scripts/_common.sh"

ensure_deps
log "Building"
npm run build
ok "Build finished → dist/"
