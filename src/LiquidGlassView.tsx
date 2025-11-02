import React from 'react';
import { View, Platform } from 'react-native';
import type { ViewStyle, StyleProp } from 'react-native';
import ReactNativeLiquidGlassView, {
  type GlassType,
} from './ReactNativeLiquidGlassViewNativeComponent';

export interface LiquidGlassViewProps {
  /**
   * The border radius of the glass effect
   * Platform: iOS 26+ only
   * @default 0
   */
  borderRadius?: number;
  /**
   * The type of glass effect to apply
   * Platform: iOS 26+ only
   * @default 'clear'
   */
  glassType?: GlassType;

  /**
   * The tint color of the glass effect
   * Accepts hex color strings like '#FFFFFF' or color names
   * Platform: iOS 26+ only
   * @default 'clear'
   */
  glassTintColor?: string;

  /**
   * The opacity of the glass effect (0-1)
   * Platform: iOS 26+ only
   * @default 1.0
   */
  glassOpacity?: number;

  /**
   * Fallback color when reduced transparency is enabled or on older iOS versions
   * Accepts hex color strings like '#FFFFFF'
   * Platform: iOS only
   * @default '#FFFFFF'
   */
  reducedTransparencyFallbackColor?: string;

  /**
   * Whether the glass view should be interactive
   * Platform: iOS 26+ only
   * @default true
   */
  isInteractive?: boolean;

  /**
   * Whether the glass view should ignore safe area insets
   * Platform: iOS 26+ only
   * @default false
   */
  ignoreSafeArea?: boolean;

  /**
   * Style object for the liquid glass view
   */
  style?: StyleProp<ViewStyle>;

  /**
   * Child components to render inside the liquid glass view
   */
  children?: React.ReactNode;
}

/**
 * A Liquid Glass view component that provides iOS 26+ glass effects.
 *
 * This component uses the new UIKit glass effect API available on iOS 26+.
 * On older iOS versions or when reduced transparency is enabled, it falls back
 * to a solid color background.
 *
 * **Platform Support:**
 * - iOS 26+: Native glass effect with full functionality
 * - iOS < 26 or Android: Fallback to reducedTransparencyFallbackColor
 *
 * This component automatically handles the proper positioning pattern where the glass
 * effect is positioned absolutely behind the content, ensuring interactive elements
 * work correctly.
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
  glassType = 'clear',
  glassTintColor = 'clear',
  glassOpacity = 1.0,
  reducedTransparencyFallbackColor = '#FFFFFF',
  isInteractive = true,
  ignoreSafeArea = false,
  style,
  children,
  borderRadius = 0,
  ...props
}) => {
  // Only render on iOS
  if (Platform.OS !== 'ios') {
    console.warn(
      'LiquidGlassView is only supported on iOS. Rendering children without glass effect.'
    );
    return <View style={style}>{children}</View>;
  }

  // If no children, render the glass view directly (for background use)
  if (React.Children.count(children) === 0) {
    return (
      <ReactNativeLiquidGlassView
        glassType={glassType}
        borderRadius={borderRadius}
        glassTintColor={glassTintColor}
        glassOpacity={glassOpacity}
        reducedTransparencyFallbackColor={reducedTransparencyFallbackColor}
        isInteractive={isInteractive}
        ignoreSafeArea={ignoreSafeArea}
        style={style}
        {...props}
      />
    );
  }

  // If children exist, use the absolute positioning pattern
  return (
    <View style={[{ position: 'relative' }, style]}>
      {/* Glass effect positioned absolutely behind content */}
      <ReactNativeLiquidGlassView
        glassType={glassType}
        glassTintColor={glassTintColor}
        glassOpacity={glassOpacity}
        reducedTransparencyFallbackColor={reducedTransparencyFallbackColor}
        isInteractive={isInteractive}
        ignoreSafeArea={ignoreSafeArea}
        borderRadius={borderRadius}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
        {...props}
      />
      {/* Content positioned relatively on top */}
      <View style={{ position: 'relative', zIndex: 1 }}>{children}</View>
    </View>
  );
};

export default LiquidGlassView;
