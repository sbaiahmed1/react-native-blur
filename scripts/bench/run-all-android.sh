#!/usr/bin/env bash
# Usage: run-all-android.sh [label]. Runs every Android benchmark scene once, then prints the table.
set -euo pipefail

DIR=$(cd "$(dirname "$0")" && pwd)
ROOT=$(cd "$DIR/../.." && pwd)
LABEL=${1:-$(git -C "$ROOT" describe --always --dirty)}

if [ -n "$(ls -A "$ROOT/benchmarks/results/$LABEL" 2>/dev/null)" ]; then
  echo "run-all-android.sh: warning: benchmarks/results/$LABEL already holds results, the table will mix runs" >&2
fi

RUNS=(
  "baseline-list"
  "blur-list count=1"
  "blur-list count=3"
  "blur-list count=6"
  "progressive-bars"
  "progressive-ramp"
  "progressive-ramp count=2"
  "glass-list count=3"
  "blur-in-scroll count=6"
  "animated-amount"
  "idle-cursor"
  "modal-idle"
  "modal-live"
  "stack-push"
  "root-overlay"
  "recycle"
  "overlap"
  "overlap-badges"
  "nested"
  "halo"
  "geometry"
  "stacked count=10"
  "stacked-zigzag count=10"
  "stacked-wrapped count=10"
  "stacked-badges count=6"
  "side-by-side"
  "stacked-modal count=10"
)

for run in "${RUNS[@]}"; do
  read -r scene query <<<"$run"
  echo "== $scene ${query:-}" >&2
  bash "$DIR/run-android.sh" "$scene" "${query:-}" "$LABEL" >/dev/null
done

node "$DIR/parse-gfxinfo.js" --table "$ROOT/benchmarks/results/$LABEL"
