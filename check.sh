#!/usr/bin/env bash
# Quality gate: lint + typecheck + unit tests. Optionally include e2e.
#   ./check.sh        lint, tsc, unit
#   ./check.sh e2e    also Playwright
set -euo pipefail
# shellcheck source=scripts/_common.sh
source "$(cd "$(dirname "$0")" && pwd)/scripts/_common.sh"

ensure_deps

with_e2e=0
for arg in "$@"; do
  case "$arg" in
    e2e|--e2e) with_e2e=1 ;;
    -h|--help|help)
      cat <<'EOF'
Usage: ./check.sh [--e2e]

  Runs oxlint, TypeScript build, and Vitest.
  Pass --e2e (or e2e) to also run Playwright.
EOF
      exit 0
      ;;
  esac
done

log "Lint"
npm run lint

log "Typecheck"
npx tsc -b

log "Unit tests"
npm run test

if [[ "$with_e2e" -eq 1 ]]; then
  unset PLAYWRIGHT_BROWSERS_PATH || true
  log "E2E tests"
  npm run test:e2e
fi

ok "All checks passed"
