import {
  BLUR_TYPE_TO_BACKGROUND,
  PROGRESSIVE_LAYER_COUNT,
  PROGRESSIVE_RADIUS_COMPENSATION,
  WEB_BLUR_RADIUS_SCALE,
  getBlurLayerStyle,
  getProgressiveLayers,
  getProgressiveTintGradient,
  supportsBackdropFilter,
} from '../webBlurUtils';

describe('BLUR_TYPE_TO_BACKGROUND', () => {
  it('covers all 21 blur types with rgba colours', () => {
    const entries = Object.entries(BLUR_TYPE_TO_BACKGROUND);
    expect(entries).toHaveLength(21);
    for (const [, colour] of entries) {
      expect(colour).toMatch(/^rgba\(\d+, \d+, \d+, 0?\.\d+\)$/);
    }
  });
});

describe('supportsBackdropFilter', () => {
  it('reports false in a CSS-less environment (Node / SSR)', () => {
    expect(supportsBackdropFilter()).toBe(false);
  });
});

describe('getBlurLayerStyle', () => {
  it('degrades to a tint-only style without backdrop-filter support', () => {
    const style = getBlurLayerStyle('dark', 40);
    expect(style).toEqual({ backgroundColor: 'rgba(0, 0, 0, 0.5)' });
  });

  it('emits prefixed and unprefixed filters when supported', () => {
    jest.isolateModules(() => {
      const supports = jest.fn().mockReturnValue(true);
      (globalThis as { CSS?: unknown }).CSS = { supports };
      try {
        // Fresh module instance so the memoized support check re-runs.
        const utils =
          require('../webBlurUtils') as typeof import('../webBlurUtils');

        const style = utils.getBlurLayerStyle('light', 10);
        expect(style.backgroundColor).toBe('rgba(255, 255, 255, 0.4)');
        expect(style.backdropFilter).toBe(
          `blur(${10 * WEB_BLUR_RADIUS_SCALE}px) saturate(180%)`
        );
        expect(style.WebkitBackdropFilter).toBe(style.backdropFilter);

        // blurAmount is clamped into 0-100 before scaling.
        expect(utils.getBlurLayerStyle('light', 400).backdropFilter).toBe(
          `blur(${100 * WEB_BLUR_RADIUS_SCALE}px) saturate(180%)`
        );
        expect(utils.getBlurLayerStyle('light', -5).backdropFilter).toBe(
          'blur(0px) saturate(180%)'
        );
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
    expect(layers.map((l) => l.radius)).toEqual([1.09, 2.17, 4.35, 8.7, 17.4]);
    expect(layers[layers.length - 1]?.radius).toBeCloseTo(
      20 * PROGRESSIVE_RADIUS_COMPENSATION,
      5
    );
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

  it('mirrors the bands around the center for blurredCenterClearTopAndBottom', () => {
    const layers = getProgressiveLayers(
      'blurredCenterClearTopAndBottom',
      0,
      20
    );
    expect(layers[4]?.maskImage).toBe(
      'linear-gradient(to bottom, transparent 40%, black 50%, black 50%, transparent 60%)'
    );
    expect(layers[0]?.maskImage).toBe(
      'linear-gradient(to bottom, transparent 0%, black 10%, black 90%, transparent 100%)'
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
  it('fades the tint along the blur direction', () => {
    expect(
      getProgressiveTintGradient('blurredTopClearBottom', 0, 'rgba(0,0,0,0.5)')
    ).toBe(
      'linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.5) 0%, transparent 100%)'
    );
    expect(
      getProgressiveTintGradient(
        'blurredBottomClearTop',
        0.3,
        'rgba(0,0,0,0.5)'
      )
    ).toBe(
      'linear-gradient(to top, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.5) 30%, transparent 100%)'
    );
  });

  it('peaks at the center for blurredCenterClearTopAndBottom', () => {
    expect(
      getProgressiveTintGradient(
        'blurredCenterClearTopAndBottom',
        0.2,
        'rgba(255,255,255,0.2)'
      )
    ).toBe(
      'linear-gradient(to bottom, transparent 0%, rgba(255,255,255,0.2) 40%, rgba(255,255,255,0.2) 60%, transparent 100%)'
    );
  });
});
