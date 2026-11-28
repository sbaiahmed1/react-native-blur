#!/usr/bin/env bash
# Checks whether a built ReactNativeBlur library contains the private variable blur API.
# Usage: scripts/check-private-api.sh <search-dir> debug|release present|absent
# Exits 0 when every hard marker matches the expectation, 1 otherwise.
set -euo pipefail

usage() {
  echo "usage: $0 <search-dir> debug|release present|absent" >&2
  exit 1
}

[ $# -eq 3 ] || usage
search_dir=$(cd "$1" && pwd)
config=$2
expect=$3
case "$config" in debug | release) ;; *) usage ;; esac
case "$expect" in present | absent) ;; *) usage ;; esac

work=$(mktemp -d)
trap 'rm -rf "$work"' EXIT

# CocoaPods leaves a static archive, SwiftPM leaves the target's object files.
objects=()
index=0
while IFS= read -r archive; do
  index=$((index + 1))
  out="$work/archive$index"
  mkdir -p "$out"
  if lipo -info "$archive" 2>/dev/null | grep -q "^Architectures in the fat file"; then
    lipo "$archive" -thin arm64 -output "$out/thin.a"
    archive="$out/thin.a"
  fi
  (cd "$out" && ar -x "$archive")
  while IFS= read -r object; do objects+=("$object"); done < <(find "$out" -name '*.o')
done < <(find "$search_dir" -name 'libReactNativeBlur.a' -type f)
if [ ${#objects[@]} -eq 0 ]; then
  while IFS= read -r object; do objects+=("$object"); done < <(find "$search_dir" -path '*/ReactNativeBlur.build/*' -name '*.o' -type f)
fi
if [ ${#objects[@]} -eq 0 ]; then
  echo "No libReactNativeBlur.a or ReactNativeBlur.build objects under $search_dir" >&2
  exit 1
fi
echo "Checking ${#objects[@]} ReactNativeBlur objects under $search_dir ($config, expecting $expect)"

for object in "${objects[@]}"; do
  nm "$object" 2>/dev/null > "$object.nm" || true
  otool -v -s __TEXT __cstring "$object" 2>/dev/null > "$object.cstring" || true
done

# Release builds keep short Swift literals out of __cstring, so only the long ones are hard markers there.
symbol_markers=("16VariableBlurView")
if [ "$config" = debug ]; then
  string_markers=("retliFAC" ":epyThtiWretlif" "inputMaskImage" "inputNormalizeEdges" "[VariableBlur] Error:")
else
  string_markers=("inputNormalizeEdges" "[VariableBlur] Error:")
fi
soft_markers=("_NSClassFromString" "_NSSelectorFromString" 'objc_msgSend$setFilters:' 'objc_msgSend$performSelector:withObject:' 'objc_msgSend$valueForKey:' 'objc_msgSend$setValue:forKey:')

where_found() {
  local suffix=$1 marker=$2 object found=""
  for object in "${objects[@]}"; do
    if grep -qF -- "$marker" "$object.$suffix"; then found="$found $(basename "$object")"; fi
  done
  echo "$found"
}

failed=0
check() {
  local suffix=$1 marker=$2 found
  found=$(where_found "$suffix" "$marker")
  if [ -n "$found" ]; then
    echo "  present  $marker  in$found"
    [ "$expect" = present ] || failed=1
  else
    echo "  absent   $marker"
    [ "$expect" = absent ] || failed=1
  fi
}

echo "Hard markers:"
for marker in "${symbol_markers[@]}"; do check nm "$marker"; done
for marker in "${string_markers[@]}"; do check cstring "$marker"; done

echo "Soft markers, reported only:"
for marker in "${soft_markers[@]}"; do
  found=$(where_found nm "$marker")
  if [ -n "$found" ]; then echo "  present  $marker  in$found"; else echo "  absent   $marker"; fi
done

if [ "$failed" -ne 0 ]; then
  echo "FAIL: a hard marker does not match $expect"
  exit 1
fi
echo "OK: every hard marker is $expect"
