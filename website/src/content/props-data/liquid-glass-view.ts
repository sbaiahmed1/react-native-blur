import type { PropRow } from './types';

export const liquidGlassViewProps: PropRow[] = [
  {
    name: 'glassType',
    type: "GlassType ('clear' | 'regular')",
    default: "'clear'",
    platform: 'iOS 26+, Android 13+',
    description: 'The type of glass effect.',
  },
  {
    name: 'glassTintColor',
    type: 'string',
    default: "'clear'",
    platform: 'iOS 26+, Android 13+',
    description: 'The tint color for the glass effect. Accepts hex colors or color names. Modulated by the glass shader on both platforms; on fallback paths it tints the BlurView/web overlay.',
  },
  {
    name: 'glassOpacity',
    type: 'number',
    default: '1.0',
    platform: 'iOS 26+, Android 13+',
    description: 'The opacity of the glass effect (0-1). Also scales the fallback overlay tint on platforms without native glass.',
  },
  {
    name: 'isInteractive',
    type: 'boolean',
    default: 'true',
    platform: 'iOS 26+, Android 13+',
    description: 'Controls whether the liquid glass effect is interactive and reacts to touch (iOS 26+; on Android it toggles an iOS-style press-scale animation). No effect on fallback paths.',
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
