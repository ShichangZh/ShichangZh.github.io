#!/bin/sh
# Build the whole site: every *.jemdoc -> *.html
#
# Always build with this script rather than calling jemdoc by hand -- it passes
# the site config (jemdoc.conf), cleans up the malformed link attributes the
# local jemdoc+MathJax build emits, and copies the shared assets into the
# subdirectories that need them.
#
# Run it any of these ways -- it is plain POSIX sh, so all of them work:
#   ./compile_all_jemdoc.sh
#   sh compile_all_jemdoc.sh
#   bash compile_all_jemdoc.sh
#
# Note: assumes no spaces in the .jemdoc paths, which holds for this repo.

set -eu

cd "$(dirname "$0")"

# jemdoc must be on PATH. If yours lives in a conda env, activate it first:
#   conda activate jemdoc && ./compile_all_jemdoc.sh
if ! command -v jemdoc >/dev/null 2>&1; then
  echo "error: jemdoc not found on PATH." >&2
  exit 1
fi

CONF="jemdoc.conf"

# Compile every source. Run from the repo root so that the menu{} paths in the
# directive lines (e.g. teaching/cs97/CS97_MENU) resolve correctly.
for src in $(find . -name '*.jemdoc' -type f | sort); do
  out="${src%.jemdoc}.html"
  jemdoc -c "$CONF" "$src" 2>/dev/null

  # The local jemdoc hardcodes target="blank" and then runs its smart-quote pass
  # over it, producing target=&ldquo;blank&rdquo;. Rewrite it: internal page
  # links stay in the same tab, everything else opens in a new one.
  perl -0pi -e '
    s{<a href="((?!https?:)[^"]*\.html(?:\#[^"]*)?)" target=(?:&ldquo;blank&rdquo;|"blank")>}{<a href="$1">}g;
    s{ target=(?:&ldquo;blank&rdquo;|"blank")}{ target="_blank" rel="noopener"}g;
  ' "$out"

  echo "  built $out"
done

# Pages in subdirectories load jemdoc.css / site.js relative to themselves, so
# keep a copy of each asset beside them.
for dir in $(find . -name '*.jemdoc' -type f -exec dirname {} \; | sort -u); do
  if [ "$dir" != "." ]; then
    for asset in jemdoc.css site.js; do
      cp "$asset" "$dir/$asset"
      echo "  synced $dir/$asset"
    done
  fi
done

echo "done."
