import type { ProgressiveBlurDirection } from '@sbaiahmed1/react-native-blur';

export type BenchParams = {
  count: number;
  duration: number;
  amount: number;
  rounds: number;
  images: boolean;
  autoplay: boolean;
  animation: 'default' | 'fade' | 'fade_from_bottom';
  warmup: number;
  direction: ProgressiveBlurDirection;
  offset: number;
};

export const BENCH_LIMITS = {
  count: [1, 12],
  duration: [1, 120],
  amount: [0, 100],
  rounds: [1, 15],
  warmup: [0, 10],
  offset: [0, 1],
} as const;

export const PROGRESSIVE_DIRECTIONS: readonly ProgressiveBlurDirection[] = [
  'blurredTopClearBottom',
  'blurredBottomClearTop',
  'blurredCenterClearTopAndBottom',
];

type RawParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function parseNumber(
  value: string | undefined,
  fallback: number,
  [min, max]: readonly [number, number],
  integer: boolean
): number {
  if (value === undefined || value.trim() === '') return fallback;
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  const clamped = Math.min(max, Math.max(min, n));
  return integer ? Math.floor(clamped) : clamped;
}

function parseFlag(value: string | undefined, fallback: boolean): boolean {
  return value === undefined ? fallback : value === '1';
}

export function parseBenchParams(
  raw: RawParams,
  defaults: BenchParams
): BenchParams {
  const animation = first(raw.animation);
  const direction = PROGRESSIVE_DIRECTIONS.find(
    (value) => value === first(raw.direction)
  );
  return {
    count: parseNumber(
      first(raw.count),
      defaults.count,
      BENCH_LIMITS.count,
      true
    ),
    duration: parseNumber(
      first(raw.duration),
      defaults.duration,
      BENCH_LIMITS.duration,
      false
    ),
    amount: parseNumber(
      first(raw.amount),
      defaults.amount,
      BENCH_LIMITS.amount,
      false
    ),
    rounds: parseNumber(
      first(raw.rounds),
      defaults.rounds,
      BENCH_LIMITS.rounds,
      true
    ),
    images: parseFlag(first(raw.images), defaults.images),
    autoplay: parseFlag(first(raw.autoplay), defaults.autoplay),
    animation:
      animation === 'default' ||
      animation === 'fade' ||
      animation === 'fade_from_bottom'
        ? animation
        : defaults.animation,
    warmup: parseNumber(
      first(raw.warmup),
      defaults.warmup,
      BENCH_LIMITS.warmup,
      false
    ),
    direction: direction ?? defaults.direction,
    offset: parseNumber(
      first(raw.offset),
      defaults.offset,
      BENCH_LIMITS.offset,
      false
    ),
  };
}

/** Identity of one run: any query change, `run=<n>` included, starts a new one. */
export function benchRunKey(raw: RawParams): string {
  return JSON.stringify(
    Object.keys(raw)
      .filter((key) => raw[key] !== undefined)
      .sort()
      .map((key) => [key, raw[key]])
  );
}
