/** A frame that ends inside the warm-up is left out of the summary, so start-up frames do not count. */
export function isWarmupFrame(sinceStartMs: number, warmupMs: number): boolean {
  'worklet';
  return sinceStartMs <= warmupMs && warmupMs > 0;
}
