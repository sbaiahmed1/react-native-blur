import { useEffect } from 'react';

import { FeedList } from '../content';
import { setRootOverlayVisible } from '../root-overlay';
import type { SceneProps } from '../scenes';

export default function RootOverlay({ params, running }: SceneProps) {
  useEffect(() => {
    setRootOverlayVisible(true);
    return () => setRootOverlayVisible(false);
  }, []);

  return <FeedList scrolling={running} images={params.images} />;
}
