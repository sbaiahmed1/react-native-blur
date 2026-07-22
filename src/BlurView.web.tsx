import React, { forwardRef, memo, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import type { BlurViewProps } from './BlurView';
import { getBlurLayerStyle } from './webBlurUtils';

export type { BlurViewProps } from './BlurView';

/** Ref to the root view of the web blur view. */
export type BlurViewRef = React.ComponentRef<typeof View>;

/**
 * Web implementation of BlurView using CSS `backdrop-filter`.
 *
 * Renders a container with an absolutely-filled layer carrying a
 * `backdrop-filter: blur() saturate()` plus a semi-transparent background tint
 * derived from `blurType`, approximating the native UIVisualEffectView /
 * QmBlurView look. Children render above the blur, sharp, exactly like the
 * native positioning pattern. In browsers without backdrop-filter support (and
 * during server-side rendering) only the tint remains.
 *
 * `blurRounds`, `reducedTransparencyFallbackColor` and `ignoreSafeArea` are
 * native-only and accepted for API compatibility.
 */
const BlurViewComponent = forwardRef<BlurViewRef, BlurViewProps>(
  (
    {
      blurType = 'xlight',
      blurAmount = 10,
      overlayColor,
      style,
      children,
      // Native-only props, accepted for API compatibility
      blurRounds: _blurRounds,
      reducedTransparencyFallbackColor: _reducedTransparencyFallbackColor,
      ignoreSafeArea: _ignoreSafeArea,
      ...props
    },
    ref
  ) => {
    const blurLayerStyle = useMemo(
      () => [
        StyleSheet.absoluteFill,
        styles.layer,
        getBlurLayerStyle(blurType, blurAmount),
      ],
      [blurType, blurAmount]
    );
    const overlayLayerStyle = useMemo(
      () => [
        StyleSheet.absoluteFill,
        styles.layer,
        { backgroundColor: overlayColor },
      ],
      [overlayColor]
    );

    return (
      <View ref={ref} style={[styles.container, style]} {...props}>
        {/* Blur positioned absolutely behind content, tint above it, children
            on top — sibling paint order handles the stacking. */}
        <View style={blurLayerStyle} />
        {overlayColor != null && <View style={overlayLayerStyle} />}
        {children}
      </View>
    );
  }
);

BlurViewComponent.displayName = 'BlurView';

export const BlurView = memo(BlurViewComponent);

export default BlurView;

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
  },
  layer: {
    pointerEvents: 'none',
  },
});
