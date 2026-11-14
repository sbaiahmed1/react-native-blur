export type FrameSummary = {
  frames: number;
  durationMs: number;
  p50: number;
  p90: number;
  p99: number;
  max: number;
  jankPct: number;
};

const JANK_FACTOR = 1.5;

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

// Nearest-rank percentile on an ascending array.
function percentile(sorted: readonly number[], p: number): number {
  const index = Math.max(0, Math.ceil((p / 100) * sorted.length) - 1);
  return sorted[index] ?? 0;
}

export function summarizeFrames(
  deltasMs: readonly number[],
  refreshMs?: number
): FrameSummary {
  const frames = deltasMs.length;
  if (frames === 0) {
    return {
      frames,
      durationMs: 0,
      p50: 0,
      p90: 0,
      p99: 0,
      max: 0,
      jankPct: 0,
    };
  }
  const sorted = [...deltasMs].sort((a, b) => a - b);
  const refresh = refreshMs ?? percentile(sorted, 10);
  const janky = deltasMs.filter((d) => d > JANK_FACTOR * refresh).length;
  return {
    frames,
    durationMs: round2(deltasMs.reduce((sum, d) => sum + d, 0)),
    p50: round2(percentile(sorted, 50)),
    p90: round2(percentile(sorted, 90)),
    p99: round2(percentile(sorted, 99)),
    max: round2(sorted[frames - 1] ?? 0),
    jankPct: round2((janky / frames) * 100),
  };
}
