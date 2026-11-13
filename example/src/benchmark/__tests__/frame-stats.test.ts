import { summarizeFrames } from '../frame-stats';

it('returns zeros for no frames', () => {
  expect(summarizeFrames([])).toEqual({
    frames: 0,
    durationMs: 0,
    p50: 0,
    p90: 0,
    p99: 0,
    max: 0,
    jankPct: 0,
  });
});

it('summarizes with an explicit refresh interval', () => {
  expect(summarizeFrames([16, 16, 16, 16, 16, 16, 16, 16, 16, 50], 16)).toEqual(
    {
      frames: 10,
      durationMs: 194,
      p50: 16,
      p90: 16,
      p99: 50,
      max: 50,
      jankPct: 10,
    }
  );
});

it('derives the refresh interval from the 10th percentile', () => {
  expect(summarizeFrames([8, 8, 8, 8, 8, 8, 8, 8, 8, 30]).jankPct).toBe(10);
});
