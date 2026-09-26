#!/usr/bin/env sh
# Rebuilds src/assets/fonts/inter-latin-400-600.woff2 (≈26KB) from Inter's variable font.
# The site only uses weights 400–600 and Latin text, so the rest is cut.
# Needs: pip install fonttools brotli
# Usage: sh scripts/subset-inter.sh path/to/InterVariable.woff2
set -eu
src="$1"
tmp="$(mktemp -d)"
fonttools varLib.instancer "$src" wght=400:600 -o "$tmp/inter.ttf"
pyftsubset "$tmp/inter.ttf" \
  --unicodes="U+0020-007E,U+00A0-00FF,U+0131,U+0152-0153,U+02C6,U+02DA,U+02DC,U+2000-206F,U+2190-2193,U+2197,U+2212,U+2122,U+20AC" \
  --layout-features="kern,liga,calt,tnum,case,ccmp,locl,mark,mkmk" \
  --flavor=woff2 \
  --output-file=src/assets/fonts/inter-latin-400-600.woff2
rm -rf "$tmp"
echo "Wrote src/assets/fonts/inter-latin-400-600.woff2"
