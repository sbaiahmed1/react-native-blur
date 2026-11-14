import { StyleSheet, View } from 'react-native';
import { LiquidGlassView } from '@sbaiahmed1/react-native-blur';

import { FeedList } from '../content';
import type { SceneProps } from '../scenes';

export default function GlassList({ params, running }: SceneProps) {
  return (
    <FeedList scrolling={running} images={params.images}>
      <View style={styles.stack} pointerEvents="box-none">
        {Array.from({ length: params.count }, (_, index) => (
          <LiquidGlassView key={index} glassType="regular" style={styles.bar} />
        ))}
      </View>
    </FeedList>
  );
}

const styles = StyleSheet.create({
  stack: {
    paddingTop: 24,
    paddingHorizontal: 16,
    gap: 24,
  },
  bar: {
    height: 72,
    borderRadius: 24,
  },
});
