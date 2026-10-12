#!/bin/sh
# Build the app and publish it to GitHub Pages: https://chess6.github.io/technical-learning/
#
#   sh scripts/deploy-pages.sh
#
# Builds from the current working tree into a temporary folder and force-pushes it to the
# gh-pages branch (build output only; master is untouched). Pages serves that branch.
set -e
cd "$(dirname "$0")/.."

BASE=/technical-learning/
OUT=$(mktemp -d)
trap 'rm -rf "$OUT"' EXIT

npx tsc -b
npx vite build --base="$BASE" --outDir "$OUT" --emptyOutDir

# Single-page app: GitHub Pages serves 404.html for unknown paths, so deep links
# like /technical-learning/lesson/eigenvectors still load the app.
cp "$OUT/index.html" "$OUT/404.html"
touch "$OUT/.nojekyll"   # don't let Jekyll drop files that start with "_"

REMOTE=$(git remote get-url origin)
SRC=$(git rev-parse --short HEAD)$(git diff --quiet || echo "+local changes")
cd "$OUT"
git init -q -b gh-pages
git add -A
git -c user.name="$(git -C "$OLDPWD" config user.name)" -c user.email="$(git -C "$OLDPWD" config user.email)" \
  commit -q -m "Deploy $SRC"
git push -q -f "$REMOTE" gh-pages
echo "Deployed. Live in ~1 minute at https://chess6.github.io$BASE"
