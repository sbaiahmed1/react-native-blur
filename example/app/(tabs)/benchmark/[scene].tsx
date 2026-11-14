import { useCallback, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Link, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BenchResult, benchResultJson } from '@/benchmark/bench-result';
import type { FrameSummary } from '@/benchmark/frame-stats';
import { benchRunKey, parseBenchParams } from '@/benchmark/params';
import { nextPhase, type RunEvent, type RunPhase } from '@/benchmark/run-phase';
import { DEFAULT_PARAMS, getScene, type SceneDef } from '@/benchmark/scenes';
import { useFrameRecorder } from '@/benchmark/use-frame-recorder';
import { useTheme } from '@/ui/theme';

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
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const params = parseBenchParams(raw, {
    ...DEFAULT_PARAMS,
    ...scene.defaults,
  });
  const initial: RunPhase = params.autoplay ? 'running' : 'idle';
  const phaseRef = useRef<RunPhase>(initial);
  const [phase, setPhase] = useState<RunPhase>(initial);
  const [summary, setSummary] = useState<FrameSummary | null>(null);
  const running = phase === 'running';

  // The ref answers right away, so a finish that lands after a stop is dropped.
  const send = useCallback((event: RunEvent) => {
    const next = nextPhase(phaseRef.current, event);
    phaseRef.current = next;
    setPhase(next);
    return next;
  }, []);

  const onDone = useCallback(
    (result: FrameSummary) => {
      if (send('finish') !== 'done') return;
      console.log(`BENCH_RESULT ${benchResultJson(scene.id, params, result)}`);
      setSummary(result);
    },
    [send, scene.id, params]
  );
  const onStop = useCallback(() => send('stop'), [send]);

  useFrameRecorder(running, params.duration, onDone);

  const { Component } = scene;
  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <Component params={params} running={running} onStop={onStop} />
      <View
        style={[styles.controls, { bottom: insets.bottom + 16 }]}
        pointerEvents="box-none"
      >
        {phase !== 'stopped' ? null : (
          <Text
            testID="bench-stopped"
            style={[
              t.font.label,
              styles.pill,
              { backgroundColor: t.colors.surface, color: t.colors.text },
            ]}
          >
            Run stopped. No result was recorded.
          </Text>
        )}
        {phase !== 'idle' ? null : (
          <Pressable
            testID="bench-start"
            accessibilityRole="button"
            style={[styles.start, { backgroundColor: t.colors.text }]}
            onPress={() => send('start')}
          >
            <Text style={[t.font.headline, { color: t.colors.bg }]}>
              {`Start ${scene.title}`}
            </Text>
          </Pressable>
        )}
        <BenchResult scene={scene.id} params={params} summary={summary} />
      </View>
    </View>
  );
}

function UnknownScene({ id }: { id: string }) {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[
        styles.unknown,
        { paddingTop: insets.top + 24, backgroundColor: t.colors.grouped },
      ]}
    >
      <Text
        testID="bench-unknown"
        style={[t.font.title, { color: t.colors.text }]}
      >
        {`Unknown scene: ${id}`}
      </Text>
      <Link
        href="/benchmark"
        style={[t.font.headline, { color: t.colors.accent }]}
      >
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
    gap: 8,
  },
  start: {
    alignSelf: 'center',
    minHeight: 48,
    borderRadius: 24,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pill: {
    alignSelf: 'center',
    overflow: 'hidden',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  unknown: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
    gap: 16,
  },
});
