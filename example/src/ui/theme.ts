import { Platform, useColorScheme, type TextStyle } from 'react-native';

export const SHAPES = {
  orange: '#FF6B2C',
  blue: '#2F5BFF',
  pink: '#FF3D9A',
  yellow: '#FFC21A',
  green: '#18C77A',
  violet: '#7B5CFF',
} as const;

export type Theme = {
  dark: boolean;
  colors: {
    bg: string;
    surface: string;
    grouped: string;
    text: string;
    textMuted: string;
    accent: string;
    border: string;
    chip: string;
    selected: string;
  };
  space: (n: number) => number;
  radius: { sm: number; md: number; lg: number };
  font: {
    largeTitle: TextStyle;
    title: TextStyle;
    headline: TextStyle;
    body: TextStyle;
    label: TextStyle;
    footnote: TextStyle;
    caption: TextStyle;
    mono: TextStyle;
  };
};

const MONO = Platform.select({
  ios: 'Menlo',
  android: 'monospace',
  default: 'ui-monospace, Menlo, monospace',
});

const font: Theme['font'] = {
  largeTitle: { fontSize: 34, lineHeight: 41, fontWeight: '700' },
  title: { fontSize: 22, lineHeight: 28, fontWeight: '700' },
  headline: { fontSize: 17, lineHeight: 22, fontWeight: '600' },
  body: { fontSize: 17, lineHeight: 22 },
  label: { fontSize: 15, lineHeight: 20 },
  footnote: { fontSize: 13, lineHeight: 18 },
  caption: { fontSize: 11, lineHeight: 13, fontWeight: '600' },
  mono: { fontSize: 13, lineHeight: 19, fontFamily: MONO },
};

const space = (n: number) => n * 4;
const radius = { sm: 10, md: 16, lg: 24 };

const LIGHT: Theme = {
  dark: false,
  colors: {
    bg: '#FFFFFF',
    surface: '#FFFFFF',
    grouped: '#F2F2F7',
    text: '#0B0B0F',
    textMuted: '#6B6B76',
    accent: '#0A64FF',
    border: 'rgba(60,60,67,0.18)',
    chip: 'rgba(11,11,15,0.06)',
    selected: '#FFFFFF',
  },
  space,
  radius,
  font,
};

const DARK: Theme = {
  dark: true,
  colors: {
    bg: '#000000',
    surface: '#1C1C1E',
    grouped: '#000000',
    text: '#F5F5F7',
    textMuted: '#8E8E93',
    accent: '#4D8DFF',
    border: 'rgba(84,84,88,0.6)',
    chip: 'rgba(245,245,247,0.1)',
    selected: '#636366',
  },
  space,
  radius,
  font,
};

export function useTheme(): Theme {
  return useColorScheme() === 'dark' ? DARK : LIGHT;
}
