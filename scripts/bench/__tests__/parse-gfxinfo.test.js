const { parseGfxinfo, formatTable } = require('../parse-gfxinfo');

const SAMPLE = `
Stats since: 123456789ns
Total frames rendered: 600
Janky frames: 42 (7.00%)
Janky frames (legacy): 80 (13.33%)
50th percentile: 9ms
90th percentile: 14ms
95th percentile: 18ms
99th percentile: 34ms
50th gpu percentile: 4ms
`;

it('parses the summary block and ignores the legacy and gpu lines', () => {
  expect(parseGfxinfo(SAMPLE)).toEqual({
    totalFrames: 600,
    jankyFrames: 42,
    jankyPct: 7,
    p50: 9,
    p90: 14,
    p95: 18,
    p99: 34,
  });
});

it('returns null for missing lines', () => {
  expect(parseGfxinfo('Total frames rendered: 0')).toEqual({
    totalFrames: 0,
    jankyFrames: null,
    jankyPct: null,
    p50: null,
    p90: null,
    p95: null,
    p99: null,
  });
});

it('formats a table and prints null as n/a', () => {
  const table = formatTable([
    {
      scene: 'blur-list',
      totalFrames: 600,
      jankyPct: 7,
      p50: 9,
      p90: 14,
      p99: 34,
    },
    {
      scene: 'modal-idle',
      totalFrames: 0,
      jankyPct: null,
      p50: null,
      p90: null,
      p99: null,
    },
  ]);
  expect(table.split('\n')).toEqual([
    '| Scene | Frames | Janky % | p50 ms | p90 ms | p99 ms |',
    '| --- | --- | --- | --- | --- | --- |',
    '| blur-list | 600 | 7 | 9 | 14 | 34 |',
    '| modal-idle | 0 | n/a | n/a | n/a | n/a |',
  ]);
});
