#!/usr/bin/env bash
[ -z "${BASH_VERSION:-}" ] && exec bash "$0" "$@"
# Quality gate: lint + typecheck + unit tests. Tiers:
#   ./check.sh --quick [paths…]  lint, tsc, the permanent grading/conformance suite
#                                (+ any given vitest paths — additive, never a swap)
#   ./check.sh                   lint, tsc, ALL unit tests
#   ./check.sh --e2e             also Playwright
set -euo pipefail
# shellcheck source=scripts/_common.sh
source "$(cd "$(dirname "$0")" && pwd)/scripts/_common.sh"

ensure_deps

with_e2e=0
quick=0
declare -a extra_paths=()
for arg in "$@"; do
  case "$arg" in
    e2e|--e2e) with_e2e=1 ;;
    quick|--quick) quick=1 ;;
    -h|--help|help)
      cat <<'EOF'
Usage: ./check.sh [--quick [paths…]] [--e2e]

  Runs oxlint, TypeScript build, and Vitest (all tests, or with --quick the
  permanent grading/conformance suite plus any extra vitest path filters).
  Pass --e2e (or e2e) to also run Playwright.
EOF
      exit 0
      ;;
    *) extra_paths+=("$arg") ;;
  esac
done

log "Lint"
npm run lint

log "Typecheck"
npx tsc -b

if [[ "$quick" -eq 1 ]]; then
  # ALWAYS run the permanent grading/conformance suite (never skipped by --quick)…
  log "Unit tests (quick: grading/conformance suite)"
  npm run test:grading
  # …and ADDITIONALLY run any supplied targeted regressions (additive, never a swap).
  if [[ ${#extra_paths[@]} -gt 0 ]]; then
    log "Unit tests (targeted regressions)"
    npx vitest run "${extra_paths[@]}"
  fi
else
  log "Unit tests"
  npm run test

  # Transcript-tool tests (pure normalization; no network). Mandatory: a tier
  # that silently degrades when a toolchain is missing reports PASS for a suite
  # it never ran, so an absent python3/pytest is a FAILING gate, not a warning.
  log "Transcript tool tests (python)"
  if ! command -v python3 >/dev/null; then
    die "python3 is required to run the transcript tool tests (install python3)"
  fi
  if ! python3 -c "import pytest" 2>/dev/null; then
    die "pytest is required to run the transcript tool tests (pip3 install --user pytest)"
  fi
  python3 -m pytest scripts/test_fetch_transcripts.py -q
fi

if [[ "$with_e2e" -eq 1 ]]; then
  unset PLAYWRIGHT_BROWSERS_PATH || true
  log "E2E tests"
  npm run test:e2e
fi

ok "All checks passed"
