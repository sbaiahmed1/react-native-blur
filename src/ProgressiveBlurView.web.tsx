import React, { Children } from 'react';
import { StyleSheet, View } from 'react-native';
import type { ViewStyle, StyleProp, ColorValue } from 'react-native';
import type { BlurType } from './ReactNativeBlurViewNativeComponent';
import type { ProgressiveBlurDirection } from './ReactNativeProgressiveBlurViewNativeComponent';

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
   * - 'blurredCenterClearTopAndBottom': Blur peaks at center, clear at both edges
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
   * @platform ios
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
 * Maps native blur types to semi-transparent CSS background colours.
 */
const BLUR_TYPE_TO_BACKGROUND: Record<BlurType, string> = {
  xlight: 'rgba(255, 255, 255, 0.6)',
  light: 'rgba(255, 255, 255, 0.4)',
  dark: 'rgba(0, 0, 0, 0.5)',
  extraDark: 'rgba(0, 0, 0, 0.75)',
  regular: 'rgba(255, 255, 255, 0.2)',
  prominent: 'rgba(255, 255, 255, 0.35)',
  systemUltraThinMaterial: 'rgba(255, 255, 255, 0.1)',
  systemThinMaterial: 'rgba(255, 255, 255, 0.2)',
  systemMaterial: 'rgba(255, 255, 255, 0.3)',
  systemThickMaterial: 'rgba(255, 255, 255, 0.45)',
  systemChromeMaterial: 'rgba(255, 255, 255, 0.5)',
  systemUltraThinMaterialLight: 'rgba(255, 255, 255, 0.15)',
  systemThinMaterialLight: 'rgba(255, 255, 255, 0.25)',
  systemMaterialLight: 'rgba(255, 255, 255, 0.4)',
  systemThickMaterialLight: 'rgba(255, 255, 255, 0.55)',
  systemChromeMaterialLight: 'rgba(255, 255, 255, 0.6)',
  systemUltraThinMaterialDark: 'rgba(0, 0, 0, 0.2)',
  systemThinMaterialDark: 'rgba(0, 0, 0, 0.3)',
  systemMaterialDark: 'rgba(0, 0, 0, 0.45)',
  systemThickMaterialDark: 'rgba(0, 0, 0, 0.6)',
  systemChromeMaterialDark: 'rgba(0, 0, 0, 0.7)',
};

/**
 * Returns a CSS mask-image gradient string for the given progressive blur
 * direction. The opaque part of the mask reveals the full blur; transparent
 * areas show no blur.
 */
const getMaskGradient = (
  direction: ProgressiveBlurDirection,
  startOffset: number
): string => {
  const start = `${Math.round(startOffset * 100)}%`;
  const end = `${100 - Math.round(startOffset * 100)}%`;

  switch (direction) {
    case 'blurredTopClearBottom':
      return `linear-gradient(to bottom, black ${start}, transparent 100%)`;
    case 'blurredBottomClearTop':
      return `linear-gradient(to top, black ${start}, transparent 100%)`;
    case 'blurredCenterClearTopAndBottom':
      return `linear-gradient(to bottom, transparent 0%, black ${start}, black ${end}, transparent 100%)`;
  }
};

/**
 * Web implementation of ProgressiveBlurView using CSS `backdrop-filter`
 * combined with CSS `mask-image` to create a gradient blur effect.
 *
 * The mask controls where the blur is visible:
 * - Opaque areas of the mask reveal the full blur
 * - Transparent areas show no blur
 *
 * This approximates the native iOS/Android gradient blur behavior.
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
  overlayColor,
  style,
  children,
  // Accepted for API compat, unused on web
  reducedTransparencyFallbackColor: _fallback,
  ...props
}) => {
  const blurPx = Math.min(Math.max(blurAmount, 0), 100);
  const tint =
    BLUR_TYPE_TO_BACKGROUND[blurType] ?? BLUR_TYPE_TO_BACKGROUND.regular;
  const overlay = overlayColor ? { backgroundColor: overlayColor } : undefined;
  const maskGradient = getMaskGradient(direction, startOffset);

  const blurStyle: Record<string, unknown> = {
    zIndex: 1,
    backgroundColor: tint,
    backdropFilter: `blur(${blurPx}px)`,
    WebkitBackdropFilter: `blur(${blurPx}px)`,
    maskImage: maskGradient,
    WebkitMaskImage: maskGradient,
  };

  if (!Children.count(children)) {
    return <View style={[style, overlay, blurStyle]} {...props} />;
  }

  return (
    <View style={[styles.container, style, overlay]} {...props}>
      <View style={[StyleSheet.absoluteFill, blurStyle]} />
      {children}
    </View>
  );
};

export default ProgressiveBlurView;

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
  },
});
