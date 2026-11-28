import { Platform } from 'react-native';

type NativeBlur = { getConstants: jest.Mock } | null;

const osDescriptor = Object.getOwnPropertyDescriptor(Platform, 'OS')!;
const versionDescriptor = Object.getOwnPropertyDescriptor(Platform, 'Version')!;

// Swaps the Platform that react-native's lazy getter returns at call time, and loads platformSupport fresh since it caches the iOS constant.
function load(
  os: 'ios' | 'android',
  version: number | string,
  native: NativeBlur
): () => boolean {
  Object.defineProperty(Platform, 'OS', {
    value: os,
    configurable: true,
    writable: true,
  });
  Object.defineProperty(Platform, 'Version', {
    value: version,
    configurable: true,
  });
  let isLiquidGlassAvailable!: () => boolean;
  jest.isolateModules(() => {
    jest.doMock('../NativeReactNativeBlur', () => ({
      __esModule: true,
      default: native,
    }));
    ({ isLiquidGlassAvailable } = require('../platformSupport'));
  });
  return isLiquidGlassAvailable;
}

function nativeWith(isLiquidGlassAvailable: boolean) {
  return { getConstants: jest.fn(() => ({ isLiquidGlassAvailable })) };
}

describe('isLiquidGlassAvailable', () => {
  let warn: jest.SpyInstance;

  beforeEach(() => {
    warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    warn.mockRestore();
    Object.defineProperty(Platform, 'OS', osDescriptor);
    Object.defineProperty(Platform, 'Version', versionDescriptor);
  });

  it('reads the native constant on iOS', () => {
    expect(load('ios', '26.0', nativeWith(false))()).toBe(false);
    expect(load('ios', '18.0', nativeWith(true))()).toBe(true);
  });

  it('falls back to the version check when the module is missing', () => {
    const available = load('ios', '26.0', null);
    expect(available()).toBe(true);
    expect(available()).toBe(true);
    expect(warn).toHaveBeenCalledTimes(1);
    expect(load('ios', '18.0', null)()).toBe(false);
  });

  it('uses API 33 on Android', () => {
    expect(load('android', 32, nativeWith(true))()).toBe(false);
    expect(load('android', 33, nativeWith(false))()).toBe(true);
  });

  it('reads the constant once', () => {
    const native = nativeWith(true);
    const available = load('ios', '26.0', native);
    available();
    available();
    expect(native.getConstants).toHaveBeenCalledTimes(1);
  });

  it('returns false on web', () => {
    const { isLiquidGlassAvailable } = require('../platformSupport.web');
    expect(isLiquidGlassAvailable()).toBe(false);
  });
});
