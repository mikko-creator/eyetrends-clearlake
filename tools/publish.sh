#!/usr/bin/env bash
# Publish the rebuild to GitHub as a public repo plus a public Pages preview.
#
# Everything this script needs is already committed. The ONLY thing it cannot do
# for itself is authenticate: `gh auth login` is interactive, so it is run once
# by a human beforehand. This script refuses to do anything until that is true.
#
# Usage:
#   gh auth login -h github.com          # once, interactively
#   bash tools/publish.sh                 # then this
#
# Re-running is safe: repo creation and Pages enablement are both skipped if
# they already exist, and the pushes are fast-forwards.
set -euo pipefail

OWNER="${PUBLISH_OWNER:-mikko-creator}"
REPO="${PUBLISH_REPO:-eyetrends-clearlake}"
SLUG="$OWNER/$REPO"
PAGES_DIR=".pages-build"

say() { printf '\n\033[1m%s\033[0m\n' "$*"; }

# --- 0 · refuse to run unauthenticated -------------------------------------
say "0. authentication"
if ! gh auth status >/dev/null 2>&1; then
  echo "  NOT AUTHENTICATED."
  echo "  Run this yourself first, then re-run this script:"
  echo "      gh auth login -h github.com"
  exit 1
fi
echo "  authenticated as: $(gh api user --jq .login)"

# --- 1 · the Pages build must match the current dist ------------------------
say "1. refreshing the Pages build from dist/"
MSYS_NO_PATHCONV=1 node tools/build-pages.mjs "/$REPO"
if [ ! -f "$PAGES_DIR/index.html" ]; then
  echo "  Pages build produced no index.html — aborting"; exit 1
fi

# every reference must sit under the repo subpath, or the preview 404s
STRAY=$(grep -rhoE '(href|src)="/[^"]*"' "$PAGES_DIR" --include=*.html | grep -vc "\"/$REPO" || true)
if [ "${STRAY:-0}" -ne 0 ]; then
  echo "  $STRAY reference(s) are not under /$REPO — aborting rather than publishing a broken preview"
  exit 1
fi
echo "  0 unprefixed references"

# --- 2 · the repository ------------------------------------------------------
say "2. repository $SLUG"
if gh repo view "$SLUG" >/dev/null 2>&1; then
  echo "  already exists — reusing"
  git remote get-url origin >/dev/null 2>&1 || git remote add origin "https://github.com/$SLUG.git"
else
  gh repo create "$SLUG" --public \
    --description "Static rebuild of eyetrendsclearlake.com — 44 pages, no framework, no dependencies" \
    --source=. --remote=origin
  echo "  created"
fi

# --- 3 · push the project ----------------------------------------------------
say "3. pushing main"
git push -u origin main
echo "  pushed $(git rev-parse --short HEAD)"

# --- 4 · push the preview ----------------------------------------------------
say "4. pushing the preview to gh-pages"
# Test for the .git DIRECTORY, not `rev-parse --git-dir`. rev-parse walks UP:
# build-pages.mjs rm -rf's this directory each run, taking its .git with it, so
# rev-parse then finds the PARENT repository, reports success, and every
# subsequent `git -C "$PAGES_DIR"` silently operates on the main repo. That is
# exactly how the first publish pushed main to gh-pages and served a directory
# listing of src/ and tools/ instead of the site.
if [ ! -d "$PAGES_DIR/.git" ]; then
  git -C "$PAGES_DIR" init -q
  git -C "$PAGES_DIR" config user.name  "$(git config user.name)"
  git -C "$PAGES_DIR" config user.email "$(git config user.email)"
fi
# and prove we are about to push the SITE, not the project
if [ ! -f "$PAGES_DIR/index.html" ]; then
  echo "  $PAGES_DIR/index.html missing — refusing to push"; exit 1
fi
git -C "$PAGES_DIR" add -A
git -C "$PAGES_DIR" commit -q -m "Eye Trends Clear Lake — public preview ($(git rev-parse --short HEAD))" || echo "  nothing new to commit"
git -C "$PAGES_DIR" branch -M main
git -C "$PAGES_DIR" push -f "https://github.com/$SLUG.git" main:gh-pages
echo "  pushed gh-pages"
if ! gh api "repos/$SLUG/contents/index.html?ref=gh-pages" >/dev/null 2>&1; then
  echo "  index.html is NOT at the root of gh-pages — the wrong tree was pushed"; exit 1
fi
echo "  verified: index.html is at the gh-pages root"

# --- 5 · enable Pages --------------------------------------------------------
say "5. GitHub Pages"
if gh api "repos/$SLUG/pages" >/dev/null 2>&1; then
  echo "  already enabled"
else
  gh api -X POST "repos/$SLUG/pages" \
    -f "source[branch]=gh-pages" -f "source[path]=/" >/dev/null
  echo "  enabled on gh-pages"
fi

# --- 6 · wait for the build, then PROVE it serves ---------------------------
say "6. waiting for the Pages build, then verifying"
URL="https://$OWNER.github.io/$REPO/"
for i in $(seq 1 40); do
  STATUS=$(gh api "repos/$SLUG/pages" --jq .status 2>/dev/null || echo "unknown")
  CODE=$(curl -s -o /dev/null -w '%{http_code}' "$URL" || echo 000)
  printf '  attempt %2d  pages:%-10s http:%s\n' "$i" "$STATUS" "$CODE"
  [ "$CODE" = "200" ] && break
  sleep 15
done

say "verifying the live preview"
FAILED=0
for p in "" "styles/system.css" "assets/img/hero-eyewear.webp" "services/" "scripts/site.js" "search-index.json"; do
  CODE=$(curl -s -o /dev/null -w '%{http_code}' "$URL$p" || echo 000)
  printf '  %-42s %s\n' "/$p" "$CODE"
  [ "$CODE" = "200" ] || FAILED=$((FAILED+1))
done

say "result"
echo "  repo    : https://github.com/$SLUG"
echo "  preview : $URL"
if [ "$FAILED" -ne 0 ]; then
  echo "  $FAILED path(s) did not return 200 — Pages can take a few minutes on first publish."
  echo "  Re-run this script to re-check; it will skip everything already done."
  exit 1
fi
echo "  all checked paths return 200"
