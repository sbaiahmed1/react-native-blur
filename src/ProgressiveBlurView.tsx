import React, { Children, forwardRef, memo, useMemo } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import type { ViewStyle, StyleProp, ColorValue, ViewProps } from 'react-native';
import ReactNativeProgressiveBlurView, {
  type BlurType,
  type ProgressiveBlurDirection,
} from './ReactNativeProgressiveBlurViewNativeComponent';
import { materialFor } from './materials';
import { useMaterialScheme } from './useMaterialScheme';

export interface ProgressiveBlurViewProps extends ViewProps {
  /**
   * @description The type of blur effect to apply
   *
   * @default 'regular'
   */
  blurType?: BlurType;

  /**
   * @description The blur radius in points at the most blurred part of the
   * gradient. Android 12 and later blur as strongly as iOS at the same value.
   * Android 11 and earlier blur less at most amounts.
   *
   * @default 20
   */
  blurAmount?: number;

  /**
   * @description Sets how many blur passes QmBlurView runs, for a smoother
   * blur (1-15). Applies on Android 11 and earlier. Android 12 and later use
   * a Gaussian blur and ignore it.
   *
   * @default 5
   *
   * @platform Android
   */
  blurRounds?: number;

  /**
   * @description The direction of the progressive blur gradient
   * - 'blurredTopClearBottom': Blur starts at top, clear at bottom
   * - 'blurredBottomClearTop': Blur starts at bottom, clear at top
   * - 'blurredCenterClearTopAndBottom': Blur peaks at center, clear at both edges
   * - 'blurredLeftToClearRight': Blur starts at left, clear at right
   * - 'blurredRightToClearLeft': Blur starts at right, clear at left
   * - 'blurredTopAndBottomClearCenter': Blur at the top and bottom edges, clear in the middle
   *
   * @default 'blurredTopClearBottom'
   */
  direction?: ProgressiveBlurDirection;

  /**
   * @description Plateau size (0.0 to 1.0) reserved before the fade begins,
   * with the same meaning on all platforms. For edge directions it grows the
   * fully-blurred zone from the blurred edge; 0.0 spreads the fade across the
   * whole view. For the center direction the fade always occupies fixed ~20%
   * bands at the clear edges around a blurred center plateau; startOffset
   * insets where those bands start (clamped to 0.3), so 0.0 keeps them at the
   * very edges rather than spreading the fade. For the top and bottom
   * direction it sets the fully-blurred band at each edge (clamped to 0.3),
   * and a ~20% fade toward the clear middle follows it
   *
   * @default 0.0
   */
  startOffset?: number;

  /**
   * @description Fallback color when reduced transparency is enabled
   *
   * @default '#FFFFFF'
   *
   * @platform iOS
   */
  reducedTransparencyFallbackColor?: ColorValue;

  /**
   * @description The overlay color to apply on top of the blur effect
   *
   * @default undefined
   */
  overlayColor?: ColorValue;

  /**
   * @description style object for the progressive blur view
   *
   * @default undefined
   */
  style?: StyleProp<ViewStyle>;

  /**
   * @description Child components to render inside the progressive blur view
   *
   * @default undefined
   */
  children?: React.ReactNode;
}

/** Ref to the underlying native progressive blur view. */
export type ProgressiveBlurViewRef = React.ComponentRef<
  typeof ReactNativeProgressiveBlurView
>;

/**
 * A progressive blur view component that provides variable/gradient blur effects.
 *
 * This component applies a blur effect that gradually changes intensity across the view,
 * creating a smooth gradient from fully blurred to clear (or vice versa).
 *
 * **Platform Support:**
 * - iOS: Full support using private Core Animation filters
 * - Android 12 and later: ramps the blur radius on the GPU, as strong as iOS
 * - Android 11 and earlier: QmBlurView fades one blur out with a gradient mask
 *
 * This component uses the same positioning pattern as BlurView where the blur
 * effect is positioned absolutely behind the content.
 *
 * A forwarded ref resolves to the underlying native progressive blur view.
 *
 * @example
 * ```tsx
 * // Blur that fades from top (blurred) to bottom (clear)
 * <ProgressiveBlurView
 *   blurType="light"
 *   blurAmount={30}
 *   direction="blurredTopClearBottom"
 *   startOffset={0.2}
 *   style={{ height: 200 }}
 * >
 *   <Text>Content on top of progressive blur</Text>
 * </ProgressiveBlurView>
 * ```
 */
const ProgressiveBlurViewComponent = forwardRef<
  ProgressiveBlurViewRef,
  ProgressiveBlurViewProps
>(
  (
    {
      blurType = 'regular',
      blurAmount = 20,
      blurRounds = 5,
      direction = 'blurredTopClearBottom',
      startOffset = 0.0,
      reducedTransparencyFallbackColor = '#FFFFFF',
      overlayColor,
      style,
      children,
      ...props
    },
    ref
  ) => {
    const overlay = useMemo(
      () => ({ backgroundColor: overlayColor }),
      [overlayColor]
    );
    const material = materialFor(blurType, useMaterialScheme());
    const materialProps = useMemo(
      () => ({
        materialTint: material.tint,
        materialSaturation: material.saturation,
        materialRadius: material.radius,
      }),
      [material]
    );

    // If no children, render the blur view directly (for background use)
    if (!Children.count(children)) {
      return (
        <ReactNativeProgressiveBlurView
          ref={ref}
          blurType={blurType}
          blurAmount={blurAmount}
          blurRounds={blurRounds}
          direction={direction}
          startOffset={startOffset}
          reducedTransparencyFallbackColor={reducedTransparencyFallbackColor}
          {...materialProps}
          style={[style, overlay]}
          {...props}
        />
      );
    }

    // On Android the children must live INSIDE the native view: the blur
    // captures the screen content behind it, and children hoisted as siblings
    // get baked into that captured backdrop as a blurred ghost copy under
    // their sharp selves. The native view draws direct children unmasked on
    // top of the effect and excludes its whole subtree from captures.
    if (Platform.OS === 'android') {
      return (
        <ReactNativeProgressiveBlurView
          ref={ref}
          blurType={blurType}
          blurAmount={blurAmount}
          blurRounds={blurRounds}
          direction={direction}
          startOffset={startOffset}
          reducedTransparencyFallbackColor={reducedTransparencyFallbackColor}
          {...materialProps}
          style={[styles.container, style, overlay]}
          {...props}
        >
          {children}
        </ReactNativeProgressiveBlurView>
      );
    }

    // If children exist, use the absolute positioning pattern
    return (
      <View style={[styles.container, style, overlay]}>
        {/* Blur effect positioned absolutely behind content */}
        <ReactNativeProgressiveBlurView
          ref={ref}
          blurType={blurType}
          blurAmount={blurAmount}
          blurRounds={blurRounds}
          direction={direction}
          startOffset={startOffset}
          reducedTransparencyFallbackColor={reducedTransparencyFallbackColor}
          {...materialProps}
          style={StyleSheet.absoluteFill}
          {...props}
        />

        {children}
      </View>
    );
  }
);

ProgressiveBlurViewComponent.displayName = 'ProgressiveBlurView';

export const ProgressiveBlurView: React.NamedExoticComponent<
  ProgressiveBlurViewProps & React.RefAttributes<ProgressiveBlurViewRef>
> = memo(ProgressiveBlurViewComponent);

export default ProgressiveBlurView;

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
  },
});
