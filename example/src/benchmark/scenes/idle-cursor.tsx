import { StyleSheet, TextInput, View } from 'react-native';
import { BlurView } from '@sbaiahmed1/react-native-blur';

import { FeedList } from '../content';
import type { SceneProps } from '../scenes';

export default function IdleCursor({ params }: SceneProps) {
  return (
    <FeedList scrolling={false} images={params.images}>
      <View style={styles.stack} pointerEvents="box-none">
        <BlurView
          blurType="light"
          blurAmount={params.amount}
          blurRounds={params.rounds}
          style={styles.bar}
        />
        <TextInput
          testID="bench-idle-input"
          autoFocus
          showSoftInputOnFocus={false}
          defaultValue="caret"
          style={styles.input}
        />
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
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 18,
    color: '#111111',
  },
});
