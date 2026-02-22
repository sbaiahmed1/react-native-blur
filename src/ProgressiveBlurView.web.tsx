import React, { Children } from 'react';
import { StyleSheet, View } from 'react-native';
import type { ViewStyle, StyleProp, ColorValue } from 'react-native';
import type { BlurType } from './ReactNativeBlurViewNativeComponent';
import type { ProgressiveBlurDirection } from './ReactNativeProgressiveBlurViewNativeComponent';

export interface ProgressiveBlurViewProps {
  blurType?: BlurType;
  blurAmount?: number;
  direction?: ProgressiveBlurDirection;
  startOffset?: number;
  reducedTransparencyFallbackColor?: string;
  overlayColor?: ColorValue;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
}

/**
 * Maps native blur types to semi-transparent CSS background colours.
 */
const blurTypeToBackground: Record<BlurType, string> = {
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
 * This approximates the native iOS/Android gradient blur behaviour.
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
  const tint = blurTypeToBackground[blurType] ?? blurTypeToBackground.regular;
  const overlay = overlayColor ? { backgroundColor: overlayColor } : undefined;
  const maskGradient = getMaskGradient(direction, startOffset);

  const blurStyle = {
    backgroundColor: tint,
    backdropFilter: `blur(${blurPx}px)`,
    WebkitBackdropFilter: `blur(${blurPx}px)`,
    maskImage: maskGradient,
    WebkitMaskImage: maskGradient,
  };

  if (!Children.count(children)) {
    return (
      <View
        style={[style, overlay, blurStyle as Record<string, unknown>]}
        {...props}
      />
    );
  }

  return (
    <View style={[styles.container, style, overlay]} {...props}>
      <View
        style={[
          StyleSheet.absoluteFill,
          blurStyle as Record<string, unknown>,
        ]}
      />
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
