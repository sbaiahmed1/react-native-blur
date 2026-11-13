import { useEffect } from 'react';
import { StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { BlurView } from '@sbaiahmed1/react-native-blur';

import { FeedList } from '../content';
import type { BenchParams } from '../params';
import type { SceneProps } from '../scenes';

const SWITCH_MS = 1000;

export function BlurHeaderFeed({
  params,
  title,
}: {
  params: BenchParams;
  title: string;
}) {
  return (
    <FeedList scrolling={false} images={params.images}>
      <BlurView
        blurType="light"
        blurAmount={params.amount}
        blurRounds={params.rounds}
        style={styles.header}
      >
        <Text style={styles.title}>{title}</Text>
      </BlurView>
    </FeedList>
  );
}

export default function StackPush({ params, running }: SceneProps) {
  const router = useRouter();
  const { animation, images, amount, rounds } = params;

  useEffect(() => {
    if (!running) return;
    let pushed = false;
    const id = setInterval(() => {
      if (pushed) {
        router.back();
      } else {
        router.push({
          pathname: '/benchmark/detail',
          params: {
            animation,
            images: images ? '1' : '0',
            amount: String(amount),
            rounds: String(rounds),
          },
        });
      }
      pushed = !pushed;
    }, SWITCH_MS);
    return () => {
      clearInterval(id);
      if (pushed) router.back();
    };
  }, [running, router, animation, images, amount, rounds]);

  return <BlurHeaderFeed params={params} title="Stack push" />;
}

const styles = StyleSheet.create({
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 96,
    justifyContent: 'flex-end',
    padding: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111111',
  },
});
