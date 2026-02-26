import React from 'react';
import { StyleSheet, View } from 'react-native';
import type { ViewStyle, StyleProp } from 'react-native';
import type { GlassType } from './ReactNativeLiquidGlassViewNativeComponent';

export interface LiquidGlassViewProps {
  /**
   * The type of glass effect to apply
   * Platform: iOS 26+ only
   *
   * @platform ios
   *
   * @default 'clear'
   */
  glassType?: GlassType;

  /**
   * The tint color of the glass effect
   * Accepts hex color strings like '#FFFFFF' or color names
   * Platform: iOS 26+ only
   *
   * @platform ios
   *
   * @default 'clear'
   */
  glassTintColor?: string;

  /**
   * The opacity of the glass effect (0-1)
   * Platform: iOS 26+ only
   *
   * @platform ios
   *
   * @default 1.0
   */
  glassOpacity?: number;

  /**
   * Fallback color when reduced transparency is enabled or on older iOS versions
   * Accepts hex color strings like '#FFFFFF'
   * Platform: iOS only
   *
   * @platform ios
   *
   * @default '#FFFFFF'
   */
  reducedTransparencyFallbackColor?: string;

  /**
   * Whether the glass view should be interactive
   * Platform: iOS 26+ only
   *
   * @platform ios
   *
   * @default true
   */
  isInteractive?: boolean;

  /**
   * Whether the glass view should ignore safe area insets
   * Platform: iOS 26+ only
   *
   * @platform ios
   *
   * @default false
   */
  ignoreSafeArea?: boolean;

  /**
   * Style object for the liquid glass view
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
 * Web implementation of LiquidGlassView.
 *
 * iOS 26+ uses UIGlassContainerEffect for a translucent glass look.
 * On web we approximate this with `backdrop-filter: blur() saturate()`
 * plus a semi-transparent tint colour overlay, producing a glass-like panel.
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

  const glassStyle: Record<string, unknown> = {
    backgroundColor: tintColor,
    backdropFilter: 'blur(40px) saturate(180%)',
    WebkitBackdropFilter: 'blur(40px) saturate(180%)',
    opacity: glassOpacity,
  };

  return (
    <View style={[styles.container, style]} {...props}>
      <View style={[StyleSheet.absoluteFill, glassStyle]} />
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
