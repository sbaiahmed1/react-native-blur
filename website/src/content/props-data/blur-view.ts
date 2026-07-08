import type { PropRow } from './types';

export const blurViewProps: PropRow[] = [
  { name: 'blurType', type: 'BlurType', default: "'xlight'", description: 'The type of blur effect to apply.' },
  { name: 'blurAmount', type: 'number', default: '10', description: 'The intensity of the blur effect (0-100).' },
  {
    name: 'blurRounds',
    type: 'number',
    default: '5',
    platform: 'Android',
    description: 'Number of blur interactions for a smoother effect (1-15).',
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
