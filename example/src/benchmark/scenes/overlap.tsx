import { StyleSheet, Text, View } from 'react-native';
import { BlurView } from '@sbaiahmed1/react-native-blur';

import { FeedList } from '../content';
import type { SceneProps } from '../scenes';

export default function Overlap({ params, running }: SceneProps) {
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
  header: {
    height: 120,
  },
});
