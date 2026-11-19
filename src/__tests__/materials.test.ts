import { ADAPTIVE_BLUR_TYPES, materialFor } from '../materials';
import type { MaterialScheme } from '../materials';
import type { BlurType } from '../ReactNativeBlurViewNativeComponent';

const BLUR_TYPES: BlurType[] = [
  'xlight',
  'light',
  'dark',
  'extraDark',
  'regular',
  'prominent',
  'systemUltraThinMaterial',
  'systemThinMaterial',
  'systemMaterial',
  'systemThickMaterial',
  'systemChromeMaterial',
  'systemUltraThinMaterialLight',
  'systemThinMaterialLight',
  'systemMaterialLight',
  'systemThickMaterialLight',
  'systemChromeMaterialLight',
  'systemUltraThinMaterialDark',
  'systemThinMaterialDark',
  'systemMaterialDark',
  'systemThickMaterialDark',
  'systemChromeMaterialDark',
];

const SCHEMES: MaterialScheme[] = ['light', 'dark'];

const channels = (hex: string): number[] =>
  [1, 3, 5, 7].map((i) => parseInt(hex.slice(i, i + 2), 16));

describe('materialFor', () => {
  it('pins the classic styles', () => {
    const xlight = materialFor('xlight', 'light');
    expect(Math.abs(xlight.radius - 19.1)).toBeLessThanOrEqual(0.2);
    expect(Math.abs(xlight.saturation - 1.77)).toBeLessThanOrEqual(0.02);
    channels(xlight.tint).forEach((value, i) => {
      expect(Math.abs(value - channels('#F7F7F7CC')[i]!)).toBeLessThanOrEqual(
        1
      );
    });
    expect(materialFor('regular', 'light')).toEqual(
      materialFor('light', 'light')
    );
    expect(materialFor('regular', 'dark')).toEqual(materialFor('dark', 'dark'));
    expect(materialFor('prominent', 'light')).toEqual(
      materialFor('xlight', 'light')
    );
  });

  it('resolves adaptive types per scheme', () => {
    expect(materialFor('systemMaterial', 'light')).toEqual(
      materialFor('systemMaterialLight', 'light')
    );
    expect(materialFor('systemMaterial', 'dark')).toEqual(
      materialFor('systemMaterialDark', 'light')
    );
    expect(materialFor('systemMaterialLight', 'dark')).toEqual(
      materialFor('systemMaterialLight', 'light')
    );
  });

  it('changes with the scheme only for the adaptive types', () => {
    for (const blurType of BLUR_TYPES) {
      const changes =
        JSON.stringify(materialFor(blurType, 'light')) !==
        JSON.stringify(materialFor(blurType, 'dark'));
      expect([blurType, changes]).toEqual([
        blurType,
        ADAPTIVE_BLUR_TYPES.includes(blurType),
      ]);
    }
  });

  it('maps extraDark to the thick dark style', () => {
    expect(materialFor('extraDark', 'light')).toEqual(
      materialFor('systemThickMaterialDark', 'light')
    );
  });

  it('falls back to xlight on an unknown type', () => {
    expect(materialFor('unknown', 'dark')).toEqual(
      materialFor('xlight', 'light')
    );
  });

  it('marks the chrome styles approximate', () => {
    for (const scheme of SCHEMES) {
      expect(materialFor('systemChromeMaterial', scheme).approximate).toBe(
        true
      );
    }
    expect(materialFor('xlight', 'light').approximate).toBe(false);
  });

  it('keeps every tint channel in 0-255 and every saturation in 0.5-3', () => {
    for (const blurType of BLUR_TYPES) {
      for (const scheme of SCHEMES) {
        const token = materialFor(blurType, scheme);
        expect(token.tint).toMatch(/^#[0-9A-F]{8}$/);
        expect(token.saturation).toBeGreaterThanOrEqual(0.5);
        expect(token.saturation).toBeLessThanOrEqual(3);
        expect(token.radius).toBeGreaterThan(0);
      }
    }
  });
});
