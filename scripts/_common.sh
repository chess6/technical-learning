#!/usr/bin/env bash
# Shared helpers for project maintenance scripts.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

PORT="${PORT:-5173}"
HOST="${HOST:-127.0.0.1}"
RUN_DIR="$ROOT/.run"
PID_FILE="$RUN_DIR/dev.pid"
LOG_FILE="$RUN_DIR/dev.log"
URL="http://${HOST}:${PORT}"

mkdir -p "$RUN_DIR"

log()  { printf '→ %s\n' "$*"; }
ok()   { printf '✓ %s\n' "$*"; }
warn() { printf '! %s\n' "$*" >&2; }
die()  { printf '✗ %s\n' "$*" >&2; exit 1; }

need_node() {
  command -v node >/dev/null || die "Node.js is required (https://nodejs.org)"
  command -v npm  >/dev/null || die "npm is required"
}

ensure_deps() {
  need_node
  if [[ ! -d "$ROOT/node_modules" ]]; then
    log "node_modules missing — running npm install"
    npm install
  fi
}

dev_pid() {
  if [[ -f "$PID_FILE" ]]; then
    local pid
    pid="$(cat "$PID_FILE" 2>/dev/null || true)"
    if [[ -n "${pid:-}" ]] && kill -0 "$pid" 2>/dev/null; then
      echo "$pid"
      return 0
    fi
  fi
  return 1
}

port_pids() {
  # PIDs listening on PORT (best-effort).
  if command -v lsof >/dev/null; then
    lsof -tiTCP:"$PORT" -sTCP:LISTEN 2>/dev/null || true
  elif command -v fuser >/dev/null; then
    fuser "${PORT}/tcp" 2>/dev/null | tr -s ' ' '\n' | grep -E '^[0-9]+$' || true
  fi
}

is_dev_up() {
  curl -fsS --max-time 1 "$URL" >/dev/null 2>&1
}
