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
import {
  PROGRESSIVE_LAYER_COUNT,
  WEB_BLUR_RADIUS_SCALE,
} from '../webBlurUtils';

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
  expect(blurLayer?.backdropFilter).toBe(
    `blur(${40 * WEB_BLUR_RADIUS_SCALE}px) saturate(180%)`
  );
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
