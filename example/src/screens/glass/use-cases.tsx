import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SymbolView } from 'expo-symbols';
import { LiquidGlassView } from '@sbaiahmed1/react-native-blur';

import { MaterialCard, Section } from '@/ui/screen';
import { SHAPES, useTheme } from '@/ui/theme';

const COVERS = [SHAPES.blue, SHAPES.violet, SHAPES.pink] as const;

/** Glass buttons floating over artwork, like a video or music player. */
function ButtonsOverMedia() {
  const [cover, setCover] = useState(0);
  const [playing, setPlaying] = useState(false);
  const step = (by: number) =>
    setCover((c) => (c + by + COVERS.length) % COVERS.length);
  const controls = [
    {
      label: 'Previous',
      ios: 'backward.fill',
      md: 'skip_previous',
      onPress: () => step(-1),
    },
    playing
      ? {
          label: 'Pause',
          ios: 'pause.fill',
          md: 'pause',
          onPress: () => setPlaying(false),
        }
      : {
          label: 'Play',
          ios: 'play.fill',
          md: 'play_arrow',
          onPress: () => setPlaying(true),
        },
    {
      label: 'Next',
      ios: 'forward.fill',
      md: 'skip_next',
      onPress: () => step(1),
    },
  ];
  return (
    <Section title="Buttons over media">
      <View style={styles.media}>
        <View style={[styles.fill, { backgroundColor: COVERS[cover] }]} />
        <View style={[styles.mediaSun, { backgroundColor: SHAPES.yellow }]} />
        <View style={[styles.mediaHill, { backgroundColor: SHAPES.green }]} />
        <View style={styles.controls}>
          {controls.map((control, i) => (
            <LiquidGlassView key={i} glassType="clear" style={styles.control}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={control.label}
                onPress={control.onPress}
                style={styles.press}
              >
                <SymbolView
                  name={
                    {
                      ios: control.ios,
                      android: control.md,
                      web: control.md,
                    } as never
                  }
                  size={22}
                  tintColor="#FFFFFF"
                />
              </Pressable>
            </LiquidGlassView>
          ))}
        </View>
      </View>
    </Section>
  );
}

/** A widget card in glass, tinted by the color behind it. */
function GlassCard() {
  const t = useTheme();
  return (
    <Section title="Card">
      <LiquidGlassView glassType="regular" style={styles.card}>
        <Text style={[t.font.footnote, styles.bold, { color: t.colors.text }]}>
          LISBON
        </Text>
        <Text style={[styles.temp, { color: t.colors.text }]}>21°</Text>
        <Text style={[t.font.label, { color: t.colors.text }]}>
          Partly cloudy. High 24°, low 15°.
        </Text>
      </LiquidGlassView>
    </Section>
  );
}

/** A glass sheet raised over the page. */
function GlassSheet() {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  return (
    <Section title="Sheet">
      <MaterialCard>
        <Text style={[t.font.label, { color: t.colors.text }]}>
          A glass sheet keeps the page visible behind its actions.
        </Text>
        <Pressable
          accessibilityRole="button"
          onPress={() => setOpen(true)}
          style={[styles.button, { backgroundColor: t.colors.text }]}
        >
          <Text style={[t.font.headline, { color: t.colors.bg }]}>
            Show sheet
          </Text>
        </Pressable>
      </MaterialCard>
      <Modal
        visible={open}
        transparent
        animationType="slide"
        statusBarTranslucent
        navigationBarTranslucent
        onRequestClose={close}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close the sheet"
          style={styles.fill}
          onPress={close}
        />
        <LiquidGlassView
          glassType="regular"
          style={[styles.sheet, { paddingBottom: insets.bottom + 20 }]}
        >
          <View style={[styles.handle, { backgroundColor: t.colors.border }]} />
          <Text
            style={[t.font.title, { color: t.colors.text }]}
            accessibilityRole="header"
          >
            Share photo
          </Text>
          {['Copy link', 'Save to Files', 'Add to album'].map((action) => (
            <Pressable
              key={action}
              accessibilityRole="button"
              onPress={close}
              style={[styles.action, { backgroundColor: t.colors.chip }]}
            >
              <Text style={[t.font.body, { color: t.colors.text }]}>
                {action}
              </Text>
            </Pressable>
          ))}
        </LiquidGlassView>
      </Modal>
    </Section>
  );
}

export function GlassUseCases() {
  return (
    <>
      <ButtonsOverMedia />
      <GlassCard />
      <GlassSheet />
    </>
  );
}

const styles = StyleSheet.create({
  fill: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 },
  media: {
    height: 220,
    borderRadius: 24,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  mediaSun: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    right: 40,
    top: 24,
  },
  mediaHill: {
    position: 'absolute',
    width: '140%',
    aspectRatio: 1,
    borderRadius: 9999,
    left: '-20%',
    top: '55%',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    paddingBottom: 20,
  },
  control: { width: 56, height: 56, borderRadius: 28, overflow: 'hidden' },
  press: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  card: { borderRadius: 28, padding: 20, gap: 4, overflow: 'hidden' },
  bold: { fontWeight: '600', letterSpacing: 0.6 },
  temp: { fontSize: 56, lineHeight: 64, fontWeight: '300' },
  button: {
    minHeight: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheet: {
    position: 'absolute',
    left: 8,
    right: 8,
    bottom: 8,
    borderRadius: 36,
    padding: 20,
    gap: 12,
    overflow: 'hidden',
  },
  handle: { alignSelf: 'center', width: 36, height: 5, borderRadius: 3 },
  action: {
    minHeight: 52,
    borderRadius: 16,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
});
