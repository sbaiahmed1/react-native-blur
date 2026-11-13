import type { Theme } from './theme';

/** Header for a pushed playground: large title on iOS, flat bar that blends into the grouped list. */
export function playgroundHeader(t: Theme, title: string, backTitle: string) {
  return {
    headerShown: true,
    title,
    headerBackTitle: backTitle,
    headerLargeTitle: true,
    headerShadowVisible: false,
    headerLargeTitleShadowVisible: false,
    headerStyle: { backgroundColor: t.colors.grouped },
    headerTitleStyle: { color: t.colors.text },
    headerLargeTitleStyle: { color: t.colors.text },
    headerTintColor: t.colors.accent,
  } as const;
}
