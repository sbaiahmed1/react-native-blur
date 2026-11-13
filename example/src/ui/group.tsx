import { Children, Fragment, type ReactNode } from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';

import { useTheme } from './theme';

/** An inset grouped list. Each child is one cell, separated by a hairline. */
export function Group({ children }: { children: ReactNode }) {
  const t = useTheme();
  const cells = Children.toArray(children);
  return (
    <View style={[styles.group, { backgroundColor: t.colors.surface }]}>
      {cells.map((cell, i) => (
        <Fragment key={i}>
          {i > 0 ? (
            <View style={[styles.sep, { backgroundColor: t.colors.border }]} />
          ) : null}
          {cell}
        </Fragment>
      ))}
    </View>
  );
}

export function Toggle({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  const t = useTheme();
  return (
    <View style={cell.row}>
      <Text style={[t.font.body, { color: t.colors.text }]}>{label}</Text>
      <Switch
        accessibilityLabel={label}
        value={value}
        onValueChange={onChange}
        trackColor={{ true: t.colors.accent, false: t.colors.chip }}
      />
    </View>
  );
}

export const cell = StyleSheet.create({
  row: {
    minHeight: 52,
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  column: { paddingHorizontal: 16, paddingVertical: 12, gap: 10 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
});

const styles = StyleSheet.create({
  group: { borderRadius: 12, overflow: 'hidden' },
  sep: { height: StyleSheet.hairlineWidth, marginLeft: 16 },
});
