/** Blur strength used for the non-iOS-26 glass fallback. */
export const FALLBACK_BLUR_AMOUNT = 70;

/**
 * Upper bound on the tint alpha for the fallback. Liquid glass reads as a
 * subtle tint over blurred content, so a fully opaque tint would look like a
 * solid coloured panel. glassOpacity is scaled into [0, this].
 */
export const MAX_FALLBACK_TINT_ALPHA = 0.35;

/**
 * Builds the overlay colour for the fallback blur. Returns undefined (no tint)
 * for a clear/transparent/missing tint, and scales a hex tint down to a subtle,
 * capped alpha so the fallback approximates glass rather than a solid fill.
 * Non-hex colours (named colours, rgb/rgba) are passed through unchanged.
 */
export function getFallbackOverlayColor(
  tint: string | undefined,
  opacity: number
): string | undefined {
  if (!tint) return undefined;
  const normalized = tint.trim().toLowerCase();
  if (
    normalized === '' ||
    normalized === 'clear' ||
    normalized === 'transparent'
  ) {
    return undefined;
  }

  // Normalize all hex forms React Native accepts (#rgb, #rgba, #rrggbb,
  // #rrggbbaa) to a 6-digit base plus a 0-1 alpha carried by the tint itself.
  const hexBody = /^#([0-9a-f]{3,8})$/.exec(normalized)?.[1];
  let rgb: string | undefined;
  let tintAlpha = 1;
  if (hexBody) {
    if (hexBody.length === 3 || hexBody.length === 4) {
      const [r, g, b, a] = hexBody.split('');
      rgb = `${r}${r}${g}${g}${b}${b}`;
      if (a !== undefined) tintAlpha = parseInt(`${a}${a}`, 16) / 255;
    } else if (hexBody.length === 6 || hexBody.length === 8) {
      rgb = hexBody.slice(0, 6);
      if (hexBody.length === 8)
        tintAlpha = parseInt(hexBody.slice(6), 16) / 255;
    }
  }

  if (rgb) {
    const clamped = Math.max(0, Math.min(1, opacity));
    const alpha = Math.round(
      clamped * MAX_FALLBACK_TINT_ALPHA * tintAlpha * 255
    )
      .toString(16)
      .padStart(2, '0');
    return `#${rgb}${alpha}`;
  }

  // Named colour or rgb()/rgba() — cannot safely re-alpha, pass through as-is.
  return tint;
}
