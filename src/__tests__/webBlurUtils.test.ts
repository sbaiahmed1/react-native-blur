import { materialFor } from '../materials';
import {
  PROGRESSIVE_CAP,
  PROGRESSIVE_LAYER_COUNT,
  PROGRESSIVE_RADIUS_COMPENSATION,
  PROGRESSIVE_SIGMA_PER_AMOUNT,
  blurLayerStyle,
  getProgressiveLayers,
  getProgressiveTintGradient,
  materialFraction,
  supportsBackdropFilter,
  tintRgba,
} from '../webBlurUtils';

describe('supportsBackdropFilter', () => {
  it('reports false in a CSS-less environment (Node / SSR)', () => {
    expect(supportsBackdropFilter()).toBe(false);
  });
});

describe('materialFraction', () => {
  it('fraction clamps edge amounts as iOS does', () => {
    expect(materialFraction(0)).toBe(0);
    expect(materialFraction(-5)).toBe(0);
    expect(materialFraction(Number.NaN)).toBe(1);
    expect(materialFraction(Number.POSITIVE_INFINITY)).toBe(1);
    expect(materialFraction(Number.NEGATIVE_INFINITY)).toBe(0);
    expect(materialFraction(250)).toBe(1);
    expect(materialFraction(50)).toBe(0.5);
  });
});

describe('tintRgba', () => {
  it('scales only the alpha of a token tint', () => {
    expect(tintRgba('#F6F7F6CC')).toBe('rgba(246, 247, 246, 0.8)');
    expect(tintRgba('#F6F7F6CC', 0.5)).toBe('rgba(246, 247, 246, 0.4)');
  });
});

describe('blurLayerStyle', () => {
  const material = materialFor('systemMaterial', 'light');

  it('scales the material with the amount', () => {
    expect(blurLayerStyle(material, 50, true)).toEqual({
      backgroundColor: 'rgba(246, 247, 246, 0.4)',
      backdropFilter: 'blur(14.7px) saturate(1.33)',
      WebkitBackdropFilter: 'blur(14.7px) saturate(1.33)',
    });
    expect(blurLayerStyle(material, 100, true).backdropFilter).toBe(
      'blur(29.4px) saturate(1.66)'
    );
  });

  it('draws nothing at amount 0', () => {
    expect(blurLayerStyle(material, 0, true)).toEqual({
      backgroundColor: 'transparent',
    });
    expect(blurLayerStyle(material, -5, true)).toEqual({
      backgroundColor: 'transparent',
    });
  });

  it('degrades to the scaled tint without backdrop-filter support', () => {
    expect(blurLayerStyle(materialFor('dark', 'light'), 40, false)).toEqual({
      backgroundColor: 'rgba(28, 28, 28, 0.292)',
    });
  });

  it('detects backdrop-filter support by default', () => {
    jest.isolateModules(() => {
      (globalThis as { CSS?: unknown }).CSS = {
        supports: jest.fn().mockReturnValue(true),
      };
      try {
        // Fresh module instance so the memoized support check re-runs.
        const utils =
          require('../webBlurUtils') as typeof import('../webBlurUtils');
        const style = utils.blurLayerStyle(material, 400);
        expect(style.backdropFilter).toBe('blur(29.4px) saturate(1.66)');
        expect(style.WebkitBackdropFilter).toBe(style.backdropFilter);
      } finally {
        delete (globalThis as { CSS?: unknown }).CSS;
      }
    });
  });
});

describe('getProgressiveLayers', () => {
  it('halves the radius per layer down from the compensated maximum', () => {
    const layers = getProgressiveLayers('blurredTopClearBottom', 0, 20);
    expect(layers).toHaveLength(PROGRESSIVE_LAYER_COUNT);
    expect(layers.map((l) => l.radius)).toEqual([2.17, 4.35, 8.7, 17.4, 34.8]);
  });

  it('progressive strength is 2 px per unit capped at 96', () => {
    expect(PROGRESSIVE_SIGMA_PER_AMOUNT).toBe(2);
    expect(PROGRESSIVE_CAP).toBe(96);
    const strongest = (amount: number) =>
      getProgressiveLayers('blurredTopClearBottom', 0, amount)[
        PROGRESSIVE_LAYER_COUNT - 1
      ]?.radius;
    expect(strongest(20)).toBeCloseTo(40 * PROGRESSIVE_RADIUS_COMPENSATION, 2);
    expect(strongest(48)).toBeCloseTo(96 * PROGRESSIVE_RADIUS_COMPENSATION, 2);
    expect(strongest(60)).toBeCloseTo(96 * PROGRESSIVE_RADIUS_COMPENSATION, 2);
  });

  it('anchors every mask at the blurred edge, fading one band further per weaker layer', () => {
    const layers = getProgressiveLayers('blurredTopClearBottom', 0, 20);
    expect(layers[4]?.maskImage).toBe(
      'linear-gradient(to bottom, black 0%, black 0%, transparent 20%)'
    );
    expect(layers[2]?.maskImage).toBe(
      'linear-gradient(to bottom, black 0%, black 40%, transparent 60%)'
    );
    expect(layers[0]?.maskImage).toBe(
      'linear-gradient(to bottom, black 0%, black 80%, transparent 100%)'
    );
  });

  it('flips the gradient axis for blurredBottomClearTop', () => {
    const layers = getProgressiveLayers('blurredBottomClearTop', 0, 20);
    expect(layers[4]?.maskImage).toBe(
      'linear-gradient(to top, black 0%, black 0%, transparent 20%)'
    );
  });

  it('runs the gradient along x for the left and right directions', () => {
    expect(
      getProgressiveLayers('blurredLeftToClearRight', 0, 20)[4]?.maskImage
    ).toBe('linear-gradient(to right, black 0%, black 0%, transparent 20%)');
    expect(
      getProgressiveLayers('blurredRightToClearLeft', 0, 20)[4]?.maskImage
    ).toBe('linear-gradient(to left, black 0%, black 0%, transparent 20%)');
  });

  it('mirrors the bands around the center for blurredCenterClearTopAndBottom', () => {
    const layers = getProgressiveLayers(
      'blurredCenterClearTopAndBottom',
      0,
      20
    );
    expect(layers[4]?.maskImage).toBe(
      'linear-gradient(to bottom, transparent 16%, black 20%, black 80%, transparent 84%)'
    );
    expect(layers[0]?.maskImage).toBe(
      'linear-gradient(to bottom, transparent 0%, black 4%, black 96%, transparent 100%)'
    );
  });

  it('blurs both edges and clears the center for blurredTopAndBottomClearCenter', () => {
    const layers = getProgressiveLayers(
      'blurredTopAndBottomClearCenter',
      0,
      20
    );
    expect(layers[4]?.maskImage).toBe(
      'linear-gradient(to bottom, black 0%, black 0%, transparent 4%, transparent 96%, black 100%, black 100%)'
    );
    expect(layers[0]?.maskImage).toBe(
      'linear-gradient(to bottom, black 0%, black 16%, transparent 20%, transparent 80%, black 84%, black 100%)'
    );
    expect(
      getProgressiveLayers('blurredTopAndBottomClearCenter', 1, 20)[0]
        ?.maskImage
    ).toBe(
      'linear-gradient(to bottom, black 0%, black 46%, transparent 50%, transparent 50%, black 54%, black 100%)'
    );
  });

  it('delays the ramp behind a fully-blurred plateau via startOffset', () => {
    const layers = getProgressiveLayers('blurredTopClearBottom', 0.3, 20);
    expect(layers[4]?.maskImage).toBe(
      'linear-gradient(to bottom, black 0%, black 30%, transparent 44%)'
    );
    expect(layers[0]?.maskImage).toBe(
      'linear-gradient(to bottom, black 0%, black 86%, transparent 100%)'
    );
  });

  it('clamps startOffset and never returns negative radii', () => {
    const layers = getProgressiveLayers('blurredTopClearBottom', 2, -5);
    expect(layers[4]?.maskImage).toBe(
      'linear-gradient(to bottom, black 0%, black 100%, transparent 100%)'
    );
    for (const layer of layers) {
      expect(layer.radius).toBe(0);
    }
  });
});

describe('getProgressiveTintGradient', () => {
  const RED = '#FF0000FF';
  const stops = (gradient: string) =>
    gradient
      .replace(/^linear-gradient\([^,]+, /, '')
      .replace(/\)$/, '')
      .split(/, (?=rgba)/);

  it('progressive tint follows the cube', () => {
    expect(getProgressiveTintGradient('blurredTopClearBottom', 0, RED)).toBe(
      'linear-gradient(to bottom, rgba(255, 0, 0, 1) 0%, rgba(255, 0, 0, 0.67) 12.5%, ' +
        'rgba(255, 0, 0, 0.422) 25%, rgba(255, 0, 0, 0.244) 37.5%, rgba(255, 0, 0, 0.125) 50%, ' +
        'rgba(255, 0, 0, 0.053) 62.5%, rgba(255, 0, 0, 0.016) 75%, rgba(255, 0, 0, 0.002) 87.5%, ' +
        'rgba(255, 0, 0, 0) 100%)'
    );
  });

  it('scales the token alpha and starts the fade after the plateau', () => {
    const gradient = getProgressiveTintGradient(
      'blurredBottomClearTop',
      0.3,
      '#00000080'
    );
    expect(gradient.startsWith('linear-gradient(to top, ')).toBe(true);
    const list = stops(gradient);
    expect(list).toHaveLength(9);
    expect(list[0]).toBe(`${tintRgba('#00000080')} 30%`);
    expect(list[4]).toBe(`${tintRgba('#00000080', 0.125)} 65%`);
    expect(list[8]).toBe('rgba(0, 0, 0, 0) 100%');
  });

  it('runs along x for the left and right directions', () => {
    expect(
      getProgressiveTintGradient('blurredLeftToClearRight', 0, RED)
    ).toMatch(/^linear-gradient\(to right, /);
    expect(
      getProgressiveTintGradient('blurredRightToClearLeft', 0, RED)
    ).toMatch(/^linear-gradient\(to left, /);
  });

  it('eases into the center plateau from both edges for blurredCenterClearTopAndBottom', () => {
    const list = stops(
      getProgressiveTintGradient('blurredCenterClearTopAndBottom', 0.2, RED)
    );
    expect(list).toHaveLength(18);
    expect(list[0]).toBe('rgba(255, 0, 0, 0) 20%');
    expect(list[4]).toBe('rgba(255, 0, 0, 0.125) 30%');
    expect(list[8]).toBe('rgba(255, 0, 0, 1) 40%');
    expect(list[9]).toBe('rgba(255, 0, 0, 1) 60%');
    expect(list[13]).toBe('rgba(255, 0, 0, 0.125) 70%');
    expect(list[17]).toBe('rgba(255, 0, 0, 0) 80%');
  });

  it('eases out of both edge plateaus for blurredTopAndBottomClearCenter', () => {
    const list = stops(
      getProgressiveTintGradient('blurredTopAndBottomClearCenter', 0.2, RED)
    );
    expect(list).toHaveLength(18);
    expect(list[0]).toBe('rgba(255, 0, 0, 1) 20%');
    expect(list[4]).toBe('rgba(255, 0, 0, 0.125) 30%');
    expect(list[8]).toBe('rgba(255, 0, 0, 0) 40%');
    expect(list[9]).toBe('rgba(255, 0, 0, 0) 60%');
    expect(list[13]).toBe('rgba(255, 0, 0, 0.125) 70%');
    expect(list[17]).toBe('rgba(255, 0, 0, 1) 80%');
  });
});
