import { isTabBarVisible } from '../tab-bar-visibility';

const state = (index: number, benchmarkDepth?: number) => ({
  index,
  routes: [
    { key: 'b', name: 'blur', state: { index: 1 } },
    {
      key: 'm',
      name: 'benchmark',
      state:
        benchmarkDepth === undefined ? undefined : { index: benchmarkDepth },
    },
  ],
});

it('shows the bar on an effect tab, even with a pushed playground', () => {
  expect(isTabBarVisible(state(0))).toBe(true);
});

it('shows the bar on the benchmark scene list', () => {
  expect(isTabBarVisible(state(1, 0))).toBe(true);
  expect(isTabBarVisible(state(1))).toBe(true);
});

it('hides the bar while a benchmark scene or detail is on top', () => {
  expect(isTabBarVisible(state(1, 1))).toBe(false);
  expect(isTabBarVisible(state(1, 2))).toBe(false);
});
