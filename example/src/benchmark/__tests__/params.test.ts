import { benchRunKey, parseBenchParams, type BenchParams } from '../params';

const D: BenchParams = {
  count: 3,
  duration: 10,
  amount: 20,
  rounds: 5,
  images: false,
  autoplay: false,
  animation: 'default',
  warmup: 0,
  direction: 'blurredTopClearBottom',
  offset: 0,
};

it('returns the defaults for an empty query', () => {
  expect(parseBenchParams({}, D)).toEqual(D);
});

it('accepts fade_from_bottom', () => {
  expect(parseBenchParams({ animation: 'fade_from_bottom' }, D).animation).toBe(
    'fade_from_bottom'
  );
});

it('parses every param', () => {
  expect(
    parseBenchParams(
      {
        count: '3',
        duration: '20',
        amount: '55.5',
        rounds: '8',
        images: '1',
        autoplay: '1',
        animation: 'fade',
        warmup: '2',
        direction: 'blurredBottomClearTop',
        offset: '0.25',
      },
      D
    )
  ).toEqual({
    count: 3,
    duration: 20,
    amount: 55.5,
    rounds: 8,
    images: true,
    autoplay: true,
    animation: 'fade',
    warmup: 2,
    direction: 'blurredBottomClearTop',
    offset: 0.25,
  });
});

it('parses direction and offset', () => {
  const p = parseBenchParams(
    { direction: 'blurredCenterClearTopAndBottom', offset: '0.3' },
    D
  );
  expect([p.direction, p.offset]).toEqual([
    'blurredCenterClearTopAndBottom',
    0.3,
  ]);
});

it('parses the left and right directions', () => {
  expect(
    parseBenchParams({ direction: 'blurredRightToClearLeft' }, D).direction
  ).toBe('blurredRightToClearLeft');
  expect(
    parseBenchParams({ direction: 'blurredLeftToClearRight' }, D).direction
  ).toBe('blurredLeftToClearRight');
});

it('falls back on an unknown direction and clamps the offset to 0-1', () => {
  const p = parseBenchParams({ direction: 'sideways', offset: '2' }, D);
  expect([p.direction, p.offset]).toEqual(['blurredTopClearBottom', 1]);
});

it('clamps out-of-range numbers', () => {
  const p = parseBenchParams(
    { count: '99', amount: '-4', rounds: '0', duration: '0' },
    D
  );
  expect([p.count, p.amount, p.rounds, p.duration]).toEqual([12, 0, 1, 1]);
});

it('parses warmup in seconds and clamps it to 0-10', () => {
  expect(parseBenchParams({ warmup: '2' }, D).warmup).toBe(2);
  expect(parseBenchParams({ warmup: '30' }, D).warmup).toBe(10);
  expect(parseBenchParams({ warmup: '-1' }, D).warmup).toBe(0);
});

it('falls back on junk and treats only "1" as true', () => {
  const p = parseBenchParams(
    { count: 'abc', animation: 'spin', images: 'yes' },
    D
  );
  expect([p.count, p.animation, p.images]).toEqual([3, 'default', false]);
});

it('takes the first value of a repeated param and floors count', () => {
  expect(parseBenchParams({ count: ['4', '9'] }, D).count).toBe(4);
  expect(parseBenchParams({ count: '3.9' }, D).count).toBe(3);
});

describe('benchRunKey', () => {
  it('is the same for the same query in any order', () => {
    expect(benchRunKey({ scene: 'blur-list', count: '3', autoplay: '1' })).toBe(
      benchRunKey({ autoplay: '1', count: '3', scene: 'blur-list' })
    );
  });

  it('changes when a param changes', () => {
    expect(benchRunKey({ scene: 'blur-list', count: '1' })).not.toBe(
      benchRunKey({ scene: 'blur-list', count: '6' })
    );
  });

  it('changes when only run changes, so a repeat can force a new run', () => {
    expect(benchRunKey({ scene: 'blur-list', run: '1' })).not.toBe(
      benchRunKey({ scene: 'blur-list', run: '2' })
    );
  });

  it('ignores undefined values', () => {
    expect(benchRunKey({ scene: 'blur-list', count: undefined })).toBe(
      benchRunKey({ scene: 'blur-list' })
    );
  });
});
