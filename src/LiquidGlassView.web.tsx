import React from 'react';
import { StyleSheet, View } from 'react-native';
import type { ViewStyle, StyleProp } from 'react-native';
import type { GlassType } from './ReactNativeLiquidGlassViewNativeComponent';

export interface LiquidGlassViewProps {
  glassType?: GlassType;
  glassTintColor?: string;
  glassOpacity?: number;
  reducedTransparencyFallbackColor?: string;
  isInteractive?: boolean;
  ignoreSafeArea?: boolean;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
}

/**
 * Web implementation of LiquidGlassView.
 *
 * iOS 26+ uses UIGlassContainerEffect for a translucent glass look.
 * On web we approximate this with `backdrop-filter: blur() saturate()`
 * plus a semi-transparent tint colour overlay, producing a glass-like panel.
 */
export const LiquidGlassView: React.FC<LiquidGlassViewProps> = ({
  glassTintColor = 'clear',
  glassOpacity = 1.0,
  style,
  children,
  // Accepted for API compat, unused on web
  glassType: _glassType,
  reducedTransparencyFallbackColor: _fallback,
  isInteractive: _isInteractive,
  ignoreSafeArea: _ignoreSafeArea,
  ...props
}) => {
  const tintColor =
    glassTintColor === 'clear'
      ? `rgba(255, 255, 255, ${0.15 * glassOpacity})`
      : glassTintColor;

  const glassStyle = {
    backgroundColor: tintColor,
    backdropFilter: 'blur(40px) saturate(180%)',
    WebkitBackdropFilter: 'blur(40px) saturate(180%)',
    opacity: glassOpacity,
  };

  return (
    <View style={[styles.container, style]} {...props}>
      <View
        style={[StyleSheet.absoluteFill, glassStyle as Record<string, unknown>]}
      />
      <View style={styles.children}>{children}</View>
    </View>
  );
};

export default LiquidGlassView;

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
