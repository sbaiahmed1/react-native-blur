import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { cell } from './group';
import { useTheme } from './theme';

/** Single select over a long option list, scrolling sideways. */
export function Chips<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: readonly T[];
  onChange: (value: T) => void;
}) {
  const t = useTheme();
  return (
    <View style={cell.column}>
      <View style={cell.header}>
        <Text style={[t.font.body, { color: t.colors.text }]}>{label}</Text>
        <Text style={[t.font.label, { color: t.colors.textMuted }]}>
          {value}
        </Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
        accessibilityLabel={label}
      >
        {options.map((option) => {
          const selected = option === value;
          return (
            <Pressable
              key={option}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              hitSlop={{ top: 6, bottom: 6 }}
              onPress={() => onChange(option)}
              style={[
                styles.chip,
                { backgroundColor: selected ? t.colors.text : t.colors.chip },
              ]}
            >
              <Text
                style={[
                  t.font.footnote,
                  styles.chipText,
                  { color: selected ? t.colors.bg : t.colors.text },
                ]}
              >
                {option}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { gap: 8 },
  chip: {
    minHeight: 36,
    paddingHorizontal: 14,
    borderRadius: 18,
    justifyContent: 'center',
  },
  chipText: { fontWeight: '600' },
});
