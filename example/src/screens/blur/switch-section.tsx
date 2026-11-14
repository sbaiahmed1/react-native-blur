import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SymbolView } from 'expo-symbols';
import { BlurSwitch } from '@sbaiahmed1/react-native-blur';

import { MaterialCard, Section } from '@/ui/screen';
import { SHAPES, useTheme } from '@/ui/theme';

const ROWS = [
  {
    label: 'Wi-Fi',
    ios: 'wifi',
    md: 'wifi',
    color: SHAPES.blue,
    on: true,
    disabled: false,
  },
  {
    label: 'Bluetooth',
    ios: 'antenna.radiowaves.left.and.right',
    md: 'bluetooth',
    color: SHAPES.violet,
    on: false,
    disabled: false,
  },
  {
    label: 'Airplane mode',
    ios: 'airplane',
    md: 'flight',
    color: SHAPES.orange,
    on: false,
    disabled: false,
  },
  {
    label: 'Hotspot',
    ios: 'personalhotspot',
    md: 'wifi_tethering',
    color: SHAPES.green,
    on: true,
    disabled: true,
  },
] as const;

/** BlurSwitch in a settings list. Blurred on Android, the system switch on iOS. */
export function SwitchSection() {
  const t = useTheme();
  const [values, setValues] = useState<boolean[]>(ROWS.map((row) => row.on));
  return (
    <Section title="BlurSwitch" badge="Android">
      <MaterialCard>
        {ROWS.map((row, i) => (
          <View key={row.label} style={styles.row}>
            <View style={[styles.icon, { backgroundColor: row.color }]}>
              <SymbolView
                name={{ ios: row.ios, android: row.md, web: row.md } as never}
                size={16}
                tintColor="#FFFFFF"
              />
            </View>
            <Text style={[t.font.body, styles.grow, { color: t.colors.text }]}>
              {row.label}
            </Text>
            <BlurSwitch
              accessibilityLabel={row.label}
              value={values[i]}
              disabled={row.disabled}
              trackColor={{ true: row.color }}
              blurAmount={20}
              onValueChange={(value) =>
                setValues((prev) => prev.map((v, j) => (j === i ? value : v)))
              }
            />
          </View>
        ))}
      </MaterialCard>
    </Section>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 44 },
  icon: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  grow: { flex: 1 },
});
