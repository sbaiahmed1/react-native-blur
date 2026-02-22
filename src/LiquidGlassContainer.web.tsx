import React from 'react';
import { View } from 'react-native';
import type { ViewProps } from 'react-native';

export interface LiquidGlassContainerProps extends ViewProps {
  spacing?: number;
}

/**
 * Web implementation of LiquidGlassContainer.
 *
 * The native iOS 26+ component groups glass views with a shared effect.
 * On web there is no equivalent API, so this renders a plain View that
 * maps the `spacing` prop to CSS `gap` for flex-based layout.
 */
export const LiquidGlassContainer: React.FC<LiquidGlassContainerProps> = ({
  spacing = 0,
  style,
  children,
  ...rest
}) => {
  return (
    <View
      style={[{ gap: spacing } as Record<string, unknown>, style]}
      {...rest}
    >
      {children}
    </View>
  );
};
