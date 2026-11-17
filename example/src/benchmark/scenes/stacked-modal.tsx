import { useEffect, useRef, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text } from 'react-native';

import { FeedList } from '../content';
import type { SceneProps } from '../scenes';
import { StackedCardLayer } from './stacked';

export default function StackedModal({ params, running, onStop }: SceneProps) {
  // Open from mount so a still shows it, open during a run, and closed after one so the result shows.
  const [open, setOpen] = useState(true);
  const ran = useRef(false);
  useEffect(() => {
    if (running) ran.current = true;
    else if (ran.current) setOpen(false);
  }, [running]);

  return (
    <FeedList scrolling={running} images={params.images}>
      <Modal
        visible={open || running}
        transparent
        animationType="none"
        onRequestClose={() => {
          setOpen(false);
          onStop();
        }}
      >
        <StackedCardLayer params={params} layout="stack" />
        {/* The Modal takes every touch and iOS has no back button, so it closes here to reach Start. */}
        {running ? null : (
          <Pressable
            testID="stacked-modal-close"
            accessibilityRole="button"
            onPress={() => setOpen(false)}
            style={styles.close}
          >
            <Text style={styles.closeText}>Close</Text>
          </Pressable>
        )}
      </Modal>
    </FeedList>
  );
}

const styles = StyleSheet.create({
  close: {
    position: 'absolute',
    bottom: 48,
    alignSelf: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: '#111111',
  },
  closeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
