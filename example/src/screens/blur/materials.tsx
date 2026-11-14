import { StyleSheet, Text, View } from 'react-native';
import { SymbolView } from 'expo-symbols';
import { BlurView, type BlurType } from '@sbaiahmed1/react-native-blur';

import { useTheme } from '@/ui/theme';

/** The same widget in a thin and a thick material, side by side over the same colors. */
export function Materials() {
  const t = useTheme();
  const pair: { label: string; type: BlurType }[] = [
    {
      label: 'Ultra thin',
      type: t.dark
        ? 'systemUltraThinMaterialDark'
        : 'systemUltraThinMaterialLight',
    },
    {
      label: 'Thick',
      type: t.dark ? 'systemThickMaterialDark' : 'systemThickMaterialLight',
    },
  ];
  return (
    <View style={styles.pair}>
      {pair.map(({ label, type }) => (
        <BlurView
          key={label}
          blurType={type}
          blurAmount={100}
          reducedTransparencyFallbackColor={t.colors.surface}
          style={styles.widget}
        >
          <SymbolView
            name={{
              ios: 'cloud.sun.fill',
              android: 'partly_cloudy_day',
              web: 'partly_cloudy_day',
            }}
            size={22}
            type="hierarchical"
            tintColor={t.colors.text}
          />
          <Text style={[styles.temp, { color: t.colors.text }]}>21°</Text>
          <Text style={[t.font.footnote, { color: t.colors.text }]}>
            {label}
          </Text>
          <Text
            style={[t.font.caption, { color: t.colors.textMuted }]}
            numberOfLines={1}
          >
            {type}
          </Text>
        </BlurView>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  pair: { flexDirection: 'row', gap: 16 },
  widget: {
    flex: 1,
    borderRadius: 24,
    padding: 16,
    gap: 4,
    overflow: 'hidden',
  },
  temp: { fontSize: 40, lineHeight: 46, fontWeight: '300' },
});
