import React, { forwardRef, memo, useMemo } from 'react';
import { View } from 'react-native';
import type { LiquidGlassViewProps } from './LiquidGlassView';
import BlurView from './BlurView.web';
import { FALLBACK_BLUR_AMOUNT, getFallbackOverlayColor } from './colorUtils';

export type { LiquidGlassViewProps } from './LiquidGlassView';

// Re-exported here as well so the module mirrors ./LiquidGlassView on web.
export { getFallbackOverlayColor };

/** Ref to the root view of the web liquid glass view. */
export type LiquidGlassViewRef = React.ComponentRef<typeof View>;

/**
 * Web implementation of LiquidGlassView.
 *
 * The iOS 26+ UIGlassEffect has no web equivalent, so this renders the same
 * enhanced-blur fallback the native component uses on Android and older iOS:
 * a strong BlurView with the glass tint scaled down to a subtle overlay.
 *
 * `glassType`, `isInteractive`, `ignoreSafeArea` and
 * `reducedTransparencyFallbackColor` are native-only and accepted for API
 * compatibility.
 */
const LiquidGlassViewComponent = forwardRef<
  LiquidGlassViewRef,
  LiquidGlassViewProps
>(
  (
    {
      glassTintColor = 'clear',
      glassOpacity = 1.0,
      style,
      children,
      // Native-only props, accepted for API compatibility
      glassType: _glassType,
      reducedTransparencyFallbackColor: _reducedTransparencyFallbackColor,
      isInteractive: _isInteractive,
      ignoreSafeArea: _ignoreSafeArea,
      ...props
    },
    ref
  ) => {
    const fallbackOverlayColor = useMemo(
      () => getFallbackOverlayColor(glassTintColor, glassOpacity),
      [glassTintColor, glassOpacity]
    );

    return (
      <BlurView
        ref={ref}
        // "regular" is a subtle (~14% white) overlay. The default "xlight" is
        // ~55% opaque and would make the glass look like a solid panel.
        blurType="regular"
        blurAmount={FALLBACK_BLUR_AMOUNT}
        overlayColor={fallbackOverlayColor}
        style={style}
        {...props}
      >
        {children}
      </BlurView>
    );
  }
);

LiquidGlassViewComponent.displayName = 'LiquidGlassView';

export const LiquidGlassView = memo(LiquidGlassViewComponent);

export default LiquidGlassView;
