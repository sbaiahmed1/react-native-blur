import React, { Children, forwardRef, memo, useMemo } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import type { ViewStyle, StyleProp, ColorValue, ViewProps } from 'react-native';
import ReactNativeBlurView, {
  type BlurType,
  type NativeProps,
} from './ReactNativeBlurViewNativeComponent';
import { materialFor } from './materials';
import { useMaterialScheme } from './useMaterialScheme';

export interface BlurViewProps extends ViewProps {
  /**
   * @description The material to draw: the blur, saturation and tint of the
   * iOS blur style of the same name. `regular`, `prominent` and the
   * `system*Material` types without a `Light` or `Dark` suffix follow the
   * color scheme.
   *
   * @default 'xlight'
   */
  blurType?: BlurType;

  /**
   * @description How much of the `blurType` material to draw, from 0 for
   * none to 100 for the whole material.
   *
   * @default 10
   */
  blurAmount?: number;

  /**
   * @description Sets how many blur passes QmBlurView runs, for a smoother
   * blur (1-15). Applies on Android 11 and earlier. Android 12 and later use
   * a Gaussian blur and ignore it.
   *
   * @default 5
   *
   * @platform Android
   */
  blurRounds?: number;

  /**
   * @description Fallback color when reduced transparency is enabled
   *
   * @default '#FFFFFF'
   *
   * @platform iOS
   */
  reducedTransparencyFallbackColor?: ColorValue;

  /**
   * @description The overlay color to apply on top of the blur effect
   *
   * @default undefined
   */
  overlayColor?: ColorValue;

  /**
   * @description style object for the blur view
   *
   * @default undefined
   */
  style?: StyleProp<ViewStyle>;

  /**
   * @description Whether the blur view should ignore safe area insets
   *
   * @default true
   */
  ignoreSafeArea?: boolean;

  /**
   * @description Child components to render inside the blur view
   *
   * @default undefined
   */
  children?: React.ReactNode;
}

/** Ref to the underlying native blur view. */
export type BlurViewRef = React.ComponentRef<typeof ReactNativeBlurView>;

/**
 * A cross-platform blur view component that provides native blur effects.
 *
 * On iOS, this uses UIVisualEffectView for true blur effects.
 * On Android, this captures the views behind it and blurs them on the CPU with QmBlurView.
 *
 * This component automatically handles the proper positioning pattern where the blur
 * effect is positioned absolutely behind the content, ensuring interactive elements
 * work correctly.
 *
 * A forwarded ref resolves to the underlying native blur view.
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
const BlurViewComponent = forwardRef<BlurViewRef, BlurViewProps>(
  (
    {
      blurType = 'xlight',
      blurAmount = 10,
      blurRounds = 5,
      reducedTransparencyFallbackColor = '#FFFFFF',
      overlayColor,
      style,
      children,
      ignoreSafeArea = true,
      ...props
    },
    ref
  ) => {
    const overlay = useMemo(
      () => ({ backgroundColor: overlayColor }),
      [overlayColor]
    );
    const material = materialFor(blurType, useMaterialScheme());
    const commonProps = useMemo<NativeProps>(
      () => ({
        blurType,
        blurAmount,
        blurRounds,
        ignoreSafeArea,
        reducedTransparencyFallbackColor,
        materialTint: material.tint,
        materialSaturation: material.saturation,
        materialRadius: material.radius,
      }),
      [
        blurType,
        blurAmount,
        blurRounds,
        ignoreSafeArea,
        reducedTransparencyFallbackColor,
        material,
      ]
    );

    // If no children, render the blur view directly (for background use)
    if (!Children.count(children)) {
      return (
        <ReactNativeBlurView
          ref={ref}
          style={[style, overlay]}
          {...commonProps}
          {...props}
        />
      );
    }

    // If children exist, use the style default for Android
    if (Platform.OS === 'android') {
      return (
        <ReactNativeBlurView
          ref={ref}
          style={style}
          {...commonProps}
          {...props}
        >
          <View style={[StyleSheet.absoluteFill, overlay]} />

          {children}
        </ReactNativeBlurView>
      );
    }

    // If children exist, use the absolute positioning pattern for iOS and others
    return (
      <View style={[styles.container, style, overlay]}>
        {/* Blur effect positioned absolutely behind content */}
        <ReactNativeBlurView
          ref={ref}
          style={StyleSheet.absoluteFill}
          {...commonProps}
          {...props}
        />
        {children}
      </View>
    );
  }
);

BlurViewComponent.displayName = 'BlurView';

export const BlurView: React.NamedExoticComponent<
  BlurViewProps & React.RefAttributes<BlurViewRef>
> = memo(BlurViewComponent);

export default BlurView;

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
  },
});
