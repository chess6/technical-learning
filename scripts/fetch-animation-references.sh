#!/usr/bin/env bash
# Fetch (or update) the curated educational-animation reference repositories
# into the local, Git-ignored reference cache at .reference-sources/animation-repos/.
#
# These repositories are REFERENCE-ONLY study material. Their code, prose,
# artwork, and assets must never be vendored into this repository. See
# docs/engineering/reference-sources.md for the rules and
# .reference-sources/manifest.json for what was inspected (URL, SHA, license).
#
# Usage:
#   scripts/fetch-animation-references.sh            # clone missing, update existing
#   scripts/fetch-animation-references.sh --status   # print repo -> HEAD sha table, no fetching
#   scripts/fetch-animation-references.sh 3b1b-videos reducible
#                                                    # limit to the named repos (by slug)
#
# Idempotent: clones when absent, fetch+resets when present. Clones are
# shallow (--depth 1) and blob-filtered where the server supports it, to keep
# the cache small.
set -euo pipefail

source "$(dirname "${BASH_SOURCE[0]}")/_common.sh"

CACHE_DIR="$ROOT/.reference-sources/animation-repos"

# slug|url pairs. Slugs are stable local directory names.
REPOS=(
  "3b1b-videos|https://github.com/3b1b/videos"
  "reducible|https://github.com/nipunramk/Reducible"
  "xiaoxiae-videos|https://github.com/xiaoxiae/videos"
  "welch-labs-videos|https://github.com/WelchLabs/videos"
  "morphocular-video-code|https://github.com/morpho-matters/video-code"
  "manim-js|https://github.com/JazonJiao/Manim.js"
  "vivek3141-videos|https://github.com/vivek3141/videos"
  "far1din-manim|https://github.com/far1din/manim"
)

STATUS_ONLY=0
FILTER=()
for arg in "$@"; do
  case "$arg" in
    --status) STATUS_ONLY=1 ;;
    -h|--help)
      sed -n '2,18p' "${BASH_SOURCE[0]}" | sed 's/^# \{0,1\}//'
      exit 0
      ;;
    *) FILTER+=("$arg") ;;
  esac
done

want_repo() {
  local slug="$1"
  [[ ${#FILTER[@]} -eq 0 ]] && return 0
  local f
  for f in "${FILTER[@]}"; do
    [[ "$f" == "$slug" ]] && return 0
  done
  return 1
}

command -v git >/dev/null || die "git is required"
mkdir -p "$CACHE_DIR"

print_status() {
  printf '%-24s %-42s %s\n' "SLUG" "HEAD" "URL"
  local entry slug url dir sha
  for entry in "${REPOS[@]}"; do
    slug="${entry%%|*}"
    url="${entry#*|}"
    want_repo "$slug" || continue
    dir="$CACHE_DIR/$slug"
    if [[ -d "$dir/.git" ]]; then
      sha="$(git -C "$dir" rev-parse HEAD 2>/dev/null || echo '?')"
    else
      sha="(absent)"
    fi
    printf '%-24s %-42s %s\n' "$slug" "$sha" "$url"
  done
}

if [[ "$STATUS_ONLY" -eq 1 ]]; then
  print_status
  exit 0
fi

fetch_one() {
  local slug="$1" url="$2"
  local dir="$CACHE_DIR/$slug"
  if [[ -d "$dir/.git" ]]; then
    log "updating $slug"
    # Update the default branch in place; shallow history is preserved.
    if ! git -C "$dir" fetch --depth 1 origin HEAD 2>/dev/null; then
      warn "$slug: fetch failed (offline?); keeping existing checkout"
      return 0
    fi
    git -C "$dir" reset --hard FETCH_HEAD --quiet
  else
    log "cloning $slug from $url"
    # Blob filtering is best-effort; fall back to a plain shallow clone.
    if ! git clone --depth 1 --filter=blob:limit=1m --no-tags "$url" "$dir" 2>/dev/null; then
      rm -rf "$dir"
      git clone --depth 1 --no-tags "$url" "$dir"
    fi
  fi
  ok "$slug @ $(git -C "$dir" rev-parse --short HEAD)"
}

for entry in "${REPOS[@]}"; do
  slug="${entry%%|*}"
  url="${entry#*|}"
  want_repo "$slug" || continue
  fetch_one "$slug" "$url"
done

echo
print_status
echo
ok "cache: $CACHE_DIR (git-ignored; reference-only, do not vendor)"
