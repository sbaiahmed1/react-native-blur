import React from 'react';
import { Platform } from 'react-native';
import type { ViewStyle, StyleProp } from 'react-native';
import ReactNativeLiquidGlassView, {
  type GlassType,
} from './ReactNativeLiquidGlassViewNativeComponent';
import BlurView from './BlurView';

export interface LiquidGlassViewProps {
  /**
   * The type of glass effect to apply
   * Platform: iOS 26+ only
   *
   * @default 'clear'
   */
  glassType?: GlassType;

  /**
   * The tint color of the glass effect
   * Accepts hex color strings like '#FFFFFF' or color names
   * Platform: iOS 26+ only
   *
   * @default 'clear'
   */
  glassTintColor?: string;

  /**
   * The opacity of the glass effect (0-1)
   * Platform: iOS 26+ only
   *
   * @default 1.0
   */
  glassOpacity?: number;

  /**
   * Fallback color when reduced transparency is enabled or on older iOS versions
   * Accepts hex color strings like '#FFFFFF'
   * Platform: iOS only
   *
   * @default '#FFFFFF'
   */
  reducedTransparencyFallbackColor?: string;

  /**
   * Whether the glass view should be interactive
   * Platform: iOS 26+ only
   *
   * @default true
   */
  isInteractive?: boolean;

  /**
   * Whether the glass view should ignore safe area insets
   * Platform: iOS 26+ only
   *
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
  ignoreSafeArea = true,
  style,
  children,
  ...props
}) => {
  const isIos = Platform.OS === 'ios';

  // Only render on iOS 26+ (fallback otherwise)
  if (!isIos || (isIos && Number.parseInt(String(Platform.Version), 10) < 26)) {
    console.warn(
      'LiquidGlassView is only supported on iOS. Rendering children without glass effect.'
    );

    // Compute overlay color with opacity for Android native handling
    const overlayColorWithAlpha =
      glassTintColor +
      Math.floor(glassOpacity * 255)
        .toString(16)
        .padStart(2, '0');

    return (
      <BlurView
        blurAmount={70}
        overlayColor={overlayColorWithAlpha}
        reducedTransparencyFallbackColor={reducedTransparencyFallbackColor}
        ignoreSafeArea={ignoreSafeArea}
        style={style}
      >
        {children}
      </BlurView>
    );
  }

  // If children exist, use the absolute positioning pattern
  return (
    <ReactNativeLiquidGlassView
      glassType={glassType}
      glassTintColor={glassTintColor}
      glassOpacity={glassOpacity}
      reducedTransparencyFallbackColor={reducedTransparencyFallbackColor}
      isInteractive={isInteractive}
      ignoreSafeArea={ignoreSafeArea}
      style={style}
      {...props}
    >
      {children}
    </ReactNativeLiquidGlassView>
  );
};

export default LiquidGlassView;
