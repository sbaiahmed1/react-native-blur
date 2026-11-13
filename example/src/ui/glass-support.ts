import { Platform } from 'react-native';

const VERSION = Number.parseInt(String(Platform.Version), 10);

/** Same gate as LiquidGlassView: native glass on iOS 26+ and Android 13+ (API 33). */
export const NATIVE_GLASS =
  (Platform.OS === 'ios' && VERSION >= 26) ||
  (Platform.OS === 'android' && VERSION >= 33);

/** LiquidGlassContainer merges shapes only on iOS 26+. */
export const NATIVE_GLASS_CONTAINER = Platform.OS === 'ios' && VERSION >= 26;

export const GLASS_FALLBACK_NOTICE = Platform.select({
  ios: 'Native glass needs iOS 26. This preview shows the blur fallback.',
  android:
    'Native glass needs Android 13. This preview shows the blur fallback.',
  default: 'On web, LiquidGlassView shows the blur fallback.',
});

export const REDUCE_TRANSPARENCY_NOTICE =
  'Reduce Transparency is on, so glass shows its fallback color.';

/** Why glass looks flat here. Reduce Transparency wins, since it paints the fallback color on every version. */
export function glassNotice(
  nativeGlass: boolean,
  reduceTransparency: boolean
): string | undefined {
  if (reduceTransparency) return REDUCE_TRANSPARENCY_NOTICE;
  return nativeGlass ? undefined : GLASS_FALLBACK_NOTICE;
}

/** How a selected glass chip shows the accent. The blur fallback dilutes the tint and Reduce Transparency drops it. */
export function chipFill(
  selected: boolean,
  nativeGlass: boolean,
  reduceTransparency: boolean
): 'none' | 'tint' | 'solid' {
  if (!selected) return 'none';
  return nativeGlass && !reduceTransparency ? 'tint' : 'solid';
}
