import React from 'react';
import { View } from 'react-native';
import type { StyleProp, ViewProps, ViewStyle } from 'react-native';

export interface LiquidGlassContainerProps extends ViewProps {
  /**
   * The spacing value for the glass container effect
   * Platform: iOS only (iOS 26+)
   *
   * @platform ios
   *
   * @default 0
   */
  spacing?: number;
}

/**
 * Web implementation of LiquidGlassContainer.
 *
 * The native iOS 26+ component groups glass views with a shared effect.
 * On web there is no equivalent API, so this renders a plain View that
 * maps the `spacing` prop to CSS `gap` for flex-based layout.
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
  const containerStyle: StyleProp<ViewStyle> = {
    zIndex: 1,
    gap: spacing,
  };

  return (
    <View style={[containerStyle, style]} {...rest}>
      {children}
    </View>
  );
};
