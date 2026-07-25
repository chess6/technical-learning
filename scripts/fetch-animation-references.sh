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
#   scripts/fetch-animation-references.sh            # check out the pinned manifest SHAs
#   scripts/fetch-animation-references.sh --latest   # move to upstream HEAD (to re-pin)
#   scripts/fetch-animation-references.sh --status   # print pinned vs local SHA, no network
#   scripts/fetch-animation-references.sh 3b1b-videos reducible
#                                                    # limit to the named repos (by slug)
#
# By default every repo is checked out at the commit recorded in the manifest,
# so an analysis written against a pinned SHA keeps describing the code that is
# actually on disk. Mismatches (local HEAD != pinned SHA, or a pinned commit the
# server will not serve) are reported and make the script exit non-zero.
#
# Idempotent: clones when absent, fetches the pinned commit when present. Clones
# are shallow (--depth 1) and blob-filtered where the server supports it.
set -euo pipefail

source "$(dirname "${BASH_SOURCE[0]}")/_common.sh"

CACHE_DIR="$ROOT/.reference-sources/animation-repos"
MANIFEST="$ROOT/.reference-sources/manifest.json"

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
WANT_LATEST=0
FILTER=()
for arg in "$@"; do
  case "$arg" in
    --status) STATUS_ONLY=1 ;;
    --latest) WANT_LATEST=1 ;;
    -h|--help)
      sed -n '2,23p' "${BASH_SOURCE[0]}" | sed 's/^# \{0,1\}//'
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
command -v python3 >/dev/null || die "python3 is required (to read the manifest)"
[[ -f "$MANIFEST" ]] || die "missing manifest: $MANIFEST"
mkdir -p "$CACHE_DIR"

# Pinned SHA for a slug, or empty when the manifest has no entry.
pinned_sha() {
  python3 - "$MANIFEST" "$1" <<'PY'
import json, sys
manifest, slug = sys.argv[1], sys.argv[2]
with open(manifest) as handle:
    data = json.load(handle)
for repo in data.get("repositories", []):
    if repo.get("slug") == slug:
        print(repo.get("inspectedCommit", ""))
        break
PY
}

local_sha() {
  local dir="$1"
  [[ -d "$dir/.git" ]] || { echo ""; return 0; }
  git -C "$dir" rev-parse HEAD 2>/dev/null || echo ""
}

MISMATCHES=0

print_status() {
  printf '%-24s %-10s %-42s %s\n' "SLUG" "STATE" "LOCAL HEAD" "PINNED"
  local entry slug dir pin have state
  for entry in "${REPOS[@]}"; do
    slug="${entry%%|*}"
    want_repo "$slug" || continue
    dir="$CACHE_DIR/$slug"
    pin="$(pinned_sha "$slug")"
    have="$(local_sha "$dir")"
    if [[ -z "$have" ]]; then
      state="absent"
    elif [[ -z "$pin" ]]; then
      state="unpinned"
    elif [[ "$have" == "$pin" ]]; then
      state="pinned"
    else
      state="MISMATCH"
    fi
    printf '%-24s %-10s %-42s %s\n' \
      "$slug" "$state" "${have:-(absent)}" "${pin:-(none)}"
  done
}

if [[ "$STATUS_ONLY" -eq 1 ]]; then
  print_status
  exit 0
fi

# Fetch a specific commit into an existing shallow clone and check it out.
# GitHub serves arbitrary SHAs (uploadpack.allowAnySHA1InWant); other hosts may
# not, so a failure here is reported rather than fatal.
checkout_pinned() {
  local slug="$1" dir="$2" pin="$3"
  if [[ "$(local_sha "$dir")" == "$pin" ]]; then
    ok "$slug @ ${pin:0:7} (pinned)"
    return 0
  fi
  if git -C "$dir" cat-file -e "${pin}^{commit}" 2>/dev/null ||
     git -C "$dir" fetch --depth 1 origin "$pin" 2>/dev/null; then
    git -C "$dir" checkout --quiet --detach "$pin" 2>/dev/null || {
      warn "$slug: could not check out pinned $pin"
      MISMATCHES=$((MISMATCHES + 1))
      return 0
    }
    ok "$slug @ ${pin:0:7} (pinned)"
  else
    warn "$slug: upstream will not serve pinned $pin (force-push or GC?);" \
         "left at $(git -C "$dir" rev-parse --short HEAD)"
    MISMATCHES=$((MISMATCHES + 1))
  fi
}

fetch_one() {
  local slug="$1" url="$2"
  local dir="$CACHE_DIR/$slug"
  local pin
  pin="$(pinned_sha "$slug")"

  if [[ ! -d "$dir/.git" ]]; then
    log "cloning $slug from $url"
    # Blob filtering is best-effort; fall back to a plain shallow clone.
    if ! git clone --depth 1 --filter=blob:limit=1m --no-tags "$url" "$dir" 2>/dev/null; then
      rm -rf "$dir"
      git clone --depth 1 --no-tags "$url" "$dir"
    fi
  elif [[ "$WANT_LATEST" -eq 1 || -z "$pin" ]]; then
    log "updating $slug"
    if ! git -C "$dir" fetch --depth 1 origin HEAD 2>/dev/null; then
      warn "$slug: fetch failed (offline?); keeping existing checkout"
      return 0
    fi
    git -C "$dir" reset --hard FETCH_HEAD --quiet
  fi

  if [[ "$WANT_LATEST" -eq 1 ]]; then
    # Deliberately tracking upstream: report drift from the manifest so the
    # operator knows the manifest (and any analysis citing it) needs re-pinning.
    local have
    have="$(local_sha "$dir")"
    if [[ -n "$pin" && "$have" != "$pin" ]]; then
      warn "$slug: HEAD $have differs from pinned $pin — re-pin the manifest" \
           "and re-check the analyses that cite it"
      MISMATCHES=$((MISMATCHES + 1))
    fi
    ok "$slug @ $(git -C "$dir" rev-parse --short HEAD) (latest)"
    return 0
  fi

  if [[ -z "$pin" ]]; then
    warn "$slug: no inspectedCommit in the manifest — add one"
    MISMATCHES=$((MISMATCHES + 1))
    ok "$slug @ $(git -C "$dir" rev-parse --short HEAD) (unpinned)"
    return 0
  fi

  checkout_pinned "$slug" "$dir" "$pin"
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

if [[ "$MISMATCHES" -gt 0 ]]; then
  die "$MISMATCHES repository/repositories do not match the manifest (see warnings above)"
fi
