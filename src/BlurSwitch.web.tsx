import React, { memo } from 'react';
import { Switch } from 'react-native';
import type { BlurSwitchProps } from './BlurSwitch';

export type { BlurSwitchProps } from './BlurSwitch';

/**
 * Web implementation of BlurSwitch.
 *
 * The blur-styled switch is an Android-native (QmBlurView) component; on iOS
 * the wrapper already renders React Native's built-in Switch, and the web
 * version mirrors that iOS behavior. `blurAmount` and `blurRounds` are
 * native-only and accepted for API compatibility.
 */
const BlurSwitchComponent: React.FC<BlurSwitchProps> = ({
  value = false,
  onValueChange,
  thumbColor = '#FFFFFF',
  trackColor = { false: '#E5E5EA', true: '#34C759' },
  disabled = false,
  style,
  // Native-only props, accepted for API compatibility
  blurAmount: _blurAmount,
  blurRounds: _blurRounds,
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

BlurSwitchComponent.displayName = 'BlurSwitch';

export const BlurSwitch = memo(BlurSwitchComponent);

export default BlurSwitch;
