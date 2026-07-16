import React, { forwardRef, memo } from 'react';
import { Platform, View, type ViewProps } from 'react-native';
import ReactNativeLiquidGlassContainer from './ReactNativeLiquidGlassContainerNativeComponent';

export interface LiquidGlassContainerProps extends ViewProps {
  /**
   * @description The spacing value for the glass container effect
   *
   * @default 0
   *
   * @platform iOS
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
/**
 * Ref to the underlying native glass container. On the fallback path
 * (non-iOS or iOS < 26, which render a plain View) the ref is not attached.
 */
export type LiquidGlassContainerRef = React.ComponentRef<
  typeof ReactNativeLiquidGlassContainer
>;

const LiquidGlassContainerComponent = forwardRef<
  LiquidGlassContainerRef,
  LiquidGlassContainerProps
>(({ spacing = 0, style, children, ...rest }, ref) => {
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
    <ReactNativeLiquidGlassContainer
      ref={ref}
      spacing={spacing}
      style={style}
      {...rest}
    >
      {children}
    </ReactNativeLiquidGlassContainer>
  );
});

LiquidGlassContainerComponent.displayName = 'LiquidGlassContainer';

export const LiquidGlassContainer = memo(LiquidGlassContainerComponent);

export default LiquidGlassContainer;
