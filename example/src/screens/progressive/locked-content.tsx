import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ProgressiveBlurView } from '@sbaiahmed1/react-native-blur';

import { Section } from '@/ui/screen';
import { useTheme } from '@/ui/theme';

const BODY = [
  'The first light reaches the harbor a little after six. By then the boats are already out, and the market stalls are half built, their awnings still rolled.',
  'Most visitors come for the fish auction at seven. The regulars come for the bakery behind it, which sells out of its rye loaves before the first crate is opened.',
];

/** An article that fades into a blur where the paywall starts. */
export function LockedContent() {
  const t = useTheme();
  const [unlocked, setUnlocked] = useState(false);
  return (
    <Section title="Locked content">
      <View style={[styles.card, { backgroundColor: t.colors.surface }]}>
        <View style={styles.article}>
          <Text style={[t.font.title, { color: t.colors.text }]}>
            Morning at the harbor
          </Text>
          {BODY.map((paragraph) => (
            <Text
              key={paragraph}
              style={[t.font.label, { color: t.colors.text }]}
            >
              {paragraph}
            </Text>
          ))}
        </View>
        {unlocked ? null : (
          <ProgressiveBlurView
            direction="blurredBottomClearTop"
            startOffset={0.45}
            blurType={t.dark ? 'dark' : 'light'}
            blurAmount={20}
            reducedTransparencyFallbackColor={t.colors.surface}
            style={styles.fade}
          />
        )}
        <Pressable
          accessibilityRole="button"
          onPress={() => setUnlocked((u) => !u)}
          style={[styles.button, { backgroundColor: t.colors.text }]}
        >
          <Text style={[t.font.headline, { color: t.colors.bg }]}>
            {unlocked ? 'Lock again' : 'Subscribe to keep reading'}
          </Text>
        </Pressable>
      </View>
    </Section>
  );
}

const styles = StyleSheet.create({
  card: { height: 300, borderRadius: 24, overflow: 'hidden' },
  article: { padding: 20, gap: 10 },
  fade: { position: 'absolute', left: 0, right: 0, bottom: 0, height: '62%' },
  button: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 20,
    minHeight: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
