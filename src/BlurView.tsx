import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import type { ViewStyle, StyleProp } from 'react-native';
import ReactNativeBlurView, {
  type BlurType,
} from './ReactNativeBlurViewNativeComponent';

export interface BlurViewProps {
  /**
   * @description The type of blur effect to apply
   *
   * @default 'xlight'
   */
  blurType?: BlurType;

  /**
   * @description The intensity of the blur effect (0-100)
   *
   * @default 10
   */
  blurAmount?: number;

  /**
   * @description Fallback color when reduced transparency is enabled
   *
   * Accepts hex color strings like `#FFFFFF`
   *
   * @default '#FFFFFF'
   */
  reducedTransparencyFallbackColor?: string;

  /**
   * @description style object for the blur view
   *
   * @default undefined
   */
  style?: StyleProp<ViewStyle>;

  /**
   * @description style object for the blur view
   *
   * @default false
   */
  ignoreSafeArea?: boolean;

  /**
   * @description Child components to render inside the blur view
   *
   * @default undefined
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
  blurType = 'xlight',
  blurAmount = 10,
  reducedTransparencyFallbackColor = '#FFFFFF',
  style,
  children,
  ignoreSafeArea = false,
  ...props
}) => {
  // If no children, render the blur view directly (for background use)
  if (React.Children.count(children) === 0) {
    return (
      <ReactNativeBlurView
        ignoreSafeArea={ignoreSafeArea}
        blurType={blurType}
        blurAmount={blurAmount}
        reducedTransparencyFallbackColor={reducedTransparencyFallbackColor}
        style={style}
        {...props}
      />
    );
  }

  // If children exist, use the style default for Android
  if (Platform.OS === 'android') {
    return (
      <ReactNativeBlurView
        ignoreSafeArea={ignoreSafeArea}
        blurType={blurType}
        blurAmount={blurAmount}
        reducedTransparencyFallbackColor={reducedTransparencyFallbackColor}
        style={style}
        {...props}
      >
        <View style={styles.children}>{children}</View>
      </ReactNativeBlurView>
    );
  }

  // If children exist, use the absolute positioning pattern for iOS and others
  return (
    <View style={[styles.container, style]}>
      {/* Blur effect positioned absolutely behind content */}
      <ReactNativeBlurView
        ignoreSafeArea={ignoreSafeArea}
        blurType={blurType}
        blurAmount={blurAmount}
        reducedTransparencyFallbackColor={reducedTransparencyFallbackColor}
        style={StyleSheet.absoluteFill}
        {...props}
      />
      {/* Content positioned relatively on top when device is not Android */}
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
