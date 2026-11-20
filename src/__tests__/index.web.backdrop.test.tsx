/**
 * Renders the web components with CSS.supports stubbed as available. Kept in
 * its own file because supportsBackdropFilter() memoizes its first result per
 * module registry — the sibling test file covers the CSS-less branch.
 */
import React from 'react';
import { StyleSheet, View } from 'react-native';
import TestRenderer, { act } from 'react-test-renderer';
import type { ReactTestInstance } from 'react-test-renderer';

import { BlurView } from '../BlurView.web';
import { ProgressiveBlurView } from '../ProgressiveBlurView.web';
import { materialFor } from '../materials';
import { PROGRESSIVE_LAYER_COUNT, tintRgba } from '../webBlurUtils';

(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

beforeAll(() => {
  (globalThis as { CSS?: unknown }).CSS = {
    supports: jest.fn().mockReturnValue(true),
  };
});

afterAll(() => {
  delete (globalThis as { CSS?: unknown }).CSS;
});

const render = (element: React.ReactElement) => {
  let renderer!: TestRenderer.ReactTestRenderer;
  act(() => {
    renderer = TestRenderer.create(element);
  });
  return renderer;
};

const flattenedStyles = (instance: ReactTestInstance) =>
  instance
    .findAllByType(View)
    .map(
      (view) =>
        (StyleSheet.flatten(view.props.style) ?? {}) as Record<string, unknown>
    );

it('BlurView emits prefixed and unprefixed backdrop filters', () => {
  const renderer = render(<BlurView blurType="dark" blurAmount={40} />);

  const styles = flattenedStyles(renderer.root);
  const blurLayer = styles.find((style) => 'backdropFilter' in style);
  expect(blurLayer).toBeDefined();
  expect(blurLayer?.backdropFilter).toBe('blur(7.64px) saturate(1.32)');
  expect(blurLayer?.WebkitBackdropFilter).toBe(blurLayer?.backdropFilter);
});

it('ProgressiveBlurView stacks the masked ramp layers plus the tint gradient', () => {
  const renderer = render(
    <ProgressiveBlurView blurAmount={20} direction="blurredTopClearBottom" />
  );

  const styles = flattenedStyles(renderer.root);
  const rampLayers = styles.filter((style) => 'backdropFilter' in style);
  expect(rampLayers).toHaveLength(PROGRESSIVE_LAYER_COUNT);
  for (const layer of rampLayers) {
    expect(layer.maskImage).toEqual(expect.stringContaining('linear-gradient'));
    expect(layer.WebkitMaskImage).toBe(layer.maskImage);
    expect(layer.WebkitBackdropFilter).toBe(layer.backdropFilter);
  }
  expect(styles.filter((style) => 'backgroundImage' in style)).toHaveLength(1);
});

it('BlurView rounds its blur and overlay layers like its container', () => {
  const renderer = render(
    <BlurView style={{ borderRadius: 24 }} overlayColor="rgba(0,0,0,0.2)" />
  );

  const styles = flattenedStyles(renderer.root);
  const blurLayer = styles.find((style) => 'backdropFilter' in style);
  const overlayLayer = styles.find(
    (style) => style.backgroundColor === 'rgba(0,0,0,0.2)'
  );
  expect(blurLayer?.borderRadius).toBe(24);
  expect(overlayLayer?.borderRadius).toBe(24);
});

it('BlurView copies per-corner radii to its blur layer', () => {
  const renderer = render(
    <BlurView style={{ borderTopLeftRadius: 8, borderBottomEndRadius: 4 }} />
  );

  const blurLayer = flattenedStyles(renderer.root).find(
    (style) => 'backdropFilter' in style
  );
  expect(blurLayer).toMatchObject({
    borderTopLeftRadius: 8,
    borderBottomEndRadius: 4,
  });
});

it('ProgressiveBlurView rounds every ramp layer and the tint gradient', () => {
  const renderer = render(
    <ProgressiveBlurView blurAmount={20} style={{ borderRadius: 30 }} />
  );

  const styles = flattenedStyles(renderer.root);
  const layers = styles.filter(
    (style) => 'backdropFilter' in style || 'backgroundImage' in style
  );
  expect(layers).toHaveLength(PROGRESSIVE_LAYER_COUNT + 1);
  for (const layer of layers) expect(layer.borderRadius).toBe(30);
});

describe('in dark mode', () => {
  beforeEach(() => {
    (globalThis as { matchMedia?: unknown }).matchMedia = jest.fn(() => ({
      matches: true,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    }));
  });

  afterEach(() => {
    delete (globalThis as { matchMedia?: unknown }).matchMedia;
  });

  it('BlurView follows dark mode for adaptive types', () => {
    const renderer = render(
      <View>
        <BlurView blurType="systemMaterial" blurAmount={100} />
        <BlurView blurType="systemMaterialLight" blurAmount={100} />
      </View>
    );

    const layers = flattenedStyles(renderer.root).filter(
      (style) => 'backdropFilter' in style
    );
    expect(layers.map((style) => style.backgroundColor)).toEqual([
      tintRgba(materialFor('systemMaterialDark', 'dark').tint),
      tintRgba(materialFor('systemMaterialLight', 'light').tint),
    ]);
    expect(layers[0]?.backdropFilter).toBe('blur(29.4px) saturate(1.63)');
  });

  it('ProgressiveBlurView tints with the dark material', () => {
    const renderer = render(<ProgressiveBlurView blurType="systemMaterial" />);

    const gradient = flattenedStyles(renderer.root).find(
      (style) => 'backgroundImage' in style
    );
    expect(gradient?.backgroundImage).toContain(
      tintRgba(materialFor('systemMaterial', 'dark').tint)
    );
  });
});
