import React, { Children, forwardRef, memo, useMemo } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import type { ViewStyle, StyleProp, ColorValue } from 'react-native';
import ReactNativeProgressiveBlurView, {
  type BlurType,
  type ProgressiveBlurDirection,
} from './ReactNativeProgressiveBlurViewNativeComponent';

export interface ProgressiveBlurViewProps {
  /**
   * @description The type of blur effect to apply
   *
   * @default 'regular'
   */
  blurType?: BlurType;

  /**
   * @description The maximum intensity of the blur effect (in pixels)
   * This is the blur radius at the most blurred part of the gradient
   *
   * @default 20
   */
  blurAmount?: number;

  /**
   * @description The number of blur interactions to perform for a smoother
   * effect (1-15)
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
   * very edges rather than spreading the fade
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
  reducedTransparencyFallbackColor?: string;

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
 * - Android: Supported using QmBlurView's ProgressiveBlurView
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
          style={StyleSheet.absoluteFill}
          {...props}
        />

        {children}
      </View>
    );
  }
);

ProgressiveBlurViewComponent.displayName = 'ProgressiveBlurView';

export const ProgressiveBlurView = memo(ProgressiveBlurViewComponent);

export default ProgressiveBlurView;

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
  },
});
