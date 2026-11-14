import { Pressable, StyleSheet, Text, View } from 'react-native';

import { cell } from './group';
import { useTheme } from './theme';

function title(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

/** Single select over 2 to 5 options. */
export function Segmented<T extends string>({
  label,
  value,
  options,
  labels,
  onChange,
}: {
  label: string;
  value: T;
  options: readonly T[];
  labels?: Partial<Record<T, string>>;
  onChange: (value: T) => void;
}) {
  const t = useTheme();
  return (
    <View style={cell.column}>
      <Text style={[t.font.body, { color: t.colors.text }]}>{label}</Text>
      <View
        style={[styles.track, { backgroundColor: t.colors.chip }]}
        accessibilityRole="tablist"
      >
        {options.map((option) => {
          const selected = option === value;
          return (
            <Pressable
              key={option}
              accessibilityRole="tab"
              accessibilityState={{ selected }}
              onPress={() => onChange(option)}
              style={[
                styles.segment,
                selected && [
                  styles.selected,
                  { backgroundColor: t.colors.selected },
                ],
              ]}
            >
              <Text
                style={[t.font.footnote, styles.text, { color: t.colors.text }]}
              >
                {labels?.[option] ?? title(option)}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  track: { flexDirection: 'row', borderRadius: 10, padding: 2 },
  segment: {
    flex: 1,
    minHeight: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selected: {
    shadowColor: '#000000',
    shadowOpacity: 0.12,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  text: { fontWeight: '600' },
});
