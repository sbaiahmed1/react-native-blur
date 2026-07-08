import type { PropRow } from './types';

export const vibrancyViewProps: PropRow[] = [
  { name: 'blurType', type: 'BlurType', default: "'xlight'", description: 'The type of blur/vibrancy effect to apply.' },
  { name: 'blurAmount', type: 'number', default: '10', description: 'The intensity of the effect (0-100).' },
  { name: 'style', type: 'StyleProp<ViewStyle>', default: 'undefined', description: 'Style object for the vibrancy view.' },
  { name: 'children', type: 'React.ReactNode', default: 'undefined', description: 'Child components to render inside the vibrancy view.' },
];
