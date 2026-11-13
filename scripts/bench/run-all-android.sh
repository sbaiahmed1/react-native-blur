#!/usr/bin/env bash
# Usage: run-all-android.sh [label]. Runs every Android benchmark scene once, then prints the table.
set -euo pipefail

DIR=$(cd "$(dirname "$0")" && pwd)
ROOT=$(cd "$DIR/../.." && pwd)
LABEL=${1:-$(git -C "$ROOT" rev-parse --short HEAD)}

RUNS=(
  "baseline-list"
  "blur-list count=1"
  "blur-list count=3"
  "blur-list count=6"
  "progressive-bars"
  "glass-list count=3"
  "blur-in-scroll count=6"
  "animated-amount"
  "idle-cursor"
  "modal-idle"
  "modal-live"
  "stack-push"
  "root-overlay"
)

for run in "${RUNS[@]}"; do
  read -r scene query <<<"$run"
  echo "== $scene ${query:-}" >&2
  bash "$DIR/run-android.sh" "$scene" "${query:-}" "$LABEL" >/dev/null
done

node "$DIR/parse-gfxinfo.js" --table "$ROOT/benchmarks/results/$LABEL"
