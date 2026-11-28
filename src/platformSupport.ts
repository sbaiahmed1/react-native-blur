import { Platform } from 'react-native';

import NativeReactNativeBlur from './NativeReactNativeBlur';

let iosLiquidGlass: boolean | undefined;

function majorVersion(): number {
  return Number.parseInt(String(Platform.Version), 10);
}

function readIosLiquidGlass(): boolean {
  const constants = NativeReactNativeBlur?.getConstants();
  if (constants) return constants.isLiquidGlassAvailable;
  if (__DEV__) {
    console.warn(
      '[react-native-blur] The native module is missing, so Liquid Glass support is read from the iOS version. Rebuild the app.'
    );
  }
  return majorVersion() >= 26;
}

/**
 * Whether LiquidGlassView renders native glass on this device. On iOS it is
 * what the app really renders: iOS 26 or later, built with Xcode 26 or later,
 * and not opted out of the new design. On Android it needs Android 13 (API 33).
 */
export function isLiquidGlassAvailable(): boolean {
  if (Platform.OS === 'android') return majorVersion() >= 33;
  if (Platform.OS !== 'ios') return false;
  if (iosLiquidGlass === undefined) iosLiquidGlass = readIosLiquidGlass();
  return iosLiquidGlass;
}
