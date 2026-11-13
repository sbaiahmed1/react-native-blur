import { isWarmupFrame } from '../frame-window';

it('records every frame when warm-up is 0', () => {
  expect(isWarmupFrame(16, 0)).toBe(false);
});

it('drops frames that end inside the warm-up', () => {
  expect(isWarmupFrame(1999, 2000)).toBe(true);
  expect(isWarmupFrame(2000, 2000)).toBe(true);
});

it('records the first frame that ends after the warm-up', () => {
  expect(isWarmupFrame(2001, 2000)).toBe(false);
});
