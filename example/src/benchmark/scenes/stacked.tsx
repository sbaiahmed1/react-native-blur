import { StyleSheet, Text, View } from 'react-native';
import { BlurView } from '@sbaiahmed1/react-native-blur';

import { FeedList } from '../content';
import type { SceneProps } from '../scenes';

export type StackLayout = 'stack' | 'zigzag' | 'wrapped' | 'badges';

type CardsProps = Pick<SceneProps, 'params'> & { layout: StackLayout };

function cardPosition(layout: StackLayout, index: number) {
  const zigzag = layout === 'zigzag' || layout === 'wrapped';
  return {
    top: 24 + 28 * index,
    left: zigzag ? 16 + (index % 2) * 56 : 16 + 8 * index,
  };
}

/** The cards alone, absolutely placed, so a scene can put them over the feed or in a Modal. */
export function StackedCardLayer({ params, layout }: CardsProps) {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {Array.from({ length: params.count }, (_, index) => {
        const position = cardPosition(layout, index);
        const card = (
          <BlurView
            key={index}
            blurType="light"
            blurAmount={params.amount}
            blurRounds={params.rounds}
            style={
              layout === 'wrapped'
                ? [styles.face, StyleSheet.absoluteFill]
                : [styles.face, styles.card, position]
            }
          >
            <Text style={styles.cardText}>{`Card ${index + 1}`}</Text>
            {layout === 'badges' ? (
              <BlurView
                blurType="dark"
                blurAmount={params.amount}
                blurRounds={params.rounds}
                style={styles.badge}
              />
            ) : null}
          </BlurView>
        );
        if (layout !== 'wrapped') return card;
        return (
          <View key={index} style={[styles.wrapper, position]}>
            {card}
          </View>
        );
      })}
    </View>
  );
}

export function StackedCards({
  params,
  running,
  layout,
}: Pick<SceneProps, 'params' | 'running'> & { layout: StackLayout }) {
  return (
    <FeedList scrolling={running} images={params.images}>
      <StackedCardLayer params={params} layout={layout} />
    </FeedList>
  );
}

export default function Stacked({ params, running }: SceneProps) {
  return <StackedCards params={params} running={running} layout="stack" />;
}

const styles = StyleSheet.create({
  face: {
    borderRadius: 20,
    padding: 16,
  },
  card: {
    position: 'absolute',
    width: 240,
    height: 160,
  },
  wrapper: {
    position: 'absolute',
    width: 240,
    height: 160,
    transform: [{ rotate: '-2deg' }],
    borderRadius: 24,
    borderWidth: 2,
    borderColor: 'rgba(0,0,0,0.25)',
  },
  badge: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 64,
    height: 32,
    borderRadius: 16,
  },
  cardText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111111',
  },
});
