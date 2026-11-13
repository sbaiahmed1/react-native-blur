type TabState = {
  index: number;
  routes: readonly {
    name: string;
    state?: { index?: number; routes: readonly { name: string }[] };
  }[];
};

/** The bar shows on the benchmark tab only over its scene list, so no live effect sits on a measured run. */
export function isTabBarVisible(state: TabState): boolean {
  const focused = state.routes[state.index];
  if (focused?.name !== 'benchmark') return true;
  const stack = focused.state;
  if (!stack) return true;
  // A deep link can open a scene as the only route, so the top route name decides, not the depth.
  const top = stack.routes[stack.index ?? stack.routes.length - 1];
  return top?.name === 'index';
}
