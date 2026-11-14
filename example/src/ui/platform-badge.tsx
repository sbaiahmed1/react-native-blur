import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from './theme';

const HUES = { ios: '#0A64FF', android: '#14A05A' };

/** One chip per platform limit, colored by platform. */
export function PlatformBadge({ text }: { text: string }) {
  const t = useTheme();
  const key = text.toLowerCase();
  const hue = key.startsWith('ios')
    ? HUES.ios
    : key.startsWith('android')
      ? HUES.android
      : t.colors.textMuted;
  return (
    <View style={[styles.badge, { backgroundColor: `${hue}22` }]}>
      <Text style={[t.font.caption, { color: hue }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
});
