import type { PropRow } from './types';

export const liquidGlassContainerProps: PropRow[] = [
  {
    name: 'spacing',
    type: 'number',
    default: '0',
    platform: 'iOS 26+',
    description: 'The spacing value between glass elements in the container.',
  },
  { name: 'style', type: 'StyleProp<ViewStyle>', default: 'undefined', description: 'Style object for the glass container.' },
  {
    name: 'children',
    type: 'React.ReactNode',
    default: 'undefined',
    description: 'Child components to render inside the glass container (typically LiquidGlassView components).',
  },
];
