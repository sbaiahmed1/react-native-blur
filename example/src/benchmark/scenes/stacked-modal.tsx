import { useEffect, useRef, useState } from 'react';
import { Modal } from 'react-native';

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
      </Modal>
    </FeedList>
  );
}
