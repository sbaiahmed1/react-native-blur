import React from 'react';
import { Text } from 'react-native';
import TestRenderer, { act } from 'react-test-renderer';

import { useMaterialScheme } from '../useMaterialScheme';
import { useMaterialScheme as useWebMaterialScheme } from '../useMaterialScheme.web';

jest.mock('react-native/Libraries/Utilities/useColorScheme', () => ({
  __esModule: true,
  default: jest.fn(),
}));

const mockedColorScheme = jest.requireMock(
  'react-native/Libraries/Utilities/useColorScheme'
).default as jest.Mock;

(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

const render = (useScheme: () => string) => {
  const Probe = () => <Text>{useScheme()}</Text>;
  let renderer!: TestRenderer.ReactTestRenderer;
  act(() => {
    renderer = TestRenderer.create(<Probe />);
  });
  return () => renderer.root.findByType(Text).props.children;
};

type MediaListener = () => void;

const mockDarkMedia = (initial: boolean) => {
  const listeners = new Set<MediaListener>();
  const media = {
    matches: initial,
    addEventListener: (_: string, listener: MediaListener) =>
      listeners.add(listener),
    removeEventListener: (_: string, listener: MediaListener) =>
      listeners.delete(listener),
  };
  (globalThis as { matchMedia?: unknown }).matchMedia = jest.fn(() => media);
  return (matches: boolean) => {
    media.matches = matches;
    listeners.forEach((listener) => listener());
  };
};

afterEach(() => {
  delete (globalThis as { matchMedia?: unknown }).matchMedia;
  jest.restoreAllMocks();
});

describe('useMaterialScheme', () => {
  it('follows the native color scheme', () => {
    mockedColorScheme.mockReturnValue('dark');
    expect(render(useMaterialScheme)()).toBe('dark');
    mockedColorScheme.mockReturnValue(null);
    expect(render(useMaterialScheme)()).toBe('light');
    mockedColorScheme.mockReturnValue('unspecified');
    expect(render(useMaterialScheme)()).toBe('light');
  });

  it('uses light on the server snapshot', () => {
    mockDarkMedia(true);
    const store = jest.spyOn(React, 'useSyncExternalStore');
    render(useWebMaterialScheme);
    const getServerSnapshot = store.mock.calls[0]![2]!;
    expect(getServerSnapshot()).toBe('light');
  });

  it('follows prefers-color-scheme after hydration', () => {
    const setDark = mockDarkMedia(false);
    const scheme = render(useWebMaterialScheme);
    expect(scheme()).toBe('light');
    act(() => setDark(true));
    expect(scheme()).toBe('dark');
    act(() => setDark(false));
    expect(scheme()).toBe('light');
  });

  it('reads light without matchMedia', () => {
    expect(render(useWebMaterialScheme)()).toBe('light');
  });
});
