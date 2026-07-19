#!/usr/bin/env bash
# Stop the background Vite dev server started by ./start.sh.
set -euo pipefail
# shellcheck source=scripts/_common.sh
source "$(cd "$(dirname "$0")" && pwd)/scripts/_common.sh"

stopped=0

if pid="$(dev_pid)"; then
  log "Stopping pid $pid"
  kill "$pid" 2>/dev/null || true
  # Give it a moment, then force if needed.
  for _ in $(seq 1 20); do
    kill -0 "$pid" 2>/dev/null || break
    sleep 0.1
  done
  if kill -0 "$pid" 2>/dev/null; then
    warn "Force-killing $pid"
    kill -9 "$pid" 2>/dev/null || true
  fi
  stopped=1
fi

rm -f "$PID_FILE"

# Also clear anything still listening on the configured port (orphans).
extra="$(port_pids || true)"
if [[ -n "${extra:-}" ]]; then
  log "Clearing leftover listener(s) on port $PORT: $extra"
  # shellcheck disable=SC2086
  kill $extra 2>/dev/null || true
  sleep 0.2
  leftover="$(port_pids || true)"
  if [[ -n "${leftover:-}" ]]; then
    # shellcheck disable=SC2086
    kill -9 $leftover 2>/dev/null || true
  fi
  stopped=1
fi

if [[ "$stopped" -eq 1 ]]; then
  ok "Dev server stopped"
else
  ok "Nothing to stop (no tracked server on port $PORT)"
fi
