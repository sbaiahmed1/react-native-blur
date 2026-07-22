import React, { forwardRef, memo } from 'react';
import { View } from 'react-native';
import type { VibrancyViewProps } from './VibrancyView';
import BlurView from './BlurView.web';

export type { VibrancyViewProps } from './VibrancyView';

/** Ref to the root view of the web vibrancy view. */
export type VibrancyViewRef = React.ComponentRef<typeof View>;

/**
 * Web implementation of VibrancyView.
 *
 * iOS uses UIVibrancyEffect, which has no web equivalent, so this delegates to
 * BlurView — the same strategy as the native Android fallback.
 */
const VibrancyViewComponent = forwardRef<VibrancyViewRef, VibrancyViewProps>(
  (
    { blurType = 'xlight', blurAmount = 10, style, children, ...props },
    ref
  ) => {
    return (
      <BlurView
        ref={ref}
        blurType={blurType}
        blurAmount={blurAmount}
        style={style}
        {...props}
      >
        {children}
      </BlurView>
    );
  }
);

VibrancyViewComponent.displayName = 'VibrancyView';

export const VibrancyView = memo(VibrancyViewComponent);

export default VibrancyView;
