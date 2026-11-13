#!/usr/bin/env bash
# Usage: run-android.sh <scene> [query] [label]. adb picks the device from ANDROID_SERIAL.
set -euo pipefail

PKG=com.sbaiahmed1.reactnativeblurexampleapp
RUN_SEC=20
SETTLE_SEC=5
WINDOW_SEC=10

SCENE=${1:?usage: run-android.sh <scene> [query] [label]}
QUERY=${2:-}
ROOT=$(cd "$(dirname "$0")/../.." && pwd)
LABEL=${3:-$(git -C "$ROOT" rev-parse --short HEAD)}

if [ "$(adb get-state 2>/dev/null)" != "device" ]; then
  echo "run-android.sh: no single Android device attached (set ANDROID_SERIAL)" >&2
  exit 1
fi

URL="exampleapp://benchmark/${SCENE}?autoplay=1&duration=${RUN_SEC}${QUERY:+&${QUERY}}"
OUT_DIR="$ROOT/benchmarks/results/$LABEL"
OUT="$OUT_DIR/${SCENE}${QUERY:+-${QUERY//[=&]/-}}.json"
mkdir -p "$OUT_DIR"

adb shell am force-stop "$PKG" </dev/null
# The URL is quoted again for the device shell, which would otherwise split it at each &.
adb shell "am start -W -a android.intent.action.VIEW -d '$URL' $PKG" </dev/null >/dev/null
sleep "$SETTLE_SEC"
adb shell dumpsys gfxinfo "$PKG" reset </dev/null >/dev/null
sleep "$WINDOW_SEC"
adb shell dumpsys gfxinfo "$PKG" </dev/null |
  node "$ROOT/scripts/bench/parse-gfxinfo.js" |
  node -e '
    let input = "";
    process.stdin.on("data", (chunk) => (input += chunk));
    process.stdin.on("end", () => {
      const [scene, query] = process.argv.slice(1);
      console.log(JSON.stringify({ scene, query, ...JSON.parse(input) }));
    });
  ' "$SCENE" "$QUERY" >"$OUT"

echo "$OUT"
