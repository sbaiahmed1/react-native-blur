import React, { Children } from 'react';
import { StyleSheet, View } from 'react-native';
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
   * @description The direction of the progressive blur gradient
   * - 'blurredTopClearBottom': Blur starts at top, clear at bottom
   * - 'blurredBottomClearTop': Blur starts at bottom, clear at top
   *
   * @default 'blurredTopClearBottom'
   */
  direction?: ProgressiveBlurDirection;

  /**
   * @description The offset where the gradient starts (0.0 to 1.0)
   * 0.0 means the gradient starts immediately
   * 1.0 means the gradient is delayed to the end
   *
   * @default 0.0
   */
  startOffset?: number;

  /**
   * @description Fallback color when reduced transparency is enabled
   *
   * Accepts hex color strings like `#FFFFFF`
   *
   * @default '#FFFFFF'
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
 *
 * @example
 * ```tsx
 * // Blur that fades from bottom (blurred) to top (clear)
 * <ProgressiveBlurView
 *   blurType="dark"
 *   blurAmount={40}
 *   direction="blurredBottomClearTop"
 *   style={{ height: 200 }}
 * >
 *   <Text>Content visible at top, blurred at bottom</Text>
 * </ProgressiveBlurView>
 * ```
 */
export const ProgressiveBlurView: React.FC<ProgressiveBlurViewProps> = ({
  blurType = 'regular',
  blurAmount = 20,
  direction = 'blurredTopClearBottom',
  startOffset = 0.0,
  reducedTransparencyFallbackColor = '#FFFFFF',
  overlayColor,
  style,
  children,
  ...props
}) => {
  const overlay = { backgroundColor: overlayColor };

  // If no children, render the blur view directly (for background use)
  if (!Children.count(children)) {
    return (
      <ReactNativeProgressiveBlurView
        blurType={blurType}
        blurAmount={blurAmount}
        direction={direction}
        startOffset={startOffset}
        reducedTransparencyFallbackColor={reducedTransparencyFallbackColor}
        style={[style, overlay]}
        {...props}
      />
    );
  }

  // If children exist, use the absolute positioning pattern
  return (
    <View style={[styles.container, style, overlay]}>
      {/* Blur effect positioned absolutely behind content */}
      <ReactNativeProgressiveBlurView
        blurType={blurType}
        blurAmount={blurAmount}
        direction={direction}
        startOffset={startOffset}
        reducedTransparencyFallbackColor={reducedTransparencyFallbackColor}
        style={StyleSheet.absoluteFill}
        {...props}
      />

      <View style={styles.children}>{children}</View>
    </View>
  );
};

export default ProgressiveBlurView;

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
  },
  children: {
    position: 'relative',
    zIndex: 1,
  },
});
