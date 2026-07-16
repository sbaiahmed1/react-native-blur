// NOTE: the raw `ReactNative*` native components below are the codegen host
// components. They are exported for backwards compatibility only and are
// scheduled for removal in the next major version — prefer the wrapper
// components (BlurView, LiquidGlassView, etc.), which handle platform
// fallbacks, defaults and refs. Rendering a raw iOS-only component on Android
// (or vice versa) produces an "unimplemented component" error.

/**
 * @deprecated Use the {@link BlurView} wrapper instead. Direct use of the raw
 * native component is unsupported and will be removed in the next major version.
 */
export { default as ReactNativeBlurView } from './ReactNativeBlurViewNativeComponent';
export type { BlurType } from './ReactNativeBlurViewNativeComponent';

export { BlurView as default, BlurView } from './BlurView';
export type { BlurViewProps, BlurViewRef } from './BlurView';

/**
 * @deprecated Use the {@link LiquidGlassView} wrapper instead. Direct use of
 * the raw native component is unsupported and will be removed in the next major
 * version.
 */
export { default as ReactNativeLiquidGlassView } from './ReactNativeLiquidGlassViewNativeComponent';
export type { GlassType } from './ReactNativeLiquidGlassViewNativeComponent';

export { LiquidGlassView } from './LiquidGlassView';
export type {
  LiquidGlassViewProps,
  LiquidGlassViewRef,
} from './LiquidGlassView';

/**
 * @deprecated Use the {@link ProgressiveBlurView} wrapper instead. Direct use
 * of the raw native component is unsupported and will be removed in the next
 * major version.
 */
export { default as ReactNativeProgressiveBlurView } from './ReactNativeProgressiveBlurViewNativeComponent';
export type { ProgressiveBlurDirection } from './ReactNativeProgressiveBlurViewNativeComponent';

export { ProgressiveBlurView } from './ProgressiveBlurView';
export type {
  ProgressiveBlurViewProps,
  ProgressiveBlurViewRef,
} from './ProgressiveBlurView';

/**
 * @deprecated Use the {@link LiquidGlassContainer} wrapper instead. Direct use
 * of the raw native component is unsupported and will be removed in the next
 * major version.
 */
export { default as ReactNativeLiquidGlassContainer } from './ReactNativeLiquidGlassContainerNativeComponent';

export { LiquidGlassContainer } from './LiquidGlassContainer';
export type {
  LiquidGlassContainerProps,
  LiquidGlassContainerRef,
} from './LiquidGlassContainer';

/**
 * @deprecated Use the {@link BlurSwitch} wrapper instead. Direct use of the raw
 * native component is unsupported and will be removed in the next major version.
 */
export { default as ReactNativeBlurSwitch } from './ReactNativeBlurSwitchNativeComponent';
export type { ValueChangeEvent } from './ReactNativeBlurSwitchNativeComponent';

export { BlurSwitch } from './BlurSwitch';
export type { BlurSwitchProps } from './BlurSwitch';

/**
 * @deprecated Use the {@link VibrancyView} wrapper instead. Direct use of the
 * raw native component is unsupported and will be removed in the next major
 * version.
 */
export { default as ReactNativeVibrancyView } from './ReactNativeVibrancyViewNativeComponent';
export { VibrancyView } from './VibrancyView';
export type { VibrancyViewProps, VibrancyViewRef } from './VibrancyView';
