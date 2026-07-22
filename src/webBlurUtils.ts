import type { ViewStyle } from 'react-native';
import type { BlurType } from './ReactNativeBlurViewNativeComponent';
import type { ProgressiveBlurDirection } from './ReactNativeProgressiveBlurViewNativeComponent';

/**
 * ViewStyle extended with the web-only CSS properties the web implementations
 * rely on. react-native-web passes unknown style properties through to the DOM,
 * but RN's ViewStyle type does not declare them. Dynamic (inline) styles are
 * NOT auto-prefixed by react-native-web, so the Webkit twins must always be set
 * alongside the unprefixed properties.
 */
export type WebBlurStyle = ViewStyle & {
  backdropFilter?: string;
  WebkitBackdropFilter?: string;
  maskImage?: string;
  WebkitMaskImage?: string;
  backgroundImage?: string;
};

/**
 * Scale from the 0-100 `blurAmount` prop to a CSS blur radius in px.
 * 100 → 40px, calibrated side-by-side against the iOS simulator so common
 * amounts (40-70) diffuse the backdrop like UIVisualEffectView does.
 */
export const WEB_BLUR_RADIUS_SCALE = 0.4;

/** Number of stacked backdrop-filter layers used for the progressive ramp. */
export const PROGRESSIVE_LAYER_COUNT = 5;

/**
 * Stacked sibling backdrop-filters compound roughly as the root-sum-of-squares
 * of their radii (each later layer re-blurs the earlier layers' output). With
 * radii halving per layer the compound peak lands at ~1.15x the largest radius,
 * so radii are scaled down by ~0.87 to make the peak match `blurAmount`.
 */
export const PROGRESSIVE_RADIUS_COMPENSATION = 0.87;

/**
 * Maps native blur types to semi-transparent CSS background colours that
 * approximate the tint each type produces on iOS: light variants use
 * white-based overlays, dark variants black-based ones, and the system
 * materials follow the iOS ultra-thin → chrome opacity hierarchy.
 */
export const BLUR_TYPE_TO_BACKGROUND: Record<BlurType, string> = {
  // Base types
  xlight: 'rgba(255, 255, 255, 0.6)',
  light: 'rgba(255, 255, 255, 0.4)',
  dark: 'rgba(0, 0, 0, 0.5)',
  extraDark: 'rgba(0, 0, 0, 0.75)',
  regular: 'rgba(255, 255, 255, 0.2)',
  prominent: 'rgba(255, 255, 255, 0.35)',

  // System materials (default / adaptive)
  systemUltraThinMaterial: 'rgba(255, 255, 255, 0.1)',
  systemThinMaterial: 'rgba(255, 255, 255, 0.2)',
  systemMaterial: 'rgba(255, 255, 255, 0.3)',
  systemThickMaterial: 'rgba(255, 255, 255, 0.45)',
  systemChromeMaterial: 'rgba(255, 255, 255, 0.5)',

  // System materials (light)
  systemUltraThinMaterialLight: 'rgba(255, 255, 255, 0.15)',
  systemThinMaterialLight: 'rgba(255, 255, 255, 0.25)',
  systemMaterialLight: 'rgba(255, 255, 255, 0.4)',
  systemThickMaterialLight: 'rgba(255, 255, 255, 0.55)',
  systemChromeMaterialLight: 'rgba(255, 255, 255, 0.6)',

  // System materials (dark)
  systemUltraThinMaterialDark: 'rgba(0, 0, 0, 0.2)',
  systemThinMaterialDark: 'rgba(0, 0, 0, 0.3)',
  systemMaterialDark: 'rgba(0, 0, 0, 0.45)',
  systemThickMaterialDark: 'rgba(0, 0, 0, 0.6)',
  systemChromeMaterialDark: 'rgba(0, 0, 0, 0.7)',
};

const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

/** Formats a number for CSS without float noise (2 decimals max). */
const cssNumber = (value: number): number => Number(value.toFixed(2));

let backdropFilterSupport: boolean | undefined;

/**
 * Feature-detects CSS backdrop-filter. Safe to call during server-side /
 * static rendering (Expo `web.output: "static"` renders in Node, where the
 * CSS API is absent) — it simply reports false there, leaving the tint-only
 * fallback styles. Memoized after the first call.
 */
export function supportsBackdropFilter(): boolean {
  if (backdropFilterSupport === undefined) {
    const css = (
      globalThis as {
        CSS?: { supports?: (property: string, value: string) => boolean };
      }
    ).CSS;
    backdropFilterSupport =
      typeof css?.supports === 'function' &&
      (css.supports('backdrop-filter', 'blur(1px)') ||
        css.supports('-webkit-backdrop-filter', 'blur(1px)'));
  }
  return backdropFilterSupport;
}

/**
 * Builds the style for a uniform blur layer: the blurType tint as background
 * plus, when supported, a backdrop blur scaled from the 0-100 `blurAmount`.
 * Without backdrop-filter support the tint alone remains (graceful
 * degradation, same strategy as expo-blur).
 */
export function getBlurLayerStyle(
  blurType: BlurType,
  blurAmount: number
): WebBlurStyle {
  const style: WebBlurStyle = {
    backgroundColor:
      BLUR_TYPE_TO_BACKGROUND[blurType] ?? BLUR_TYPE_TO_BACKGROUND.regular,
  };
  if (supportsBackdropFilter()) {
    const radius = cssNumber(clamp(blurAmount, 0, 100) * WEB_BLUR_RADIUS_SCALE);
    const filter = `blur(${radius}px) saturate(180%)`;
    style.backdropFilter = filter;
    style.WebkitBackdropFilter = filter;
  }
  return style;
}

/** One layer of the stacked progressive blur. */
export interface ProgressiveLayer {
  /** Backdrop blur radius in px. */
  radius: number;
  /** CSS mask limiting where this layer's blur is visible. */
  maskImage: string;
}

const pct = (value: number): string => `${cssNumber(value)}%`;

const maskForLayer = (
  direction: ProgressiveBlurDirection,
  startOffset: number,
  layer: number
): string => {
  const n = PROGRESSIVE_LAYER_COUNT;

  if (direction === 'blurredCenterClearTopAndBottom') {
    // Band edges as distances from the 50% center line.
    const q = (j: number) =>
      startOffset * 50 + ((1 - startOffset) * 50 * j) / n;
    const inner = q(n - layer);
    const outer = q(n - layer + 1);
    return (
      `linear-gradient(to bottom, transparent ${pct(50 - outer)}, ` +
      `black ${pct(50 - inner)}, black ${pct(50 + inner)}, ` +
      `transparent ${pct(50 + outer)})`
    );
  }

  // Band edges measured from the blurred edge (0%).
  const boundary = (j: number) =>
    startOffset * 100 + ((1 - startOffset) * 100 * j) / n;
  const axis = direction === 'blurredBottomClearTop' ? 'to top' : 'to bottom';
  const solidEnd = boundary(n - layer);
  const fadeEnd = boundary(n - layer + 1);
  return `linear-gradient(${axis}, black 0%, black ${pct(solidEnd)}, transparent ${pct(fadeEnd)})`;
};

/**
 * Computes the stacked layers for a progressive blur: every layer covers the
 * fully-blurred plateau and fades out one gradient band further than the next
 * stronger one, halving the radius per band. Stacked, they produce a smooth
 * blur ramp from `blurAmount` px at the blurred edge down to 0 at the clear
 * edge — a true radius ramp rather than a single blur fading in opacity.
 *
 * `blurAmount` is the maximum radius in px (matching the native components,
 * where it is a pixel radius, unlike BlurView's 0-100 scale).
 */
export function getProgressiveLayers(
  direction: ProgressiveBlurDirection,
  startOffset: number,
  blurAmount: number
): ProgressiveLayer[] {
  const s = clamp(startOffset, 0, 1);
  const maxRadius = Math.max(blurAmount, 0) * PROGRESSIVE_RADIUS_COMPENSATION;
  const layers: ProgressiveLayer[] = [];
  for (let layer = 1; layer <= PROGRESSIVE_LAYER_COUNT; layer++) {
    layers.push({
      radius: cssNumber(maxRadius / 2 ** (PROGRESSIVE_LAYER_COUNT - layer)),
      maskImage: maskForLayer(direction, s, layer),
    });
  }
  return layers;
}

/**
 * Gradient for the tint layer of a progressive blur: the blurType tint at full
 * strength over the blurred plateau, fading to transparent at the clear edge,
 * following the same direction as the blur ramp.
 */
export function getProgressiveTintGradient(
  direction: ProgressiveBlurDirection,
  startOffset: number,
  tint: string
): string {
  const s = clamp(startOffset, 0, 1);

  if (direction === 'blurredCenterClearTopAndBottom') {
    const inner = s * 50;
    return (
      `linear-gradient(to bottom, transparent 0%, ${tint} ${pct(50 - inner)}, ` +
      `${tint} ${pct(50 + inner)}, transparent 100%)`
    );
  }

  const axis = direction === 'blurredBottomClearTop' ? 'to top' : 'to bottom';
  return `linear-gradient(${axis}, ${tint} 0%, ${tint} ${pct(s * 100)}, transparent 100%)`;
}
