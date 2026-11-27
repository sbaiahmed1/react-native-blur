import type { PropRow } from './types';

export const blurViewProps: PropRow[] = [
  {
    name: 'blurType',
    type: 'BlurType',
    default: "'xlight'",
    description:
      'Sets the material to draw: the blur, saturation and tint of the iOS blur style of the same name. `regular`, `prominent` and the `system*Material` types without a `Light` or `Dark` suffix follow Dark Mode.',
  },
  {
    name: 'blurAmount',
    type: 'number',
    default: '10',
    description: 'Sets how much of the `blurType` material draws, from 0 for none to 100 for the whole material.',
  },
  {
    name: 'blurRounds',
    type: 'number',
    default: '5',
    platform: 'Android',
    description: 'Sets how many blur passes run on Android 11 and earlier, for a smoother blur (1-15). Android 12 and later ignore it.',
  },
  {
    name: 'downsampleFactor',
    type: 'number',
    default: '8',
    platform: 'Android',
    description: 'Sets how much the backdrop is scaled down before it is blurred on Android 11 and earlier (1-16). Lower values keep edges behind the blur from stepping, at a CPU and memory cost that grows with the square of the reduction. Set it once and do not animate it, since each new value allocates the blur memory again. Android 12 and later ignore it.',
  },
  {
    name: 'ignoreSafeArea',
    type: 'boolean',
    default: 'true',
    platform: 'iOS',
    description: 'Controls whether the blur effect should ignore all safe area edges.',
  },
  {
    name: 'reducedTransparencyFallbackColor',
    type: 'string',
    default: "'#FFFFFF'",
    platform: 'iOS',
    description: 'Fallback color shown when the "Reduce Transparency" accessibility setting is enabled.',
  },
  {
    name: 'overlayColor',
    type: 'ColorValue',
    default: 'undefined',
    description: 'Sets a color drawn over the whole view, above the blur and below the children.',
  },
  { name: 'style', type: 'StyleProp<ViewStyle>', default: 'undefined', description: 'Style object for the blur view.' },
  { name: 'children', type: 'React.ReactNode', default: 'undefined', description: 'Child components to render inside the blur view.' },
];
