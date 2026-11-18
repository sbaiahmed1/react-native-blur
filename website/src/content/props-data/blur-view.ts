import type { PropRow } from './types';

export const blurViewProps: PropRow[] = [
  { name: 'blurType', type: 'BlurType', default: "'xlight'", description: 'The type of blur effect to apply.' },
  { name: 'blurAmount', type: 'number', default: '10', description: 'The intensity of the blur effect (0-100).' },
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
    description: 'How much the backdrop is scaled down before it is blurred on Android 11 and earlier (1-16). Lower values keep edges behind the blur from stepping, at a CPU and memory cost that grows with the square of the reduction. Android 12 and later ignore it.',
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
    description: 'An overlay color to apply on top of the blur effect.',
  },
  { name: 'style', type: 'StyleProp<ViewStyle>', default: 'undefined', description: 'Style object for the blur view.' },
  { name: 'children', type: 'React.ReactNode', default: 'undefined', description: 'Child components to render inside the blur view.' },
];
