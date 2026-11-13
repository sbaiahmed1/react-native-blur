import { StyleSheet, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { parseBenchParams } from '@/benchmark/params';
import { DEFAULT_PARAMS } from '@/benchmark/scenes';
import { BlurHeaderFeed } from '@/benchmark/scenes/stack-push';

export default function BenchmarkDetail() {
  const insets = useSafeAreaInsets();
  const params = parseBenchParams(useLocalSearchParams(), DEFAULT_PARAMS);
  return (
    <View
      testID="bench-detail"
      style={[styles.root, { paddingTop: insets.top }]}
    >
      <BlurHeaderFeed params={params} title="Detail" />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
});
