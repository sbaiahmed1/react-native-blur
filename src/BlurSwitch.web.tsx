import React from 'react';
import { Switch } from 'react-native';
import type { ViewStyle, StyleProp, ColorValue } from 'react-native';

export interface BlurSwitchProps {
  value?: boolean;
  onValueChange?: (value: boolean) => void;
  blurAmount?: number;
  thumbColor?: ColorValue;
  trackColor?: {
    false?: ColorValue;
    true?: ColorValue;
  };
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

/**
 * Web implementation of BlurSwitch.
 *
 * The native Android version renders a blur-styled switch via QmBlurView.
 * On web we fall back to React Native's built-in Switch component, which
 * renders a standard checkbox toggle.
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
