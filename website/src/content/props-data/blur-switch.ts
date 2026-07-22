import type { PropRow } from './types';

export const blurSwitchProps: PropRow[] = [
  { name: 'value', type: 'boolean', default: 'false', description: 'The current value of the switch.' },
  {
    name: 'onValueChange',
    type: '(value: boolean) => void',
    default: 'undefined',
    description: 'Callback invoked when the switch value changes.',
  },
  {
    name: 'blurAmount',
    type: 'number',
    default: '10',
    platform: 'Android',
    description: 'The intensity of the blur effect (0-100). Only Android renders a blurred track.',
  },
  {
    name: 'blurRounds',
    type: 'number',
    default: '5',
    platform: 'Android',
    description: 'Number of blur interactions for a smoother effect (1-15).',
  },
  {
    name: 'thumbColor',
    type: 'ColorValue',
    default: "'#FFFFFF'",
    platform: 'iOS, Web',
    description: 'The color of the switch thumb.',
  },
  {
    name: 'trackColor',
    type: '{ false?: ColorValue; true?: ColorValue }',
    default: "{ false: '#E5E5EA', true: '#34C759' }",
    description: 'Track colors. On Android only `true` is used — QmBlurView auto-calculates the off-state shade from it.',
  },
  {
    name: 'disabled',
    type: 'boolean',
    default: 'false',
    description: 'Disables interaction while keeping the current value.',
  },
  { name: 'style', type: 'StyleProp<ViewStyle>', default: 'undefined', description: 'Style object for the switch view.' },
];
