import { Modal, StyleSheet, Text } from 'react-native';
import { BlurView } from '@sbaiahmed1/react-native-blur';

import { FeedList } from '../content';
import type { SceneProps } from '../scenes';

export function ModalScene({
  params,
  running,
  onStop,
  scrolling,
}: SceneProps & { scrolling: boolean }) {
  return (
    <FeedList scrolling={scrolling} images={params.images}>
      <Modal
        visible={running}
        transparent
        animationType="none"
        onRequestClose={onStop}
      >
        <BlurView
          blurType="light"
          blurAmount={params.amount}
          blurRounds={params.rounds}
          style={styles.fill}
        >
          <Text style={styles.text}>Blur in a Modal</Text>
        </BlurView>
      </Modal>
    </FeedList>
  );
}

export default function ModalIdle(props: SceneProps) {
  return <ModalScene {...props} scrolling={false} />;
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111111',
  },
});
