import { useCallback } from 'react';
import { useFocusEffect } from 'expo-router';

import { FeedList } from '../content';
import { setRootOverlayVisible } from '../root-overlay';
import type { SceneProps } from '../scenes';

export default function RootOverlay({ params, running }: SceneProps) {
  // Tied to focus, since a scene opened on top keeps this one mounted.
  useFocusEffect(
    useCallback(() => {
      setRootOverlayVisible(true);
      return () => setRootOverlayVisible(false);
    }, [])
  );

  return <FeedList scrolling={running} images={params.images} />;
}
