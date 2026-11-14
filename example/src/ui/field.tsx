import { createContext, use, useMemo, useState, type ReactNode } from 'react';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import { useTheme } from './theme';

export const FIELDS = ['ribbons', 'iris', 'type'] as const;
export type FieldName = (typeof FIELDS)[number];

export const FIELD_LABELS: Record<FieldName, string> = {
  ribbons: 'Ribbons',
  iris: 'Iris',
  type: 'Type',
};

type FieldSize = { width: number; height: number };
type FieldProps = FieldSize & { colors: readonly string[] };

const WORDS = ['blur', 'glass', 'fade', 'blur'];

/** Giant lettering, so every blur and glass edge crosses sharp type. */
function TypeField({ colors, width, height }: FieldProps) {
  const size = width * 0.46;
  return (
    <>
      {WORDS.map((word, i) => (
        <Text
          key={i}
          allowFontScaling={false}
          numberOfLines={1}
          style={[
            styles.word,
            {
              left: -size * 0.06,
              top: height * 0.2 + i * size * 0.92,
              width: width * 2,
              fontSize: size,
              lineHeight: size,
              letterSpacing: -size * 0.05,
              color: colors[i % colors.length],
            },
          ]}
        >
          {word}
        </Text>
      ))}
    </>
  );
}

/** Wide ribbons laid across each other at an angle. */
function RibbonField({ colors, width, height }: FieldProps) {
  const ribbons = [
    { color: colors[0], top: 0.26, angle: '-16deg' },
    { color: colors[2], top: 0.44, angle: '24deg' },
    { color: colors[1], top: 0.66, angle: '-16deg' },
  ];
  return (
    <>
      {ribbons.map((r) => (
        <View
          key={r.color}
          style={[
            styles.ribbon,
            {
              left: -width * 0.5,
              top: height * r.top,
              width: width * 2,
              height: width * 0.3,
              backgroundColor: r.color,
              transform: [{ rotate: r.angle }],
            },
          ]}
        />
      ))}
    </>
  );
}

/** A camera iris: six blades around a hexagonal opening. */
function IrisField({ colors, width, height }: FieldProps) {
  const R = width * 0.75;
  const r = R * 0.3;
  return (
    <View
      style={[
        styles.iris,
        {
          left: width / 2 - R,
          top: height * 0.52 - R,
          width: R * 2,
          height: R * 2,
          borderRadius: R,
        },
      ]}
    >
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <View
          key={i}
          style={[styles.fill, { transform: [{ rotate: `${i * 60}deg` }] }]}
        >
          <View
            style={[
              styles.blade,
              {
                left: R - r * 0.577,
                top: R + r,
                width: R * 2,
                height: R * 2,
                backgroundColor: colors[i % colors.length],
              },
            ]}
          />
        </View>
      ))}
    </View>
  );
}

/** One field drawn at the given size, in the current theme. */
export function Field({
  name,
  width,
  height,
}: FieldSize & { name: FieldName }) {
  const t = useTheme();
  const props = { colors: t.field, width, height };
  if (name === 'iris') return <IrisField {...props} />;
  if (name === 'type') return <TypeField {...props} />;
  return <RibbonField {...props} />;
}

type FieldChoice = { field: FieldName; setField: (field: FieldName) => void };

const FieldContext = createContext<FieldChoice>({
  field: 'ribbons',
  setField: () => {},
});

/** Holds the backdrop picked in the field sheet, for every tab. */
export function FieldProvider({ children }: { children: ReactNode }) {
  const [field, setField] = useState<FieldName>('ribbons');
  const value = useMemo(() => ({ field, setField }), [field]);
  return <FieldContext value={value}>{children}</FieldContext>;
}

export function useField(): FieldChoice {
  return use(FieldContext);
}

/** The picked backdrop behind a whole screen. It stays put while content scrolls over it. */
export function ColorField() {
  const { field } = useField();
  const { width, height } = useWindowDimensions();
  return (
    <View
      style={styles.fill}
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <Field name={field} width={width} height={height} />
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 },
  word: { position: 'absolute', fontWeight: '900' },
  ribbon: { position: 'absolute' },
  iris: { position: 'absolute', overflow: 'hidden' },
  blade: { position: 'absolute' },
});
