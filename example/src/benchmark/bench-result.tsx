import type React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';

import type { FrameSummary } from './frame-stats';
import type { BenchParams } from './params';
import { useTheme } from '../ui/theme';

export function benchResultJson(
  scene: string,
  params: BenchParams,
  summary: FrameSummary
): string {
  return JSON.stringify({ scene, platform: Platform.OS, params, summary });
}

export function BenchResult({
  scene,
  params,
  summary,
}: {
  scene: string;
  params: BenchParams;
  summary: FrameSummary | null;
}): React.JSX.Element {
  const t = useTheme();
  if (!summary) return <></>;
  const json = benchResultJson(scene, params, summary);
  // One labelled accessibility element, so testID and the JSON are readable on both platforms.
  return (
    <View
      testID="bench-result"
      accessible
      accessibilityLabel={json}
      style={[
        styles.card,
        { backgroundColor: t.colors.surface, borderColor: t.colors.border },
      ]}
    >
      <Text
        selectable
        style={[t.font.mono, styles.json, { color: t.colors.text }]}
      >
        {json}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 12,
  },
  json: { fontSize: 11, lineHeight: 15 },
});
