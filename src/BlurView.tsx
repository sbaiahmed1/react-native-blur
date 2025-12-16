import React, { Children } from 'react';
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
   * @description Override iOS "Reduce Transparency" accessibility fallback behavior
   * When true, the blur effect will remain active even when "Reduce Transparency" is enabled.
   * When false (default), the system "Reduce Transparency" setting will be respected and
   * the blur will be replaced with reducedTransparencyFallbackColor.
   *
   * @default false
   */
  ignoreAccessibilityFallback?: boolean;

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
  ignoreAccessibilityFallback = false,
  ...props
}) => {
  // If no children, render the blur view directly (for background use)
  if (!Children.count(children)) {
    return (
      <ReactNativeBlurView
        style={style}
        blurType={blurType}
        blurAmount={blurAmount}
        ignoreSafeArea={ignoreSafeArea}
        reducedTransparencyFallbackColor={reducedTransparencyFallbackColor}
        ignoreAccessibilityFallback={ignoreAccessibilityFallback}
        {...props}
      />
    );
  }

  // If children exist, use the style default for Android
  if (Platform.OS === 'android') {
    return (
      <ReactNativeBlurView
        style={style}
        blurType={blurType}
        blurAmount={blurAmount}
        ignoreSafeArea={ignoreSafeArea}
        reducedTransparencyFallbackColor={reducedTransparencyFallbackColor}
        ignoreAccessibilityFallback={ignoreAccessibilityFallback}
        {...props}
      >
        {children}
      </ReactNativeBlurView>
    );
  }

  // If children exist, use the absolute positioning pattern for iOS and others
  return (
    <View style={[styles.container, style]}>
      {/* Blur effect positioned absolutely behind the content */}
      <ReactNativeBlurView
        style={StyleSheet.absoluteFill}
        blurType={blurType}
        blurAmount={blurAmount}
        ignoreSafeArea={ignoreSafeArea}
        reducedTransparencyFallbackColor={reducedTransparencyFallbackColor}
        ignoreAccessibilityFallback={ignoreAccessibilityFallback}
        {...props}
      />
      {/* Content positioned relatively on top when the device is not Android */}
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
