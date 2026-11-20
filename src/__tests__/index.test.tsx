import type { ReactElement } from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { Platform, StyleSheet, View, type ColorValue } from 'react-native';

import * as PublicApi from '../index';
import ReactNativeBlurView from '../ReactNativeBlurViewNativeComponent';
import ReactNativeLiquidGlassView from '../ReactNativeLiquidGlassViewNativeComponent';
import { BlurView } from '../BlurView';
import { ProgressiveBlurView } from '../ProgressiveBlurView';
import { LiquidGlassView, getFallbackOverlayColor } from '../LiquidGlassView';
import { LiquidGlassContainer } from '../LiquidGlassContainer';
import { VibrancyView } from '../VibrancyView';
import { BlurSwitch } from '../BlurSwitch';
import ReactNativeProgressiveBlurView from '../ReactNativeProgressiveBlurViewNativeComponent';
import { materialFor } from '../materials';

// A color scheme store that re-renders its subscribers, like Appearance does.
jest.mock('react-native/Libraries/Utilities/useColorScheme', () => {
  const { useSyncExternalStore } = jest.requireActual('react');
  const listeners = new Set<() => void>();
  let scheme: string | null = null;
  const subscribe = (listener: () => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };
  const useColorScheme = () => useSyncExternalStore(subscribe, () => scheme);
  useColorScheme.set = (next: string | null) => {
    scheme = next;
    listeners.forEach((listener) => listener());
  };
  return { __esModule: true, default: useColorScheme };
});

const setColorScheme = (
  jest.requireMock('react-native/Libraries/Utilities/useColorScheme')
    .default as { set: (scheme: string | null) => void }
).set;

// react-test-renderer under React 19 requires renders to run inside act().
(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

function render(element: ReactElement): TestRenderer.ReactTestRenderer {
  let tree!: TestRenderer.ReactTestRenderer;
  act(() => {
    tree = TestRenderer.create(element);
  });
  return tree;
}

describe('getFallbackOverlayColor', () => {
  it('returns undefined for missing / clear / transparent tints', () => {
    expect(getFallbackOverlayColor(undefined, 1)).toBeUndefined();
    expect(getFallbackOverlayColor('', 1)).toBeUndefined();
    expect(getFallbackOverlayColor('clear', 1)).toBeUndefined();
    expect(getFallbackOverlayColor('CLEAR', 1)).toBeUndefined();
    expect(getFallbackOverlayColor('transparent', 1)).toBeUndefined();
  });

  it('scales a 6-digit hex tint down to the capped subtle alpha', () => {
    // opacity 1 * MAX_FALLBACK_TINT_ALPHA (0.35) * tintAlpha 1 * 255 = 89 -> 0x59
    expect(getFallbackOverlayColor('#FF0000', 1)).toBe('#ff000059');
    // opacity 0.5 -> 45 -> 0x2d
    expect(getFallbackOverlayColor('#FF0000', 0.5)).toBe('#ff00002d');
  });

  it('expands 3-digit hex and folds an 8-digit tint alpha in', () => {
    expect(getFallbackOverlayColor('#F00', 1)).toBe('#ff000059');
    // #FF000080 carries tintAlpha 0x80/255 ~= 0.502, so 0.35*0.502*255 ~= 45
    expect(getFallbackOverlayColor('#FF000080', 1)).toBe('#ff00002d');
  });

  it('clamps opacity into [0, 1]', () => {
    expect(getFallbackOverlayColor('#FF0000', 5)).toBe('#ff000059');
    expect(getFallbackOverlayColor('#FF0000', -1)).toBe('#ff000000');
  });

  it('passes named / rgb colours through unchanged', () => {
    expect(getFallbackOverlayColor('red', 1)).toBe('red');
    expect(getFallbackOverlayColor('rgb(255,0,0)', 1)).toBe('rgb(255,0,0)');
  });

  it('passes platform colours through unchanged', () => {
    const color = 42 as unknown as ColorValue;
    expect(getFallbackOverlayColor(color, 0.5)).toBe(color);
  });
});

describe('public API surface', () => {
  it('exports every wrapper component', () => {
    for (const name of [
      'BlurView',
      'ProgressiveBlurView',
      'LiquidGlassView',
      'LiquidGlassContainer',
      'VibrancyView',
      'BlurSwitch',
    ] as const) {
      expect(PublicApi[name]).toBeDefined();
    }
    expect(PublicApi.default).toBe(PublicApi.BlurView);
  });
});

describe('wrapper rendering', () => {
  it('renders BlurView with no children as the native blur view with defaults', () => {
    const tree = render(<BlurView blurAmount={20} />);
    const native = tree.root.findAllByType(ReactNativeBlurView);
    expect(native).toHaveLength(1);
    expect(native[0]?.props.blurType).toBe('xlight');
    expect(native[0]?.props.blurAmount).toBe(20);
    expect(native[0]?.props.blurRounds).toBe(5);
    expect(native[0]?.props.ignoreSafeArea).toBe(true);
    act(() => tree.unmount());
  });

  it('renders BlurView with children without throwing', () => {
    const tree = render(
      <BlurView>
        <View testID="child" />
      </BlurView>
    );
    expect(tree.root.findAllByType(ReactNativeBlurView).length).toBeGreaterThan(
      0
    );
    act(() => tree.unmount());
  });

  it('renders LiquidGlassView natively on Android 13+ instead of the BlurView fallback', () => {
    const replaced = jest.replaceProperty(Platform, 'OS', 'android');
    // Platform.Version is a getter in RN, so swap the property descriptor
    // rather than using jest.replaceProperty (which needs a data property).
    const versionDescriptor = Object.getOwnPropertyDescriptor(
      Platform,
      'Version'
    )!;
    // API 33 exactly: the Android 13 boundary the gate must accept.
    Object.defineProperty(Platform, 'Version', {
      value: 33,
      configurable: true,
    });
    try {
      const tree = render(
        <LiquidGlassView glassTintColor="#007AFF" glassOpacity={0.8} />
      );
      expect(tree.root.findAllByType(BlurView)).toHaveLength(0);
      expect(tree.root.findAllByType(ReactNativeLiquidGlassView)).toHaveLength(
        1
      );
      act(() => tree.unmount());
    } finally {
      replaced.restore();
      Object.defineProperty(Platform, 'Version', versionDescriptor);
    }
  });

  it('renders LiquidGlassView as a BlurView fallback on Android below 13', () => {
    const replaced = jest.replaceProperty(Platform, 'OS', 'android');
    const versionDescriptor = Object.getOwnPropertyDescriptor(
      Platform,
      'Version'
    )!;
    Object.defineProperty(Platform, 'Version', {
      value: 31,
      configurable: true,
    });
    try {
      const tree = render(
        <LiquidGlassView glassTintColor="#007AFF" glassOpacity={0.8} />
      );
      expect(tree.root.findAllByType(BlurView)).toHaveLength(1);
      act(() => tree.unmount());
    } finally {
      replaced.restore();
      Object.defineProperty(Platform, 'Version', versionDescriptor);
    }
  });

  it('renders every wrapper without throwing', () => {
    const cases = [
      <ProgressiveBlurView key="p" blurAmount={30} />,
      <LiquidGlassView key="g" glassTintColor="#007AFF" glassOpacity={0.8} />,
      <LiquidGlassContainer key="c" spacing={12} />,
      <VibrancyView key="v" blurAmount={15} />,
      <BlurSwitch key="s" value onValueChange={() => {}} />,
    ];
    for (const element of cases) {
      const tree = render(element);
      expect(tree.toJSON()).not.toBeNull();
      act(() => tree.unmount());
    }
  });
});

describe('material props', () => {
  const tokenProps = (blurType: string, scheme: 'light' | 'dark') => {
    const token = materialFor(blurType, scheme);
    return {
      materialTint: token.tint,
      materialSaturation: token.saturation,
      materialRadius: token.radius,
    };
  };

  const nativeTokenProps = (
    tree: TestRenderer.ReactTestRenderer,
    type: typeof ReactNativeBlurView | typeof ReactNativeProgressiveBlurView
  ) =>
    tree.root.findAllByType(type).map(({ props }) => ({
      materialTint: props.materialTint,
      materialSaturation: props.materialSaturation,
      materialRadius: props.materialRadius,
    }));

  afterEach(() => act(() => setColorScheme(null)));

  describe.each([
    ['BlurView', BlurView, ReactNativeBlurView],
    [
      'ProgressiveBlurView',
      ProgressiveBlurView,
      ReactNativeProgressiveBlurView,
    ],
  ] as const)('%s', (_name, Wrapper, Native) => {
    it('passes the material token of the blurType', () => {
      for (const os of ['ios', 'android'] as const) {
        const replaced = jest.replaceProperty(Platform, 'OS', os);
        try {
          for (const children of [null, <View key="child" />]) {
            const tree = render(
              <Wrapper blurType="systemMaterial">{children}</Wrapper>
            );
            expect(nativeTokenProps(tree, Native)).toEqual([
              tokenProps('systemMaterial', 'light'),
            ]);
            act(() => tree.unmount());
          }
        } finally {
          replaced.restore();
        }
      }
    });

    it('passes the full token whatever the amount', () => {
      for (const blurAmount of [10, 90]) {
        const tree = render(
          <Wrapper blurType="xlight" blurAmount={blurAmount} />
        );
        expect(nativeTokenProps(tree, Native)).toEqual([
          tokenProps('xlight', 'light'),
        ]);
        act(() => tree.unmount());
      }
    });

    it('re-resolves on a scheme change', () => {
      const tree = render(
        <View>
          <Wrapper blurType="systemMaterial" />
          <Wrapper blurType="systemMaterialLight" />
        </View>
      );
      expect(nativeTokenProps(tree, Native)).toEqual([
        tokenProps('systemMaterial', 'light'),
        tokenProps('systemMaterialLight', 'light'),
      ]);
      act(() => setColorScheme('dark'));
      expect(nativeTokenProps(tree, Native)).toEqual([
        tokenProps('systemMaterial', 'dark'),
        tokenProps('systemMaterialLight', 'light'),
      ]);
      act(() => tree.unmount());
    });
  });
});

describe('overlayColor', () => {
  const OVERLAY = '#FF000080';

  const isOverlay = (node: TestRenderer.ReactTestInstance) =>
    node.type === View &&
    StyleSheet.flatten(node.props.style)?.backgroundColor === OVERLAY;

  describe.each([
    ['BlurView', BlurView, ReactNativeBlurView],
    [
      'ProgressiveBlurView',
      ProgressiveBlurView,
      ReactNativeProgressiveBlurView,
    ],
  ] as const)('%s', (_name, Wrapper, Native) => {
    const drawOrder = (
      os: 'ios' | 'android',
      children: ReactElement | null
    ) => {
      const replaced = jest.replaceProperty(Platform, 'OS', os);
      try {
        const tree = render(
          <Wrapper overlayColor={OVERLAY}>{children}</Wrapper>
        );
        const nodes = tree.root.findAll(
          (node) =>
            node.type === Native ||
            isOverlay(node) ||
            node.props.testID === 'child',
          { deep: true }
        );
        const order = nodes.map((node) =>
          node.type === Native
            ? 'blur'
            : node.props.testID === 'child'
              ? 'child'
              : 'overlay'
        );
        const native = tree.root.findByType(Native);
        const nativeBackground = StyleSheet.flatten(
          native.props.style
        )?.backgroundColor;
        act(() => tree.unmount());
        return { order: [...new Set(order)], nativeBackground };
      } finally {
        replaced.restore();
      }
    };

    it.each(['ios', 'android'] as const)(
      'draws overlayColor above the blur with no children on %s',
      (os) => {
        expect(drawOrder(os, null)).toEqual({
          order: ['blur', 'overlay'],
          nativeBackground: undefined,
        });
      }
    );

    it.each(['ios', 'android'] as const)(
      'draws overlayColor above the blur with children on %s',
      (os) => {
        expect(drawOrder(os, <View testID="child" />)).toEqual({
          order: ['blur', 'overlay', 'child'],
          nativeBackground: undefined,
        });
      }
    );

    it.each(['ios', 'android'] as const)(
      'keeps style and props on the native view that holds the overlay with no children on %s',
      (os) => {
        const replaced = jest.replaceProperty(Platform, 'OS', os);
        try {
          const tree = render(
            <Wrapper
              overlayColor={OVERLAY}
              pointerEvents="none"
              style={{ height: 40 }}
            />
          );
          const native = tree.root.findByType(Native);
          expect(StyleSheet.flatten(native.props.style)).toMatchObject({
            height: 40,
          });
          expect(native.props.pointerEvents).toBe('none');
          expect(native.findAll(isOverlay)).toHaveLength(1);
          act(() => tree.unmount());
        } finally {
          replaced.restore();
        }
      }
    );

    it('adds no overlay without overlayColor', () => {
      const tree = render(<Wrapper />);
      expect(tree.root.findAll(isOverlay)).toHaveLength(0);
      act(() => tree.unmount());
    });
  });
});
