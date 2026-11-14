import { StyleSheet, Text, View } from 'react-native';
import { SymbolView } from 'expo-symbols';
import { VibrancyView } from '@sbaiahmed1/react-native-blur';

import { Section } from '@/ui/screen';
import { useTheme } from '@/ui/theme';

const MODES = [
  { label: 'Focus', ios: 'moon.fill', md: 'bedtime' },
  { label: 'Work', ios: 'briefcase.fill', md: 'work' },
  { label: 'Sleep', ios: 'bed.double.fill', md: 'hotel' },
] as const;

/** Labels and icons that take their color from the blur behind them. */
export function VibrancySection() {
  const t = useTheme();
  return (
    <Section title="Vibrancy" badge="iOS">
      <VibrancyView
        blurType={t.dark ? 'systemMaterialDark' : 'systemMaterialLight'}
        blurAmount={30}
        style={styles.card}
      >
        <View style={styles.row}>
          {MODES.map((mode) => (
            <View key={mode.label} style={styles.mode}>
              <SymbolView
                name={
                  { ios: mode.ios, android: mode.md, web: mode.md } as never
                }
                size={26}
                tintColor={t.colors.text}
              />
              <Text
                style={[
                  t.font.footnote,
                  styles.label,
                  { color: t.colors.text },
                ]}
              >
                {mode.label}
              </Text>
            </View>
          ))}
        </View>
      </VibrancyView>
      <Text style={[t.font.footnote, { color: t.colors.textMuted }]}>
        On Android, VibrancyView renders a regular BlurView.
      </Text>
    </Section>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 24, padding: 20, overflow: 'hidden' },
  row: { flexDirection: 'row', justifyContent: 'space-around' },
  mode: { alignItems: 'center', gap: 8, minWidth: 64 },
  label: { fontWeight: '600' },
});
