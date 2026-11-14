import { useSyncExternalStore } from 'react';
import { Appearance } from 'react-native';

type Scheme = ReturnType<typeof Appearance.getColorScheme>;

function subscribe(onChange: () => void) {
  const subscription = Appearance.addChangeListener(onChange);
  return () => subscription.remove();
}

const getScheme = (): Scheme => Appearance.getColorScheme();

// The static export renders on the server in light, so hydration starts light and switches after.
const getServerScheme = (): Scheme => 'light';

/** The browser color scheme, hydration safe for the static web export. */
export function useColorScheme(): Scheme {
  return useSyncExternalStore(subscribe, getScheme, getServerScheme);
}
