import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import type { GlassType } from '../src/ReactNativeBlurViewNativeComponent';
import ReactNativeBlurView, {
  type BlurType,
} from './ReactNativeBlurViewNativeComponent';

export interface BlurViewProps {
  /**
   * The type of blur effect to apply
   * @default 'xlight'
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
   * @default '#FFFFFF'
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

  /**
   * Platform: iOS only
   * The type of glass effect to apply
   * @default 'clear'
   */
  glassType?: GlassType;

  /**
   * Platform: iOS only
   * The tint color of the glass effect
   * accepts hex color strings like '#FFFFFF'
   * accepts color names like 'white', 'clear', 'black', 'red', 'green', 'blue', 'yellow', 'cyan', 'magenta'
   * @default 'clear'
   */
  glassTintColor?: string;

  /**
   * Platform: iOS only
   * The opacity of the glass effect (0-1)
   * @default 1.0
   */
  glassOpacity?: number;

  /**
   * The type of blur effect to apply
   * liquidGlass = iOS Only
   * blur = Android | iOS
   * @default 'blur'
   */
  type?: 'blur' | 'liquidGlass';

  /**
   * Platform: iOS only
   * Whether the blur view should be interactive
   * @default true
   */
  isInteractive?: boolean;

  /**
   * Platform: iOS only
   * Whether the blur view should be ignore safe area insets
   * @default false
   */
  ignoreSafeArea?: boolean;

  /**
   * Platform: Android only
   * The ID of the target view to blur (BlurView v3)
   * When provided, enables real blur effect on Android by blurring the specified TargetView.
   *
   * **Important:** This must match the `id` prop of an existing `TargetView` component in your app.
   * If the targetId doesn't match any TargetView, the blur effect will fail and fall back to overlay color.
   *
   * @example
   * ```tsx
   * // Define a TargetView with an id
   * <TargetView id="background" style={styles.container}>
   *   <Image source={backgroundImage} />
   * </TargetView>
   *
   * // Reference it in BlurView with matching targetId
   * <BlurView targetId="background" blurAmount={40}>
   *   <Text>This blurs the background</Text>
   * </BlurView>
   * ```
   */
  targetId?: string;
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
 *
 * @example With Android real blur using targetId:
 * ```tsx
 * <TargetView id="background" style={styles.container}>
 *   <Image source={backgroundImage} style={styles.background} />
 * </TargetView>
 *
 * <BlurView
 *   targetId="background"
 *   blurType="light"
 *   blurAmount={40}
 *   style={{ flex: 1 }}
 * >
 *   <Text>Blurs the actual background in real-time</Text>
 * </BlurView>
 * ```
 */
export const BlurView: React.FC<BlurViewProps> = ({
  blurType = 'xlight',
  blurAmount = 10,
  reducedTransparencyFallbackColor = '#FFFFFF',
  style,
  children,
  type = 'blur',
  glassType = 'clear',
  glassTintColor = 'clear',
  glassOpacity = 1.0,
  isInteractive = true,
  ignoreSafeArea = false,
  targetId,
  ...props
}) => {
  return (
    <View style={[{ position: 'relative' }, style, { overflow: 'hidden' }]}>
      <ReactNativeBlurView
        blurType={blurType}
        blurAmount={blurAmount}
        glassType={glassType}
        glassTintColor={glassTintColor}
        glassOpacity={glassOpacity}
        type={type}
        isInteractive={isInteractive}
        ignoreSafeArea={ignoreSafeArea}
        reducedTransparencyFallbackColor={reducedTransparencyFallbackColor}
        targetId={targetId}
        style={StyleSheet.absoluteFill}
        {...props}
      />
      <View style={{ position: 'relative', zIndex: 1 }}>{children}</View>
    </View>
  );
};

export default BlurView;
