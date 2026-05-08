import React from 'react';
import { Platform } from 'react-native';
import type { ViewStyle, StyleProp } from 'react-native';
import ReactNativeLiquidGlassView, {
  type GlassType,
} from './ReactNativeLiquidGlassViewNativeComponent';
import BlurView from './BlurView';

export interface LiquidGlassViewProps {
  /**
   * @description The type of glass effect to apply
   *
   * @default 'clear'
   *
   * @platform iOS 26+, Android
   */
  glassType?: GlassType;

  /**
   * @description The tint color of the glass effect. Accepts hex color strings
   * like '#FFFFFF' or color names
   *
   * @default 'clear'
   *
   * @platform iOS 26+, Android
   */
  glassTintColor?: string;

  /**
   * @description The opacity of the glass effect (0-1)
   *
   * @default 1.0
   *
   * @platform iOS 26+, Android
   */
  glassOpacity?: number;

  /**
   * @description Fallback color when reduced transparency is enabled or on
   * older iOS versions
   *
   * @default '#FFFFFF'
   *
   * @platform iOS
   */
  reducedTransparencyFallbackColor?: string;

  /**
   * @description Whether the glass view should be interactive
   *
   * @default true
   *
   * @platform iOS, Android
   */
  isInteractive?: boolean;

  /**
   * @description Whether the glass view should ignore safe area insets
   *
   * @default false
   *
   * @platform iOS
   */
  ignoreSafeArea?: boolean;

  /**
   * @description Style object for the liquid glass view
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
 * A Liquid Glass view component that provides iOS 26+ and Android glass effects.
 *
 * This component uses the native glass effect APIs:
 * - iOS 26+: UIKit glass effect API
 * - Android: com.qmdeve.liquidglass:core library
 *
 * On older iOS versions, it falls back to a BlurView with glass-like styling.
 *
 * **Platform Support:**
 * - iOS 26+: Native glass effect with full functionality
 * - Android: Native liquid glass effect via QmDeve library
 * - iOS < 26: Fallback to BlurView
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
  // Android: use native ReactNativeLiquidGlassView
  if (Platform.OS === 'android') {
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
  }

  const isIos = Platform.OS === 'ios';

  // iOS < 26: fallback to BlurView
  if (!isIos || (isIos && Number.parseInt(String(Platform.Version), 10) < 26)) {
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

  // iOS 26+: native glass effect
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
