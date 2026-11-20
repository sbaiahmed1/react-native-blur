import { useColorScheme } from 'react-native';

import type { MaterialScheme } from './materials';

/** The color scheme the adaptive blurTypes follow, light unless the app is in dark mode. */
export function useMaterialScheme(): MaterialScheme {
  return useColorScheme() === 'dark' ? 'dark' : 'light';
}
