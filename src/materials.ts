import type { BlurType } from './ReactNativeBlurViewNativeComponent';

export type MaterialScheme = 'light' | 'dark';

/** A blur material at full strength, what BlurView draws at `blurAmount` 100. */
export type MaterialToken = {
  /** Gaussian blur sigma in pt, dp or CSS px. */
  readonly radius: number;
  /** Saturation of the blurred backdrop, 1 leaves it unchanged. */
  readonly saturation: number;
  /** Tint over the blurred backdrop as `#RRGGBBAA`. */
  readonly tint: string;
  /** True when the iOS material does not fit this model and the token is its closest fit. */
  readonly approximate: boolean;
};

type MaterialStyle =
  | 'extraLight'
  | 'light'
  | 'dark'
  | `system${'UltraThin' | 'Thin' | '' | 'Thick' | 'Chrome'}Material${'Light' | 'Dark'}`;

// UIBlurEffect styles measured on iOS 27.2, generated from the calibration fit.
const MATERIALS: Record<MaterialStyle, MaterialToken> = {
  extraLight: {
    radius: 19.1,
    saturation: 1.77,
    tint: '#F7F7F7CC',
    approximate: false,
  },
  light: {
    radius: 29.4,
    saturation: 1.8,
    tint: '#FFFFFF4D',
    approximate: false,
  },
  dark: {
    radius: 19.1,
    saturation: 1.79,
    tint: '#1C1C1CBA',
    approximate: false,
  },
  systemUltraThinMaterialLight: {
    radius: 22.3,
    saturation: 0.88,
    tint: '#EBEBEB62',
    approximate: false,
  },
  systemThinMaterialLight: {
    radius: 29.4,
    saturation: 1.77,
    tint: '#EEEEEE99',
    approximate: true,
  },
  systemMaterialLight: {
    radius: 29.4,
    saturation: 1.66,
    tint: '#F6F7F6CC',
    approximate: true,
  },
  systemThickMaterialLight: {
    radius: 47.9,
    saturation: 1.8,
    tint: '#F8F8F8F2',
    approximate: true,
  },
  systemChromeMaterialLight: {
    radius: 22.3,
    saturation: 1.8,
    tint: '#F4F5F4BA',
    approximate: true,
  },
  systemUltraThinMaterialDark: {
    radius: 22.3,
    saturation: 0.95,
    tint: '#4141416D',
    approximate: false,
  },
  systemThinMaterialDark: {
    radius: 29.4,
    saturation: 1.53,
    tint: '#30302FA3',
    approximate: false,
  },
  systemMaterialDark: {
    radius: 29.4,
    saturation: 1.63,
    tint: '#272727CB',
    approximate: true,
  },
  systemThickMaterialDark: {
    radius: 47.9,
    saturation: 1.8,
    tint: '#1F1F1FF9',
    approximate: true,
  },
  systemChromeMaterialDark: {
    radius: 22.3,
    saturation: 1.8,
    tint: '#191A1ABA',
    approximate: true,
  },
};

type AdaptiveBlurType =
  | 'regular'
  | 'prominent'
  | `system${'UltraThin' | 'Thin' | '' | 'Thick' | 'Chrome'}Material`;

const ADAPTIVE: Record<
  AdaptiveBlurType,
  Readonly<Record<MaterialScheme, MaterialStyle>>
> = {
  regular: { light: 'light', dark: 'dark' },
  prominent: { light: 'extraLight', dark: 'dark' },
  systemUltraThinMaterial: {
    light: 'systemUltraThinMaterialLight',
    dark: 'systemUltraThinMaterialDark',
  },
  systemThinMaterial: {
    light: 'systemThinMaterialLight',
    dark: 'systemThinMaterialDark',
  },
  systemMaterial: { light: 'systemMaterialLight', dark: 'systemMaterialDark' },
  systemThickMaterial: {
    light: 'systemThickMaterialLight',
    dark: 'systemThickMaterialDark',
  },
  systemChromeMaterial: {
    light: 'systemChromeMaterialLight',
    dark: 'systemChromeMaterialDark',
  },
};

/** The blurTypes whose material follows the color scheme, as on iOS. */
export const ADAPTIVE_BLUR_TYPES = Object.keys(
  ADAPTIVE
) as readonly AdaptiveBlurType[] as readonly BlurType[];

// The iOS style each pinned blurType draws, the same mapping as the iOS view.
const PINNED: Readonly<Record<string, MaterialStyle>> = {
  xlight: 'extraLight',
  light: 'light',
  dark: 'dark',
  extraDark: 'systemThickMaterialDark',
};

const own = (table: object, key: string): boolean =>
  Object.prototype.hasOwnProperty.call(table, key);

/** The full-strength material a blurType draws in a color scheme, unknown types draw `xlight`. */
export function materialFor(
  blurType: string,
  scheme: MaterialScheme
): MaterialToken {
  if (own(ADAPTIVE, blurType)) {
    return MATERIALS[ADAPTIVE[blurType as AdaptiveBlurType][scheme]];
  }
  if (own(PINNED, blurType)) return MATERIALS[PINNED[blurType]!];
  if (own(MATERIALS, blurType)) return MATERIALS[blurType as MaterialStyle];
  return MATERIALS.extraLight;
}
