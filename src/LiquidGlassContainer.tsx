import React from 'react';
import { Platform, View, type ViewProps } from 'react-native';
import ReactNativeLiquidGlassContainer from './ReactNativeLiquidGlassContainerNativeComponent';

export interface LiquidGlassContainerProps extends ViewProps {
  /**
   * The spacing value for the glass container effect
   * Platform: iOS only (iOS 26+)
   *
   * @default 0
   */
  spacing?: number;
}

/**
 * LiquidGlassContainer component
 *
 * A UIKit-based container that applies the iOS 26+ UIGlassContainerEffect.
 * This component uses the liquid glass container effect with configurable spacing.
 *
 * Platform: iOS only (iOS 26+)
 *
 * @platform ios
 *
 * @example
 * ```tsx
 * <LiquidGlassContainer spacing={20} style={{ flex: 1 }}>
 *   <Text>Content inside glass container</Text>
 * </LiquidGlassContainer>
 * ```
 */
export const LiquidGlassContainer: React.FC<LiquidGlassContainerProps> = ({
  spacing = 0,
  style,
  children,
  ...rest
}) => {
  const isCompatibleIOS =
    Platform.OS === 'ios' && parseInt(Platform.Version as string, 10) >= 26;

  if (!isCompatibleIOS) {
    // Fallback to regular View on non-iOS platforms or older iOS versions
    return (
      <View style={style} {...rest}>
        {children}
      </View>
    );
  }

  return (
    <ReactNativeLiquidGlassContainer spacing={spacing} style={style} {...rest}>
      {children}
    </ReactNativeLiquidGlassContainer>
  );
};
