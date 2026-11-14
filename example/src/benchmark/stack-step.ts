type StackState = {
  index: number;
  routes: readonly { key: string; name: string }[];
};

export type StackStep =
  { type: 'push' } | { type: 'pop'; key: string } | { type: 'wait' };

/** The next stack-push move, read from the benchmark stack itself so it never pops another screen. */
export function nextStackStep(
  state: StackState | undefined,
  sceneKey: string,
  focused: boolean
): StackStep {
  if (!state) return { type: 'wait' };
  const top = state.routes[state.index];
  if (top?.key === sceneKey)
    return focused ? { type: 'push' } : { type: 'wait' };
  const below = state.routes[state.index - 1];
  if (top?.name === 'detail' && below?.key === sceneKey) {
    return { type: 'pop', key: top.key };
  }
  return { type: 'wait' };
}
