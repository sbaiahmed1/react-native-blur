import { useSyncExternalStore } from 'react';

import type { MaterialScheme } from './materials';

const DARK_QUERY = '(prefers-color-scheme: dark)';

type DarkMedia = {
  matches: boolean;
  addEventListener?: (type: 'change', listener: () => void) => void;
  removeEventListener?: (type: 'change', listener: () => void) => void;
  addListener?: (listener: () => void) => void;
  removeListener?: (listener: () => void) => void;
};

const darkMedia = (): DarkMedia | null => {
  const matchMedia = (
    globalThis as { matchMedia?: (query: string) => DarkMedia }
  ).matchMedia;
  return typeof matchMedia === 'function' ? matchMedia(DARK_QUERY) : null;
};

const subscribe = (onChange: () => void) => {
  const media = darkMedia();
  if (!media) return () => {};
  if (media.addEventListener) {
    media.addEventListener('change', onChange);
    return () => media.removeEventListener?.('change', onChange);
  }
  // Safari before 14 only has the deprecated listener API.
  media.addListener?.(onChange);
  return () => media.removeListener?.(onChange);
};

const getSnapshot = (): MaterialScheme =>
  darkMedia()?.matches ? 'dark' : 'light';

// Static rendering cannot know the visitor's scheme, so the first paint is light.
const getServerSnapshot = (): MaterialScheme => 'light';

/** The color scheme the adaptive blurTypes follow, from `prefers-color-scheme`. */
export function useMaterialScheme(): MaterialScheme {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
