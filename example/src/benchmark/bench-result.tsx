import type React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';

import type { FrameSummary } from './frame-stats';
import type { BenchParams } from './params';

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
  if (!summary) return <></>;
  const json = benchResultJson(scene, params, summary);
  // One labelled accessibility element, so testID and the JSON are readable on both platforms.
  return (
    <View
      testID="bench-result"
      accessible
      accessibilityLabel={json}
      style={styles.card}
    >
      <Text selectable style={styles.json}>
        {json}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    borderRadius: 12,
    padding: 12,
  },
  json: {
    fontFamily: Platform.select({ ios: 'Menlo', default: 'monospace' }),
    fontSize: 11,
    color: '#111111',
  },
});
