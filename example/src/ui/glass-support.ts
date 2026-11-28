import { Platform } from 'react-native';
import { isLiquidGlassAvailable } from '@sbaiahmed1/react-native-blur';

/** Same gate as LiquidGlassView: whether this app renders native glass on this device. */
export const NATIVE_GLASS = isLiquidGlassAvailable();

/** LiquidGlassContainer merges shapes only on iOS. */
export const NATIVE_GLASS_CONTAINER = Platform.OS === 'ios' && NATIVE_GLASS;

export const GLASS_FALLBACK_NOTICE = Platform.select({
  ios: 'Native glass needs iOS 26 and an Xcode 26 build. This preview shows the blur fallback.',
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
