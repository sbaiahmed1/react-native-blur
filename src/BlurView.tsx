import React from 'react';
import { View } from 'react-native';
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
 * This component automatically handles the proper positioning pattern where the blur
 * effect is positioned absolutely behind the content, ensuring interactive elements
 * work correctly.
 *
 * @example
 * ```tsx
 * <BlurView
 *   blurType="light"
 *   blurAmount={20}
 *   style={{ flex: 1 }}
 * >
 *   <Text>Content on top of blur</Text>
 *   <Button title="Interactive Button" onPress={() => {}} />
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
  // If no children, render the blur view directly (for background use)
  if (React.Children.count(children) === 0) {
    return (
      <ReactNativeBlurView
        blurType={blurType}
        blurAmount={blurAmount}
        reducedTransparencyFallbackColor={reducedTransparencyFallbackColor}
        style={style}
        {...props}
      />
    );
  }

  // If children exist, use the absolute positioning pattern
  return (
    <View style={[{ position: 'relative', overflow: 'hidden' }, style]}>
      {/* Blur effect positioned absolutely behind content */}
      <ReactNativeBlurView
        blurType={blurType}
        blurAmount={blurAmount}
        reducedTransparencyFallbackColor={reducedTransparencyFallbackColor}
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

export default BlurView;
