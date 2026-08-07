import type { PropRow } from './types';

export const liquidGlassViewProps: PropRow[] = [
  {
    name: 'glassType',
    type: "GlassType ('clear' | 'regular')",
    default: "'clear'",
    platform: 'iOS 26+, Android',
    description: 'The type of glass effect.',
  },
  {
    name: 'glassTintColor',
    type: 'string',
    default: "'clear'",
    platform: 'iOS 26+, Android',
    description: 'The tint color for the glass effect. Accepts hex colors or color names. On Android it renders as a tint scrim capped at 35% alpha.',
  },
  {
    name: 'glassOpacity',
    type: 'number',
    default: '1.0',
    platform: 'iOS 26+, Android',
    description: 'The opacity of the glass effect (0-1).',
  },
  {
    name: 'isInteractive',
    type: 'boolean',
    default: 'true',
    platform: 'iOS, Android',
    description: 'Controls whether the liquid glass effect is interactive and reacts to touch (iOS 26+; on Android it toggles the press-elasticity animation).',
  },
  {
    name: 'ignoreSafeArea',
    type: 'boolean',
    default: 'true',
    platform: 'iOS',
    description: 'Controls whether the glass effect should ignore all safe area edges.',
  },
  {
    name: 'reducedTransparencyFallbackColor',
    type: 'string',
    default: "'#FFFFFF'",
    platform: 'iOS',
    description: 'Fallback color shown when reduced transparency is enabled, or on iOS versions below 26.',
  },
  { name: 'style', type: 'StyleProp<ViewStyle>', default: 'undefined', description: 'Style object for the glass view.' },
  { name: 'children', type: 'React.ReactNode', default: 'undefined', description: 'Child components to render inside the glass view.' },
];
