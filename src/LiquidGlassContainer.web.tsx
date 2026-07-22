import React, { forwardRef, memo } from 'react';
import { View } from 'react-native';
import type { LiquidGlassContainerProps } from './LiquidGlassContainer';

export type { LiquidGlassContainerProps } from './LiquidGlassContainer';

/** Ref to the root view of the web liquid glass container. */
export type LiquidGlassContainerRef = React.ComponentRef<typeof View>;

/**
 * Web implementation of LiquidGlassContainer.
 *
 * The iOS 26+ UIGlassContainerEffect (which merges nearby glass views) has no
 * web equivalent, so this renders a plain View — the same fallback the native
 * component uses on Android and older iOS. `spacing` is native-only and
 * accepted for API compatibility.
 */
const LiquidGlassContainerComponent = forwardRef<
  LiquidGlassContainerRef,
  LiquidGlassContainerProps
>(({ spacing: _spacing, style, children, ...rest }, ref) => {
  return (
    <View ref={ref} style={style} {...rest}>
      {children}
    </View>
  );
});

LiquidGlassContainerComponent.displayName = 'LiquidGlassContainer';

export const LiquidGlassContainer = memo(LiquidGlassContainerComponent);

export default LiquidGlassContainer;
