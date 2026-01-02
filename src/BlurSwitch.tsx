import React from 'react';
import { Platform, Switch } from 'react-native';
import type { ViewStyle, StyleProp, ColorValue } from 'react-native';
import ReactNativeBlurSwitch from './ReactNativeBlurSwitchNativeComponent';

const toColorString = (
  color: ColorValue | undefined,
  fallback: string
): string => {
  if (typeof color === 'string') return color;
  return fallback;
};

export interface BlurSwitchProps {
  /**
   * @description The current value of the switch
   *
   * @default false
   */
  value?: boolean;

  /**
   * @description Callback invoked when the switch value changes
   *
   * @default undefined
   */
  onValueChange?: (value: boolean) => void;

  /**
   * @description The intensity of the blur effect (0-100)
   *
   * @platform android
   * @default 10
   */
  blurAmount?: number;

  /**
   * @description The color of the switch thumb
   *
   * @platform ios
   * @default '#FFFFFF'
   */
  thumbColor?: ColorValue;

  /**
   * @description The track colors for off and on states
   *
   * Note: On Android, you only need to set the `true` (base) color.
   * QmBlurView will automatically calculate the on/off state colors.
   * The `false` color is only used on iOS.
   *
   * @default { false: '#E5E5EA', true: '#34C759' }
   */
  trackColor?: {
    false?: ColorValue;
    true?: ColorValue;
  };

  /**
   * @description Whether the switch is disabled
   *
   * @default false
   */
  disabled?: boolean;

  /**
   * @description Style object for the switch view
   *
   * @default undefined
   */
  style?: StyleProp<ViewStyle>;
}

/**
 * A cross-platform blur switch component.
 *
 * On iOS, this uses the native Switch component.
 * On Android, this uses QmBlurView's BlurSwitchButtonView for blur effects.
 *
 * Note: On Android, you only need to set the base color (`trackColor.true`),
 * and QmBlurView will automatically calculate the colors for on/off states.
 * The `thumbColor` and `trackColor.false` props are only supported on iOS.
 *
 * @example
 * ```tsx
 * <BlurSwitch
 *   value={isEnabled}
 *   onValueChange={setIsEnabled}
 *   blurAmount={20}
 *   trackColor={{ true: '#34C759' }}
 * />
 * ```
 */
export const BlurSwitch: React.FC<BlurSwitchProps> = ({
  value = false,
  onValueChange,
  blurAmount = 10,
  thumbColor = '#FFFFFF',
  trackColor = { false: '#E5E5EA', true: '#34C759' },
  disabled = false,
  style,
  ...props
}) => {
  if (Platform.OS === 'ios') {
    return (
      <Switch
        value={value}
        onValueChange={onValueChange}
        thumbColor={thumbColor}
        trackColor={trackColor}
        disabled={disabled}
        style={style}
        {...props}
      />
    );
  }

  return (
    <ReactNativeBlurSwitch
      style={[{ width: 65, height: 36 }, style]}
      value={value}
      onValueChange={(event) => {
        onValueChange?.(event.nativeEvent.value);
      }}
      blurAmount={blurAmount}
      thumbColor={toColorString(thumbColor, '#FFFFFF')}
      trackColorOff={toColorString(trackColor?.false, '#E5E5EA')}
      trackColorOn={toColorString(trackColor?.true, '#34C759')}
      disabled={disabled}
      {...props}
    />
  );
};

export default BlurSwitch;
