import React from 'react';
import { Switch } from 'react-native';
import type { ViewStyle, StyleProp, ColorValue } from 'react-native';

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
   * @platform Android
   *
   * @default 10
   */
  blurAmount?: number;

  /**
   * @description The color of the switch thumb
   *
   * @platform ios
   *
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
 * Web implementation of BlurSwitch.
 *
 * The native Android version renders a blur-styled switch via QmBlurView.
 * On web we fall back to React Native's built-in Switch component, which
 * renders a standard checkbox toggle.
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
  thumbColor = '#FFFFFF',
  trackColor = { false: '#E5E5EA', true: '#34C759' },
  disabled = false,
  style,
  // Accepted for API compat, unused on web
  blurAmount: _blurAmount,
  ...props
}) => {
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
};

export default BlurSwitch;
