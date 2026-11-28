/** Always false on web, where LiquidGlassView draws its blur fallback. */
export function isLiquidGlassAvailable(): boolean {
  return false;
}

/** Always false on web, which has no iOS build. */
export function usesPrivateIOSApi(): boolean {
  return false;
}
