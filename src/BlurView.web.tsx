import React, { Children } from 'react';
import { StyleSheet, View } from 'react-native';
import type { ViewStyle, StyleProp, ColorValue } from 'react-native';
import type { BlurType } from './ReactNativeBlurViewNativeComponent';

export interface BlurViewProps {
  blurType?: BlurType;
  blurAmount?: number;
  reducedTransparencyFallbackColor?: string;
  overlayColor?: ColorValue;
  style?: StyleProp<ViewStyle>;
  ignoreSafeArea?: boolean;
  children?: React.ReactNode;
}

/**
 * Maps native blur types to semi-transparent CSS background colours.
 *
 * The colours approximate the visual tint each blur type produces on iOS:
 * - Light variants use white-based overlays
 * - Dark variants use black-based overlays
 * - Material variants match the iOS system material hierarchy
 */
const blurTypeToBackground: Record<BlurType, string> = {
  // Base types
  xlight: 'rgba(255, 255, 255, 0.6)',
  light: 'rgba(255, 255, 255, 0.4)',
  dark: 'rgba(0, 0, 0, 0.5)',
  extraDark: 'rgba(0, 0, 0, 0.75)',
  regular: 'rgba(255, 255, 255, 0.2)',
  prominent: 'rgba(255, 255, 255, 0.35)',

  // System materials (default / adaptive)
  systemUltraThinMaterial: 'rgba(255, 255, 255, 0.1)',
  systemThinMaterial: 'rgba(255, 255, 255, 0.2)',
  systemMaterial: 'rgba(255, 255, 255, 0.3)',
  systemThickMaterial: 'rgba(255, 255, 255, 0.45)',
  systemChromeMaterial: 'rgba(255, 255, 255, 0.5)',

  // System materials (light)
  systemUltraThinMaterialLight: 'rgba(255, 255, 255, 0.15)',
  systemThinMaterialLight: 'rgba(255, 255, 255, 0.25)',
  systemMaterialLight: 'rgba(255, 255, 255, 0.4)',
  systemThickMaterialLight: 'rgba(255, 255, 255, 0.55)',
  systemChromeMaterialLight: 'rgba(255, 255, 255, 0.6)',

  // System materials (dark)
  systemUltraThinMaterialDark: 'rgba(0, 0, 0, 0.2)',
  systemThinMaterialDark: 'rgba(0, 0, 0, 0.3)',
  systemMaterialDark: 'rgba(0, 0, 0, 0.45)',
  systemThickMaterialDark: 'rgba(0, 0, 0, 0.6)',
  systemChromeMaterialDark: 'rgba(0, 0, 0, 0.7)',
};

/**
 * Web implementation of BlurView using CSS `backdrop-filter`.
 *
 * Renders a `<View>` with `backdrop-filter: blur(Npx)` and a semi-transparent
 * background tint derived from `blurType`. This closely approximates the native
 * iOS UIVisualEffectView and Android QmBlurView behaviour in modern browsers.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/backdrop-filter
 */
export const BlurView: React.FC<BlurViewProps> = ({
  blurType = 'xlight',
  blurAmount = 10,
  overlayColor,
  style,
  children,
  // Accepted for API compat, unused on web
  reducedTransparencyFallbackColor: _fallback,
  ignoreSafeArea: _ignoreSafeArea,
  ...props
}) => {
  const blurPx = Math.min(Math.max(blurAmount, 0), 100);
  const tint = blurTypeToBackground[blurType] ?? blurTypeToBackground.xlight;
  const overlay = overlayColor ? { backgroundColor: overlayColor } : undefined;

  const blurStyle = {
    backgroundColor: tint,
    backdropFilter: `blur(${blurPx}px)`,
    WebkitBackdropFilter: `blur(${blurPx}px)`,
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
      <View style={styles.children}>{children}</View>
    </View>
  );
};

export default BlurView;

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
