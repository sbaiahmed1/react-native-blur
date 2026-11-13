import { StyleSheet } from 'react-native';
import { BlurView } from '@sbaiahmed1/react-native-blur';

import { FeedList } from '../content';
import type { SceneProps } from '../scenes';

const EVERY = 5;

export default function BlurInScroll({ params, running }: SceneProps) {
  const renderRowOverlay = (index: number) => {
    const isBlurRow = (index + 1) % EVERY === 0;
    if (!isBlurRow || Math.floor(index / EVERY) >= params.count) return null;
    return (
      <BlurView
        blurType="light"
        blurAmount={params.amount}
        blurRounds={params.rounds}
        style={StyleSheet.absoluteFill}
      />
    );
  };

  return (
    <FeedList
      scrolling={running}
      images={params.images}
      renderRowOverlay={renderRowOverlay}
    />
  );
}
