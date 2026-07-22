// Web entry point. Published web bundles reach this file through the
// "browser" condition in package.json's exports; source consumers (like the
// example app) reach the per-component .web.tsx files through Metro's
// platform-extension resolution instead. Every runtime import below names its
// .web module explicitly so the compiled output (which carries exact .js
// specifiers) resolves under any bundler; type-only re-exports from the native
// modules are erased at compile time and pull in no native code.

/**
 * @deprecated Use the {@link BlurView} wrapper instead. Direct use of the raw
 * native component is unsupported and will be removed in the next major
 * version. On web it renders the BlurView web implementation.
 */
export { default as ReactNativeBlurView } from './ReactNativeBlurViewNativeComponent.web';
export type { BlurType } from './ReactNativeBlurViewNativeComponent';

export { BlurView as default, BlurView } from './BlurView.web';
export type { BlurViewProps, BlurViewRef } from './BlurView.web';

/**
 * @deprecated Use the {@link LiquidGlassView} wrapper instead. Direct use of
 * the raw native component is unsupported and will be removed in the next
 * major version. On web it renders the LiquidGlassView web implementation.
 */
export { default as ReactNativeLiquidGlassView } from './ReactNativeLiquidGlassViewNativeComponent.web';
export type { GlassType } from './ReactNativeLiquidGlassViewNativeComponent';

export { LiquidGlassView } from './LiquidGlassView.web';
export type {
  LiquidGlassViewProps,
  LiquidGlassViewRef,
} from './LiquidGlassView.web';

/**
 * @deprecated Use the {@link ProgressiveBlurView} wrapper instead. Direct use
 * of the raw native component is unsupported and will be removed in the next
 * major version. On web it renders the ProgressiveBlurView web implementation.
 */
export { default as ReactNativeProgressiveBlurView } from './ReactNativeProgressiveBlurViewNativeComponent.web';
export type { ProgressiveBlurDirection } from './ReactNativeProgressiveBlurViewNativeComponent';

export { ProgressiveBlurView } from './ProgressiveBlurView.web';
export type {
  ProgressiveBlurViewProps,
  ProgressiveBlurViewRef,
} from './ProgressiveBlurView.web';

/**
 * @deprecated Use the {@link LiquidGlassContainer} wrapper instead. Direct use
 * of the raw native component is unsupported and will be removed in the next
 * major version. On web it renders the LiquidGlassContainer web
 * implementation.
 */
export { default as ReactNativeLiquidGlassContainer } from './ReactNativeLiquidGlassContainerNativeComponent.web';

export { LiquidGlassContainer } from './LiquidGlassContainer.web';
export type {
  LiquidGlassContainerProps,
  LiquidGlassContainerRef,
} from './LiquidGlassContainer.web';

/**
 * @deprecated Use the {@link BlurSwitch} wrapper instead. Direct use of the
 * raw native component is unsupported and will be removed in the next major
 * version. On web it renders the BlurSwitch web implementation.
 */
export { default as ReactNativeBlurSwitch } from './ReactNativeBlurSwitchNativeComponent.web';
export type { ValueChangeEvent } from './ReactNativeBlurSwitchNativeComponent';

export { BlurSwitch } from './BlurSwitch.web';
export type { BlurSwitchProps } from './BlurSwitch.web';

/**
 * @deprecated Use the {@link VibrancyView} wrapper instead. Direct use of the
 * raw native component is unsupported and will be removed in the next major
 * version. On web it renders the VibrancyView web implementation.
 */
export { default as ReactNativeVibrancyView } from './ReactNativeVibrancyViewNativeComponent.web';
export { VibrancyView } from './VibrancyView.web';
export type { VibrancyViewProps, VibrancyViewRef } from './VibrancyView.web';
