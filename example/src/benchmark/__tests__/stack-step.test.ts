import { nextStackStep } from '../stack-step';

const stack = (...names: string[]) => ({
  index: names.length - 1,
  routes: names.map((name, i) => ({ key: `${name}-${i}`, name })),
});

it('pushes when the scene is on top and focused', () => {
  expect(nextStackStep(stack('index', 'scene'), 'scene-1', true)).toEqual({
    type: 'push',
  });
});

it('waits while the scene is on top but another tab is focused', () => {
  expect(nextStackStep(stack('index', 'scene'), 'scene-1', false)).toEqual({
    type: 'wait',
  });
});

it('pops the detail route by its key when it sits right above the scene', () => {
  expect(
    nextStackStep(stack('index', 'scene', 'detail'), 'scene-1', false)
  ).toEqual({ type: 'pop', key: 'detail-2' });
});

it('waits when something other than detail is above the scene', () => {
  expect(
    nextStackStep(stack('index', 'scene', 'other'), 'scene-1', false)
  ).toEqual({ type: 'wait' });
});

it('waits when the detail on top was not pushed by this scene', () => {
  expect(
    nextStackStep(stack('index', 'scene', 'detail', 'detail'), 'scene-1', false)
  ).toEqual({ type: 'wait' });
});

it('waits while the navigator has no state yet', () => {
  expect(nextStackStep(undefined, 'scene-1', true)).toEqual({ type: 'wait' });
});
