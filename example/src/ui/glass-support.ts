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
