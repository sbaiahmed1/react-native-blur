import { BLUR_TYPE_TO_BACKGROUND } from '../../../../src/webBlurUtils';
import { DARK, LIGHT, type Theme } from '../theme';

type Rgb = [number, number, number];

const AA = 4.5;

function hex(color: string): Rgb {
  const h = color.replace('#', '');
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)) as Rgb;
}

function rgba(color: string): { rgb: Rgb; alpha: number } {
  const [r, g, b, a] = color.match(/[\d.]+/g)!.map(Number) as number[];
  return { rgb: [r!, g!, b!], alpha: a! };
}

function over(top: Rgb, alpha: number, bottom: Rgb): Rgb {
  return top.map((c, i) => alpha * c + (1 - alpha) * bottom[i]!) as Rgb;
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

/** What a MaterialCard paints over each backdrop color: the web tint and the Android overlay (BlurType.kt). */
function materials(theme: Theme): [string, Rgb][] {
  const web = rgba(
    BLUR_TYPE_TO_BACKGROUND[
      theme.dark ? 'systemMaterialDark' : 'systemMaterialLight'
    ]
  );
  const android = theme.dark
    ? { rgb: [65, 60, 60] as Rgb, alpha: 215 / 255 }
    : { rgb: [245, 245, 245] as Rgb, alpha: 140 / 255 };
  return theme.field.flatMap((color): [string, Rgb][] => [
    [`web over ${color}`, over(web.rgb, web.alpha, hex(color))],
    [`android over ${color}`, over(android.rgb, android.alpha, hex(color))],
  ]);
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
    for (const [, background] of materials(theme)) {
      expect(contrast(hex(colors.textMuted), background)).toBeGreaterThan(AA);
    }
  });

  it('keeps white text at AA on the solid accent fill', () => {
    expect(contrast([255, 255, 255], hex(colors.accentFill))).toBeGreaterThan(
      AA
    );
  });
});
