import { Platform } from 'react-native';

import NativeReactNativeBlur, { type Spec } from './NativeReactNativeBlur';

let iosConstants: ReturnType<Spec['getConstants']> | null | undefined;

function majorVersion(): number {
  return Number.parseInt(String(Platform.Version), 10);
}

function readIosConstants(): ReturnType<Spec['getConstants']> | null {
  if (iosConstants === undefined) {
    iosConstants = NativeReactNativeBlur?.getConstants() ?? null;
    if (!iosConstants && __DEV__) {
      console.warn(
        '[react-native-blur] The native module is missing, so Liquid Glass support is read from the iOS version and usesPrivateIOSApi() returns true. Rebuild the app.'
      );
    }
  }
  return iosConstants;
}

/**
 * Whether LiquidGlassView renders native glass on this device. On iOS it is
 * what the app really renders: iOS 26 or later, built with Xcode 26 or later,
 * and not opted out of the new design. On Android it needs Android 13 (API 33).
 */
export function isLiquidGlassAvailable(): boolean {
  if (Platform.OS === 'android') return majorVersion() >= 33;
  if (Platform.OS !== 'ios') return false;
  return readIosConstants()?.isLiquidGlassAvailable ?? majorVersion() >= 26;
}

/**
 * Whether this iOS build contains Apple's private variable blur API, which
 * ProgressiveBlurView uses by default. It is false when the app was built with
 * `REACT_NATIVE_BLUR_NO_PRIVATE_API`, and on Android and web.
 */
export function usesPrivateIOSApi(): boolean {
  if (Platform.OS !== 'ios') return false;
  return readIosConstants()?.usesPrivateIOSApi ?? true;
}
