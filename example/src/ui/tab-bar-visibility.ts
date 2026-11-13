type TabState = {
  index: number;
  routes: readonly { name: string; state?: { index?: number } }[];
};

/** The bar hides over benchmark scenes, so no live effect sits on top of a measured run. */
export function isTabBarVisible(state: TabState): boolean {
  const focused = state.routes[state.index];
  if (focused?.name !== 'benchmark') return true;
  return (focused.state?.index ?? 0) === 0;
}
