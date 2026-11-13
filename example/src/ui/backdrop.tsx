import type { ReactNode } from 'react';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import { SHAPES, useTheme } from './theme';

export type BackdropVariant = 'shapes' | 'bands' | 'text';

const BANDS = [
  SHAPES.orange,
  SHAPES.yellow,
  SHAPES.green,
  SHAPES.blue,
  SHAPES.violet,
  SHAPES.pink,
];

const ARTICLE =
  'Materials let content show through, so people keep their place while a panel sits on top. A thin material shows more of what is behind it. A thick one keeps text easy to read over busy content. Pick the lightest one that keeps your labels readable.';

function Shapes() {
  return (
    <>
      <View
        style={[styles.circle, styles.c1, { backgroundColor: SHAPES.orange }]}
      />
      <View
        style={[styles.circle, styles.c2, { backgroundColor: SHAPES.blue }]}
      />
      <View
        style={[styles.circle, styles.c3, { backgroundColor: SHAPES.pink }]}
      />
      <View
        style={[styles.circle, styles.c4, { backgroundColor: SHAPES.yellow }]}
      />
    </>
  );
}

function Bands() {
  return (
    <>
      <View style={styles.bands}>
        {BANDS.map((color) => (
          <View key={color} style={[styles.band, { backgroundColor: color }]} />
        ))}
      </View>
      <Text style={styles.glyph}>Aa</Text>
      <View style={styles.dot} />
    </>
  );
}

function Article() {
  const t = useTheme();
  return (
    <View style={[styles.article, { backgroundColor: t.colors.bg }]}>
      <Text style={[t.font.title, { color: t.colors.text }]}>
        Reading over glass
      </Text>
      <Text style={[t.font.label, { color: t.colors.text }]}>{ARTICLE}</Text>
    </View>
  );
}

/** Designed color behind an effect, with sharp edges so the blur is easy to see. */
export function Backdrop({
  variant,
  children,
}: {
  variant: BackdropVariant;
  children?: ReactNode;
}) {
  return (
    <View style={styles.fill}>
      <View style={styles.fill} pointerEvents="none">
        {variant === 'shapes' ? <Shapes /> : null}
        {variant === 'bands' ? <Bands /> : null}
        {variant === 'text' ? <Article /> : null}
      </View>
      {children}
    </View>
  );
}

type Circle = { color: string; size: number; left: number; top: number };

/** Flat color circles behind a whole screen. They stay put while content scrolls over them. */
export function ColorField() {
  const { width } = useWindowDimensions();
  const k = width / 390;
  const circles: Circle[] = [
    { color: SHAPES.orange, size: 280, left: -110, top: 120 },
    { color: SHAPES.blue, size: 300, left: 90, top: 330 },
    { color: SHAPES.pink, size: 220, left: -80, top: 580 },
    { color: SHAPES.yellow, size: 170, left: 250, top: 690 },
  ];
  return (
    <View style={styles.fill} pointerEvents="none">
      {circles.map((c) => (
        <View
          key={c.color}
          style={{
            ...styles.fieldCircle,
            left: c.left * k,
            top: c.top * k,
            width: c.size * k,
            height: c.size * k,
            borderRadius: (c.size * k) / 2,
            backgroundColor: c.color,
          }}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 },
  circle: { position: 'absolute', aspectRatio: 1, borderRadius: 9999 },
  fieldCircle: { position: 'absolute' },
  c1: { width: '62%', left: '-14%', top: '-30%' },
  c2: { width: '58%', left: '48%', top: '18%' },
  c3: { width: '36%', left: '10%', top: '62%' },
  c4: { width: '24%', left: '74%', top: '-8%' },
  bands: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    flexDirection: 'row',
  },
  band: { flex: 1 },
  glyph: {
    position: 'absolute',
    left: 24,
    top: 64,
    fontSize: 96,
    lineHeight: 112,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  dot: {
    position: 'absolute',
    right: 40,
    top: 74,
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#FFFFFF',
  },
  article: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    padding: 20,
    gap: 8,
  },
});
