import React from 'react';
import type { ViewStyle, StyleProp } from 'react-native';
import type { BlurType } from './ReactNativeBlurViewNativeComponent';
import { BlurView } from './BlurView.web';

export interface VibrancyViewProps {
  /**
   * @description The type of blur effect to apply
   *
   * @default 'xlight'
   */
  blurType?: BlurType;

  /**
   * @description The intensity of the blur effect (0-100)
   *
   * @default 10
   */
  blurAmount?: number;

  /**
   * @description style object for the vibrancy view
   *
   * @default undefined
   */
  style?: StyleProp<ViewStyle>;

  /**
   * @description Child components to render inside the vibrancy view
   *
   * @default undefined
   */
  children?: React.ReactNode;
}

/**
 * Web implementation of VibrancyView.
 *
 * iOS uses UIVibrancyEffect which makes content "vibrant" against a blurred
 * background. On web we fall back to BlurView (same approach as the Android
 * fallback in the native implementation).
 *
 * @example
 * ```tsx
 * <VibrancyView
 *   blurType="light"
 *   blurAmount={20}
 *   style={{ flex: 1 }}
 * >
 *   <Text>Content on top of vibrancy view</Text>
 *   <Button title="Interactive Button" onPress={() => {}} />
 * </VibrancyView>
 * ```
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
