import { StyleSheet, Text, View } from 'react-native';
import { BlurView } from '@sbaiahmed1/react-native-blur';

import { FeedList } from '../content';
import type { SceneProps } from '../scenes';

export function OverlapList({
  params,
  running,
  badges,
}: Pick<SceneProps, 'params' | 'running'> & { badges: boolean }) {
  return (
    <FeedList
      scrolling={running}
      images={params.images}
      renderRowOverlay={(index) =>
        index % 3 === 0 ? (
          <BlurView
            blurType="light"
            blurAmount={params.amount}
            blurRounds={params.rounds}
            style={styles.card}
          >
            <Text style={styles.cardText}>{`Card ${index + 1}`}</Text>
            {badges ? (
              <BlurView
                blurType="dark"
                blurAmount={params.amount}
                blurRounds={params.rounds}
                style={styles.badge}
              />
            ) : null}
          </BlurView>
        ) : null
      }
    >
      <View pointerEvents="none">
        <BlurView
          blurType="light"
          blurAmount={params.amount}
          blurRounds={params.rounds}
          style={styles.header}
        />
      </View>
    </FeedList>
  );
}

export default function Overlap({ params, running }: SceneProps) {
  return <OverlapList params={params} running={running} badges={false} />;
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    margin: 12,
    borderRadius: 16,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  cardText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111111',
  },
  badge: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 64,
    height: 28,
    borderRadius: 14,
  },
  header: {
    height: 120,
  },
});
