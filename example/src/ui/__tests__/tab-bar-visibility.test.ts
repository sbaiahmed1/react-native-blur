import { isTabBarVisible } from '../tab-bar-visibility';

const stack = (index: number, ...names: string[]) => ({
  index,
  routes: names.map((name) => ({ name })),
});

const tabs = (index: number, benchmark?: ReturnType<typeof stack>) => ({
  index,
  routes: [
    { name: 'blur', state: stack(1, 'index', 'playground') },
    { name: 'benchmark', state: benchmark },
  ],
});

it('shows the bar on an effect tab, even with a pushed playground', () => {
  expect(isTabBarVisible(tabs(0))).toBe(true);
});

it('shows the bar on the benchmark scene list', () => {
  expect(isTabBarVisible(tabs(1, stack(0, 'index')))).toBe(true);
  expect(isTabBarVisible(tabs(1))).toBe(true);
});

it('hides the bar while a benchmark scene or detail is on top', () => {
  expect(isTabBarVisible(tabs(1, stack(1, 'index', '[scene]')))).toBe(false);
  expect(isTabBarVisible(tabs(1, stack(2, 'index', '[scene]', 'detail')))).toBe(
    false
  );
});

it('hides the bar on a deep link, where the scene is the only route', () => {
  expect(isTabBarVisible(tabs(1, stack(0, '[scene]')))).toBe(false);
});
