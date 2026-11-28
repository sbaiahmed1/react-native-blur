#!/bin/bash
# Compiles the Foundation-only Swift files in ios/Helpers with their tests and runs them.
set -euo pipefail
cd "$(dirname "$0")/../.."
out="${TMPDIR:-/tmp}/rnblur-ios-math"
xcrun swiftc -swift-version 5 -parse-as-library -O \
  ios/Helpers/LiquidGlassRules.swift \
  ios/Helpers/ProgressiveBandLayout.swift \
  scripts/ios-math/Tests.swift \
  -o "$out"
"$out"
