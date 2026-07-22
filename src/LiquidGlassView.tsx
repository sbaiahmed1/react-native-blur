import React, { forwardRef, memo, useMemo } from 'react';
import { Platform } from 'react-native';
import type { ViewStyle, StyleProp } from 'react-native';
import ReactNativeLiquidGlassView, {
  type GlassType,
} from './ReactNativeLiquidGlassViewNativeComponent';
import BlurView from './BlurView';
import { FALLBACK_BLUR_AMOUNT, getFallbackOverlayColor } from './colorUtils';

// Re-exported for back-compat: the helper lived here before it moved to the
// platform-neutral colorUtils module (shared with the web implementation).
export { getFallbackOverlayColor };

export interface LiquidGlassViewProps {
  /**
   * @description The type of glass effect to apply
   *
   * @default 'clear'
   *
   * @platform iOS 26+
   */
  glassType?: GlassType;

  /**
   * @description The tint color of the glass effect. Accepts hex color strings
   * like '#FFFFFF' or color names
   *
   * @default 'clear'
   *
   * @platform iOS 26+
   */
  glassTintColor?: string;

  /**
   * @description The opacity of the glass effect (0-1)
   *
   * @default 1.0
   *
   * @platform iOS 26+
   */
  glassOpacity?: number;

  /**
   * @description Fallback color when reduced transparency is enabled or on
   * older iOS versions
   *
   * @default '#FFFFFF'
   *
   * @platform iOS
   */
  reducedTransparencyFallbackColor?: string;

  /**
   * @description Whether the glass view should be interactive
   *
   * @default true
   *
   * @platform iOS
   */
  isInteractive?: boolean;

  /**
   * @description Whether the glass view should ignore safe area insets
   *
   * @default true
   *
   * @platform iOS
   */
  ignoreSafeArea?: boolean;

  /**
   * @description Style object for the liquid glass view
   *
   * @default undefined
   */
  style?: StyleProp<ViewStyle>;

  /**
   * Child components to render inside the liquid glass view
   *
   * @default undefined
   */
  children?: React.ReactNode;
}

/**
 * A Liquid Glass view component that provides iOS 26+ glass effects.
 *
 * This component uses the new UIKit glass effect API available on iOS 26+.
 * On older iOS versions or when reduced transparency is enabled, it falls back
 * to a solid color background.
 *
 * **Platform Support:**
 * - iOS 26+: Native glass effect with full functionality
 * - iOS < 26 or Android: Fallback to reducedTransparencyFallbackColor
 *
 * This component automatically handles the proper positioning pattern where the glass
 * effect is positioned absolutely behind the content, ensuring interactive elements
 * work correctly.
 *
 * @example
 * ```tsx
 * import { LiquidGlassView } from '@sbaiahmed1/react-native-blur';
 *
 * <LiquidGlassView
 *   glassType="clear"
 *   glassTintColor="#007AFF"
 *   glassOpacity={0.8}
 *   style={{ flex: 1 }}
 * >
 *   <Text>Content on top of liquid glass</Text>
 *   <Button title="Interactive Button" onPress={() => {}} />
 * </LiquidGlassView>
 * ```
 *
 * @platform ios
 */
/**
 * Ref to the underlying native liquid glass view. On the fallback path
 * (Android or iOS < 26, which render a BlurView) the ref is not attached.
 */
export type LiquidGlassViewRef = React.ComponentRef<
  typeof ReactNativeLiquidGlassView
>;

const LiquidGlassViewComponent = forwardRef<
  LiquidGlassViewRef,
  LiquidGlassViewProps
>(
  (
    {
      glassType = 'clear',
      glassTintColor = 'clear',
      glassOpacity = 1.0,
      reducedTransparencyFallbackColor = '#FFFFFF',
      isInteractive = true,
      ignoreSafeArea = true,
      style,
      children,
      ...props
    },
    ref
  ) => {
    const isIos = Platform.OS === 'ios';
    const fallbackOverlayColor = useMemo(
      () => getFallbackOverlayColor(glassTintColor, glassOpacity),
      [glassTintColor, glassOpacity]
    );

    // On Android and iOS < 26 the native glass API is unavailable, so we fall
    // back to a strong, lightly-tinted blur that approximates liquid glass.
    if (
      !isIos ||
      (isIos && Number.parseInt(String(Platform.Version), 10) < 26)
    ) {
      return (
        <BlurView
          // "regular" is a subtle (~14% white) overlay. The default "xlight" is
          // ~55% opaque and would make the fallback look like a solid panel.
          blurType="regular"
          blurAmount={FALLBACK_BLUR_AMOUNT}
          overlayColor={fallbackOverlayColor}
          reducedTransparencyFallbackColor={reducedTransparencyFallbackColor}
          ignoreSafeArea={ignoreSafeArea}
          style={style}
        >
          {children}
        </BlurView>
      );
    }

    // If children exist, use the absolute positioning pattern
    return (
      <ReactNativeLiquidGlassView
        ref={ref}
        glassType={glassType}
        glassTintColor={glassTintColor}
        glassOpacity={glassOpacity}
        reducedTransparencyFallbackColor={reducedTransparencyFallbackColor}
        isInteractive={isInteractive}
        ignoreSafeArea={ignoreSafeArea}
        style={style}
        {...props}
      >
        {children}
      </ReactNativeLiquidGlassView>
    );
  }
);

LiquidGlassViewComponent.displayName = 'LiquidGlassView';

export const LiquidGlassView = memo(LiquidGlassViewComponent);

export default LiquidGlassView;
