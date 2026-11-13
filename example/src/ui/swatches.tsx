import { Pressable, StyleSheet, Text, View } from 'react-native';

import { cell } from './group';
import { useTheme } from './theme';

/** Color picker with a leading "none" swatch for undefined. */
export function Swatches({
  label,
  value,
  colors,
  onChange,
}: {
  label: string;
  value: string | undefined;
  colors: readonly string[];
  onChange: (color: string | undefined) => void;
}) {
  const t = useTheme();
  const options: (string | undefined)[] = [undefined, ...colors];
  return (
    <View style={cell.row}>
      <Text style={[t.font.body, { color: t.colors.text }]}>{label}</Text>
      <View style={styles.row}>
        {options.map((color) => {
          const selected = color === value;
          return (
            <Pressable
              key={color ?? 'none'}
              accessibilityRole="button"
              accessibilityLabel={color ?? 'none'}
              accessibilityState={{ selected }}
              hitSlop={4}
              onPress={() => onChange(color)}
              style={[
                styles.ring,
                selected && { borderColor: t.colors.accent },
              ]}
            >
              <View
                style={[
                  styles.swatch,
                  {
                    backgroundColor: color ?? 'transparent',
                    borderColor: t.colors.border,
                  },
                ]}
              >
                {color === undefined ? (
                  <View
                    style={[
                      styles.slash,
                      { backgroundColor: t.colors.textMuted },
                    ]}
                  />
                ) : null}
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 4,
    flexShrink: 1,
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
  },
  ring: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  swatch: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  slash: { width: 34, height: 2, transform: [{ rotate: '-45deg' }] },
});
