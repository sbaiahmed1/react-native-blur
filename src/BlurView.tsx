import React from 'react';
import type { ViewStyle, StyleProp } from 'react-native';
import ReactNativeBlurView, {
  type BlurType,
} from './ReactNativeBlurViewNativeComponent';

export interface BlurViewProps {
  /**
   * The type of blur effect to apply
   * @default 'light'
   */
  blurType?: BlurType;

  /**
   * The intensity of the blur effect (0-100)
   * @default 10
   */
  blurAmount?: number;

  /**
   * Fallback color when reduced transparency is enabled
   * Accepts hex color strings like '#FFFFFF'
   */
  reducedTransparencyFallbackColor?: string;

  /**
   * Style object for the blur view
   */
  style?: StyleProp<ViewStyle>;

  /**
   * Child components to render inside the blur view
   */
  children?: React.ReactNode;
}

/**
 * A cross-platform blur view component that provides native blur effects.
 *
 * On iOS, this uses UIVisualEffectView for true blur effects.
 * On Android, this uses the BlurView library for hardware-accelerated blur effects.
 *
 * @example
 * ```tsx
 * <BlurView
 *   blurType="light"
 *   blurAmount={20}
 *   style={{ flex: 1 }}
 * >
 *   <Text>Content behind blur</Text>
 * </BlurView>
 * ```
 */
export const BlurView: React.FC<BlurViewProps> = ({
  blurType = 'light',
  blurAmount = 10,
  reducedTransparencyFallbackColor,
  style,
  children,
  ...props
}) => {
  return (
    <ReactNativeBlurView
      blurType={blurType}
      blurAmount={blurAmount}
      reducedTransparencyFallbackColor={reducedTransparencyFallbackColor}
      style={style}
      {...props}
    >
      {children}
    </ReactNativeBlurView>
  );
};

export default BlurView;
