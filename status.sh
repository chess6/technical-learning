#!/usr/bin/env bash
# Show whether the dev server is running.
set -euo pipefail
# shellcheck source=scripts/_common.sh
source "$(cd "$(dirname "$0")" && pwd)/scripts/_common.sh"

if pid="$(dev_pid)"; then
  ok "Running — pid $pid — $URL"
  if is_dev_up; then
    ok "HTTP responds"
  else
    warn "Process alive but $URL not responding (see $LOG_FILE)"
  fi
  exit 0
fi

if occupied="$(port_pids)"; [[ -n "${occupied:-}" ]]; then
  warn "Port $PORT is in use by untracked pid(s): $occupied"
  warn "Try: ./stop.sh"
  exit 1
fi

printf 'Dev server is not running.\n  start: ./start.sh\n'
exit 1
