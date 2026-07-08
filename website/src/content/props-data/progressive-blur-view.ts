import type { PropRow } from './types';

export const progressiveBlurViewProps: PropRow[] = [
  { name: 'blurType', type: 'BlurType', default: "'regular'", description: 'The type of blur effect to apply.' },
  { name: 'blurAmount', type: 'number', default: '20', description: 'Maximum blur radius at the most-blurred point.' },
  {
    name: 'blurRounds',
    type: 'number',
    default: '5',
    platform: 'Android',
    description: 'Number of blur interactions for a smoother effect (1-15).',
  },
  {
    name: 'direction',
    type: "'blurredTopClearBottom' | 'blurredBottomClearTop' | 'blurredCenterClearTopAndBottom'",
    default: "'blurredTopClearBottom'",
    description: 'Direction of the blur gradient.',
  },
  {
    name: 'startOffset',
    type: 'number',
    default: '0.0',
    description: 'Where the gradient plateau starts (0.0-1.0). 0 gives the longest blur body.',
  },
  {
    name: 'reducedTransparencyFallbackColor',
    type: 'string',
    default: "'#FFFFFF'",
    platform: 'iOS',
    description: 'Fallback color when reduced transparency is enabled.',
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
