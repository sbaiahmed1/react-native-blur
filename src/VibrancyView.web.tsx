import React from 'react';
import type { ViewStyle, StyleProp } from 'react-native';
import type { BlurType } from './ReactNativeBlurViewNativeComponent';
import { BlurView } from './BlurView.web';

export interface VibrancyViewProps {
  blurType?: BlurType;
  blurAmount?: number;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
}

/**
 * Web implementation of VibrancyView.
 *
 * iOS uses UIVibrancyEffect which makes content "vibrant" against a blurred
 * background. On web we fall back to BlurView (same approach as the Android
 * fallback in the native implementation).
 */
export const VibrancyView: React.FC<VibrancyViewProps> = ({
  blurType = 'xlight',
  blurAmount = 10,
  style,
  children,
  ...props
}) => {
  return (
    <BlurView
      blurType={blurType}
      blurAmount={blurAmount}
      style={style}
      {...props}
    >
      {children}
    </BlurView>
  );
};
