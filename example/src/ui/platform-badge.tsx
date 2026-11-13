import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from './theme';

const HUES = { ios: '#0A64FF', android: '#0B7A43' };

/** One solid chip per platform limit, readable over any backdrop. */
export function PlatformBadge({ text }: { text: string }) {
  const t = useTheme();
  const key = text.toLowerCase();
  const hue = key.startsWith('ios')
    ? HUES.ios
    : key.startsWith('android')
      ? HUES.android
      : t.colors.textMuted;
  return (
    <View style={[styles.badge, { backgroundColor: hue }]}>
      <Text style={[t.font.caption, styles.text]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  text: { color: '#FFFFFF' },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
});
