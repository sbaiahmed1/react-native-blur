import type { PropRow } from './types';

export const progressiveBlurViewProps: PropRow[] = [
  {
    name: 'blurType',
    type: 'BlurType',
    default: "'regular'",
    description:
      'Sets the material whose tint the view draws, at full strength where the blur is strongest and fading out with the blur. The tint fades in as `blurAmount` goes from 0 to 10. `regular`, `prominent` and the `system*Material` types without a `Light` or `Dark` suffix follow Dark Mode.',
  },
  {
    name: 'blurAmount',
    type: 'number',
    default: '20',
    description:
      'Sets the blur radius in points at the most blurred part of the gradient. Android 12 and later and web blur about as strongly as iOS at the same value, up to 48. Android 11 and earlier blur less at most amounts.',
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
    description: 'How much the backdrop is scaled down before it is blurred on Android 11 and earlier (1-16). Lower values keep edges behind the blur from stepping, at a CPU and memory cost that grows with the square of the reduction. Android 12 and later ignore it.',
  },
  {
    name: 'direction',
    type: "'blurredTopClearBottom' | 'blurredBottomClearTop' | 'blurredCenterClearTopAndBottom' | 'blurredLeftToClearRight' | 'blurredRightToClearLeft' | 'blurredTopAndBottomClearCenter'",
    default: "'blurredTopClearBottom'",
    description: 'Direction of the blur gradient.',
  },
  {
    name: 'startOffset',
    type: 'number',
    default: '0.0',
    description:
      'Plateau size (0.0-1.0): grows the fully-blurred zone from the blurred edge, so for edge directions 0 gives the longest fade. For the center direction the fade occupies fixed edge bands and startOffset insets them (max 0.3), so 0 gives the longest center blur body. For the top and bottom direction it sets the fully-blurred band at each edge (max 0.3). Same meaning on all platforms.',
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
    description: 'Sets a color drawn over the whole view, above the blur and below the children.',
  },
  { name: 'style', type: 'StyleProp<ViewStyle>', default: 'undefined', description: 'Style object for the blur view.' },
  { name: 'children', type: 'React.ReactNode', default: 'undefined', description: 'Child components to render inside the blur view.' },
];
