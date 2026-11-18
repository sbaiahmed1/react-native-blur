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
   * @description How much QmBlurView scales the captured backdrop down before
   * blurring it (1-16). Lower values keep edges behind the blur from stepping
   * at a higher CPU and memory cost, which grows with the square of the
   * reduction (2 captures 16x the pixels of 8). Applies on Android 11 and
   * earlier. Android 12 and later blur on the GPU and ignore it.
   *
   * @default 8
   *
   * @platform Android
   */
  downsampleFactor?: number;

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
      downsampleFactor = 8,
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
        downsampleFactor,
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
        downsampleFactor,
        ignoreSafeArea,
        reducedTransparencyFallbackColor,
        material,
      ]
    );

    // The overlay draws above the blur material and below the children.
    const overlayView =
      overlayColor != null ? (
        <View style={[StyleSheet.absoluteFill, styles.passThrough, overlay]} />
      ) : null;

    // Without children the blur view is the root, and its native children draw above the blur.
    if (!Children.count(children)) {
      return (
        <ReactNativeBlurView
          ref={ref}
          style={style}
          {...commonProps}
          {...props}
        >
          {overlayView}
        </ReactNativeBlurView>
      );
    }

    // On Android the overlay and the children live inside the native view, which draws its blur first.
    if (Platform.OS === 'android') {
      return (
        <ReactNativeBlurView
          ref={ref}
          style={style}
          {...commonProps}
          {...props}
        >
          {overlayView}
          {children}
        </ReactNativeBlurView>
      );
    }

    // Elsewhere the blur is positioned absolutely behind the overlay and the children
    return (
      <View style={[styles.container, style]}>
        <ReactNativeBlurView
          ref={ref}
          style={StyleSheet.absoluteFill}
          {...commonProps}
          {...props}
        />
        {overlayView}
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
  passThrough: {
    pointerEvents: 'none',
  },
});
