import { useMemo, useSyncExternalStore } from 'react';
import { StyleSheet } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import type { MaterialToken } from './materials';
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

/** Number of stacked backdrop-filter layers used for the progressive ramp. */
export const PROGRESSIVE_LAYER_COUNT = 5;

/**
 * Stacked sibling backdrop-filters compound roughly as the root-sum-of-squares
 * of their radii (each later layer re-blurs the earlier layers' output). With
 * radii halving per layer the compound peak lands at ~1.15x the largest radius,
 * so radii are scaled down by ~0.87 to make the peak match `blurAmount`.
 */
export const PROGRESSIVE_RADIUS_COMPENSATION = 0.87;

/** Gaussian sigma in px at the plateau per unit of `blurAmount`, as iOS and Android draw it. */
export const PROGRESSIVE_SIGMA_PER_AMOUNT = 2;

/** The plateau sigma in px stops growing here (amount 48), as on Android. */
export const PROGRESSIVE_CAP = 96;

/** Stops per fade of the progressive tint, whose alpha follows the t^3 curve of the iOS blur mask. */
const TINT_STOPS = 9;

/** The progressive blurAmount at which the tint reaches full strength, so a view at 0 draws no tint. */
export const PROGRESSIVE_TINT_FULL_AMOUNT = 10;

const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

/** How much of the progressive tint draws at `amount`: none at 0, all of it from `PROGRESSIVE_TINT_FULL_AMOUNT` and for NaN. */
export function progressiveTintScale(amount: number): number {
  if (Number.isNaN(amount)) return 1;
  return clamp(amount / PROGRESSIVE_TINT_FULL_AMOUNT, 0, 1);
}

/** Formats a number for CSS without float noise (2 decimals max). */
const cssNumber = (value: number): number => Number(value.toFixed(2));

let backdropFilterSupport: boolean | undefined;

/**
 * Feature-detects CSS backdrop-filter. Safe to call during server-side /
 * static rendering (Expo `web.output: "static"` renders in Node, where the
 * CSS API is absent) — it simply reports false there, leaving the tint-only
 * fallback styles. Memoized once the CSS API is available.
 */
export function supportsBackdropFilter(): boolean {
  if (backdropFilterSupport === undefined) {
    const css = (
      globalThis as {
        CSS?: { supports?: (property: string, value: string) => boolean };
      }
    ).CSS;
    if (typeof css?.supports !== 'function') return false;
    backdropFilterSupport =
      css.supports('backdrop-filter', 'blur(1px)') ||
      css.supports('-webkit-backdrop-filter', 'blur(1px)');
  }
  return backdropFilterSupport;
}

// Browser support does not change during a mounted component's lifetime.
const subscribeToBackdropSupport = () => () => {};
const serverBackdropSupport = () => false;

/** Keep server/hydration markup identical without delaying client-only mounts. */
export function useBackdropFilterSupport(): boolean {
  return useSyncExternalStore(
    subscribeToBackdropSupport,
    supportsBackdropFilter,
    serverBackdropSupport
  );
}

/** The fraction of the material a BlurView `blurAmount` draws, as iOS reads it: 0-100 maps to 0-1, NaN to 1. */
export function materialFraction(amount: number): number {
  if (Number.isNaN(amount)) return 1;
  return clamp(amount, 0, 100) / 100;
}

/** A token tint (`#RRGGBBAA`) as CSS `rgba()`, its alpha multiplied by `alphaScale`. */
export function tintRgba(tint: string, alphaScale = 1): string {
  const [r, g, b, a] = [1, 3, 5, 7].map((i) =>
    parseInt(tint.slice(i, i + 2), 16)
  ) as [number, number, number, number];
  const alpha = Number(((a / 255) * alphaScale).toFixed(3));
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Builds the style for a uniform blur layer: the material at the fraction
 * `blurAmount` asks for, its tint as background and, when supported, its blur
 * and saturation as a backdrop filter. Without backdrop-filter support the
 * tint alone remains (graceful degradation, same strategy as expo-blur).
 */
export function blurLayerStyle(
  material: MaterialToken,
  blurAmount: number,
  hasBackdropFilter = supportsBackdropFilter()
): WebBlurStyle {
  const f = materialFraction(blurAmount);
  if (f === 0) return { backgroundColor: 'transparent' };
  const style: WebBlurStyle = { backgroundColor: tintRgba(material.tint, f) };
  if (hasBackdropFilter) {
    const radius = cssNumber(f * material.radius);
    const saturation = cssNumber(1 + f * (material.saturation - 1));
    const filter = `blur(${radius}px) saturate(${saturation})`;
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

/** The gradient axis of an edge direction, pointing from the blurred edge to the clear one. */
const axisFor = (direction: ProgressiveBlurDirection): string => {
  switch (direction) {
    case 'blurredBottomClearTop':
      return 'to top';
    case 'blurredLeftToClearRight':
      return 'to right';
    case 'blurredRightToClearLeft':
      return 'to left';
    default:
      return 'to bottom';
  }
};

const maskForLayer = (
  direction: ProgressiveBlurDirection,
  startOffset: number,
  layer: number
): string => {
  const n = PROGRESSIVE_LAYER_COUNT;

  if (direction === 'blurredCenterClearTopAndBottom') {
    // Same geometry as the native backends: a clear inset of `startOffset` at
    // each edge, a 20% fade band, and a solid plateau around the center line
    // (clamped to 0.3, where the plateau collapses to the center). Band edges
    // as distances from the 50% center line: the plateau reaches
    // (30 - inset*100)% out, the fade band spans the next 20%.
    const inset = Math.min(startOffset, 0.3);
    const q = (j: number) => 30 - inset * 100 + (20 * j) / n;
    const inner = q(n - layer);
    const outer = q(n - layer + 1);
    return (
      `linear-gradient(to bottom, transparent ${pct(50 - outer)}, ` +
      `black ${pct(50 - inner)}, black ${pct(50 + inner)}, ` +
      `transparent ${pct(50 + outer)})`
    );
  }

  if (direction === 'blurredTopAndBottomClearCenter') {
    // The center mask mirrored: a blurred plateau of `startOffset` at each edge, a 20% fade, then clear.
    const inset = Math.min(startOffset, 0.3) * 100;
    const solidEnd = inset + (20 * (n - layer)) / n;
    const fadeEnd = inset + (20 * (n - layer + 1)) / n;
    return (
      `linear-gradient(to bottom, black 0%, black ${pct(solidEnd)}, transparent ${pct(fadeEnd)}, ` +
      `transparent ${pct(100 - fadeEnd)}, black ${pct(100 - solidEnd)}, black 100%)`
    );
  }

  // Band edges measured from the blurred edge (0%).
  const boundary = (j: number) =>
    startOffset * 100 + ((1 - startOffset) * 100 * j) / n;
  const axis = axisFor(direction);
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
 * `blurAmount` sets the plateau blur as on iOS: `PROGRESSIVE_SIGMA_PER_AMOUNT`
 * px of sigma per unit, capped at `PROGRESSIVE_CAP` px.
 */
export function getProgressiveLayers(
  direction: ProgressiveBlurDirection,
  startOffset: number,
  blurAmount: number
): ProgressiveLayer[] {
  const s = clamp(startOffset, 0, 1);
  const sigma = clamp(
    PROGRESSIVE_SIGMA_PER_AMOUNT * blurAmount,
    0,
    PROGRESSIVE_CAP
  );
  const maxRadius = sigma * PROGRESSIVE_RADIUS_COMPENSATION;
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
 * Gradient for the tint layer of a progressive blur: the token `tint`
 * (`#RRGGBBAA`) at full strength over the blurred plateau, its alpha falling
 * as (1 - u)^3 across each fade, the t^3 curve of the iOS blur mask read from
 * the blurred side.
 */
export function getProgressiveTintGradient(
  direction: ProgressiveBlurDirection,
  startOffset: number,
  tint: string,
  alphaScale = 1
): string {
  const s = clamp(startOffset, 0, 1);
  // One fade from `from` (u = 0) to `to` (u = 1), with the alpha rising when `rising`.
  const fade = (from: number, to: number, rising: boolean): string[] =>
    Array.from({ length: TINT_STOPS }, (_, i) => {
      const u = i / (TINT_STOPS - 1);
      const t = rising ? u : 1 - u;
      return `${tintRgba(tint, alphaScale * t * t * t)} ${pct(from + (to - from) * u)}`;
    });

  if (
    direction === 'blurredCenterClearTopAndBottom' ||
    direction === 'blurredTopAndBottomClearCenter'
  ) {
    // Same geometry as the center masks: a 20% fade after an inset of `startOffset` (clamped to 0.3) at each edge.
    const center = direction === 'blurredCenterClearTopAndBottom';
    const inset = Math.min(s, 0.3) * 100;
    const stops = [
      ...fade(inset, inset + 20, center),
      ...fade(80 - inset, 100 - inset, !center),
    ];
    return `linear-gradient(to bottom, ${stops.join(', ')})`;
  }

  const stops = fade(s * 100, 100, false);
  return `linear-gradient(${axisFor(direction)}, ${stops.join(', ')})`;
}

const CORNER_RADIUS_KEYS = [
  'borderRadius',
  'borderTopLeftRadius',
  'borderTopRightRadius',
  'borderBottomLeftRadius',
  'borderBottomRightRadius',
  'borderTopStartRadius',
  'borderTopEndRadius',
  'borderBottomStartRadius',
  'borderBottomEndRadius',
  'borderStartStartRadius',
  'borderStartEndRadius',
  'borderEndStartRadius',
  'borderEndEndRadius',
] as const;

/** The container's corner radii, so each absolute layer clips its backdrop to the same rounded shape. */
export function useCornerRadii(style: StyleProp<ViewStyle>): ViewStyle {
  const flat = (StyleSheet.flatten(style) ?? {}) as ViewStyle;
  const key = JSON.stringify(CORNER_RADIUS_KEYS.map((name) => flat[name]));
  return useMemo(() => {
    const values = JSON.parse(key) as Array<ViewStyle['borderRadius'] | null>;
    const radii: Record<string, ViewStyle['borderRadius']> = {};
    CORNER_RADIUS_KEYS.forEach((name, index) => {
      const value = values[index];
      if (value != null) radii[name] = value;
    });
    return radii as ViewStyle;
  }, [key]);
}
