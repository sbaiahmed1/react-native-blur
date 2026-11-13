import { parseBenchParams, type BenchParams } from '../params';

const D: BenchParams = {
  count: 3,
  duration: 10,
  amount: 20,
  rounds: 5,
  images: false,
  autoplay: false,
  animation: 'default',
};

it('returns the defaults for an empty query', () => {
  expect(parseBenchParams({}, D)).toEqual(D);
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
  });
});

it('clamps out-of-range numbers', () => {
  const p = parseBenchParams(
    { count: '99', amount: '-4', rounds: '0', duration: '0' },
    D
  );
  expect([p.count, p.amount, p.rounds, p.duration]).toEqual([12, 0, 1, 1]);
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
