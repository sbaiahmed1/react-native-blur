import { materialFor } from '../../../../src/materials';
import { materialFraction } from '../../../../src/webBlurUtils';
import { DARK, LIGHT, type Theme } from '../theme';

type Rgb = [number, number, number];

const AA = 4.5;

// The blurAmount MaterialCard and the field sheet use.
const CARD_AMOUNT = 100;

// The blurAmount of the Vibrancy card, a plain BlurView on Android and web.
const VIBRANCY_AMOUNT = 30;

function hex(color: string): Rgb {
  const h = color.replace('#', '');
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)) as Rgb;
}

function over(top: Rgb, alpha: number, bottom: Rgb): Rgb {
  return top.map((c, i) => alpha * c + (1 - alpha) * bottom[i]!) as Rgb;
}

function saturate(rgb: Rgb, s: number): Rgb {
  const luma = 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
  return rgb.map((c) =>
    Math.min(255, Math.max(0, luma + s * (c - luma)))
  ) as Rgb;
}

function luminance(rgb: Rgb): number {
  const [r, g, b] = rgb.map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  }) as Rgb;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: Rgb, b: Rgb): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi! + 0.05) / (lo! + 0.05);
}

/** What a systemMaterial card at `amount` paints over each backdrop color, on every platform. */
function materials(theme: Theme, amount: number): Rgb[] {
  const token = materialFor('systemMaterial', theme.dark ? 'dark' : 'light');
  const f = materialFraction(amount);
  const tint = hex(token.tint);
  const alpha = (f * parseInt(token.tint.slice(7, 9), 16)) / 255;
  const s = 1 + f * (token.saturation - 1);
  return theme.field.map((color) => over(tint, alpha, saturate(hex(color), s)));
}

describe.each([
  ['light', LIGHT],
  ['dark', DARK],
])('%s palette', (_, theme) => {
  const { colors } = theme;

  it('keeps body and muted text at AA on the solid surfaces', () => {
    for (const surface of [colors.bg, colors.surface, colors.grouped]) {
      expect(contrast(hex(colors.text), hex(surface))).toBeGreaterThan(AA);
      expect(contrast(hex(colors.textMuted), hex(surface))).toBeGreaterThan(AA);
    }
  });

  it('keeps muted text at AA on a material card over the backdrop', () => {
    for (const background of materials(theme, CARD_AMOUNT)) {
      expect(contrast(hex(colors.textMuted), background)).toBeGreaterThan(AA);
    }
  });

  it('keeps body text at AA on the Vibrancy card over the backdrop', () => {
    for (const background of materials(theme, VIBRANCY_AMOUNT)) {
      expect(contrast(hex(colors.text), background)).toBeGreaterThan(AA);
    }
  });

  it('keeps white text at AA on the solid accent fill', () => {
    expect(contrast([255, 255, 255], hex(colors.accentFill))).toBeGreaterThan(
      AA
    );
  });
});
