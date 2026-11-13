import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Link, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BenchResult, benchResultJson } from '@/benchmark/bench-result';
import type { FrameSummary } from '@/benchmark/frame-stats';
import { benchRunKey, parseBenchParams } from '@/benchmark/params';
import { DEFAULT_PARAMS, getScene, type SceneDef } from '@/benchmark/scenes';
import { useFrameRecorder } from '@/benchmark/use-frame-recorder';

type RawParams = Record<string, string | string[] | undefined>;

function firstString(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value) ?? '';
}

export default function SceneScreen() {
  const raw = useLocalSearchParams();
  const id = firstString(raw.scene);
  const scene = getScene(id);
  if (!scene) return <UnknownScene id={id} />;
  return <SceneRunner key={benchRunKey(raw)} scene={scene} raw={raw} />;
}

function SceneRunner({ scene, raw }: { scene: SceneDef; raw: RawParams }) {
  const insets = useSafeAreaInsets();
  const params = parseBenchParams(raw, {
    ...DEFAULT_PARAMS,
    ...scene.defaults,
  });
  const [phase, setPhase] = useState<'idle' | 'running' | 'done'>(
    params.autoplay ? 'running' : 'idle'
  );
  const [summary, setSummary] = useState<FrameSummary | null>(null);
  const running = phase === 'running';

  const onDone = useCallback(
    (result: FrameSummary) => {
      console.log(`BENCH_RESULT ${benchResultJson(scene.id, params, result)}`);
      setSummary(result);
      setPhase('done');
    },
    [scene.id, params]
  );

  useFrameRecorder(running, params.duration, onDone);

  const { Component } = scene;
  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <Component params={params} running={running} />
      <View style={styles.controls} pointerEvents="box-none">
        {phase !== 'idle' ? null : (
          <Pressable
            testID="bench-start"
            accessibilityRole="button"
            style={styles.start}
            onPress={() => setPhase('running')}
          >
            <Text style={styles.startText}>{`Start ${scene.title}`}</Text>
          </Pressable>
        )}
        <BenchResult scene={scene.id} params={params} summary={summary} />
      </View>
    </View>
  );
}

function UnknownScene({ id }: { id: string }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.unknown, { paddingTop: insets.top + 24 }]}>
      <Text testID="bench-unknown" style={styles.unknownText}>
        {`Unknown scene: ${id}`}
      </Text>
      <Link href="/benchmark" style={styles.link}>
        Back to the scene list
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  controls: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 16,
    gap: 8,
  },
  start: {
    alignSelf: 'center',
    backgroundColor: '#111111',
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  startText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  unknown: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    gap: 16,
  },
  unknownText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111111',
  },
  link: {
    fontSize: 16,
    color: '#0A64D8',
  },
});
