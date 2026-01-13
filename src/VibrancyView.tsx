import React from 'react';
import { Platform, StyleSheet } from 'react-native';
import type { ViewStyle, StyleProp } from 'react-native';
import ReactNativeVibrancyView, {
  type BlurType,
} from './ReactNativeVibrancyViewNativeComponent';
import BlurView from './BlurView';

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
 * A component that applies a vibrancy effect to its content.
 *
 * On iOS, this uses UIVibrancyEffect.
 * On Android, this falls back to a simple View (or BlurView behavior if implemented).
 */
export const VibrancyView: React.FC<VibrancyViewProps> = ({
  blurType = 'xlight',
  blurAmount = 10,
  style,
  children,
  ...props
}) => {
  if (Platform.OS === 'android') {
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
  }
  return (
    <ReactNativeVibrancyView
      blurType={blurType}
      blurAmount={blurAmount}
      style={[styles.container, style]}
      {...props}
    >
      {children}
    </ReactNativeVibrancyView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
  },
});
