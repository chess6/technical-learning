#!/usr/bin/env bash
# Start the Vite dev server in the background.
set -euo pipefail
# shellcheck source=scripts/_common.sh
source "$(cd "$(dirname "$0")" && pwd)/scripts/_common.sh"

ensure_deps

if pid="$(dev_pid)"; then
  ok "Dev server already running (pid $pid) — $URL"
  exit 0
fi

# Clear a stale pid file if the process died.
rm -f "$PID_FILE"

if occupied="$(port_pids)"; [[ -n "${occupied:-}" ]]; then
  die "Port $PORT is already in use by pid(s): $occupied
Stop that process, or run: PORT=5174 ./start.sh"
fi

log "Starting Vite on $URL"
# Detach; write pid + log under .run/
nohup npm run dev -- --host "$HOST" --port "$PORT" >"$LOG_FILE" 2>&1 &
echo $! >"$PID_FILE"

# Wait briefly for readiness.
for _ in $(seq 1 40); do
  if is_dev_up; then
    ok "Dev server ready — $URL (pid $(cat "$PID_FILE"))"
    printf '  log: %s\n  stop: ./stop.sh\n' "$LOG_FILE"
    exit 0
  fi
  sleep 0.25
done

warn "Server started but not responding yet — check $LOG_FILE"
exit 1
