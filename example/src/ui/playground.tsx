import { useState, type ReactNode } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SymbolView } from 'expo-symbols';

import { Backdrop, type BackdropVariant } from './backdrop';
import { Group } from './group';
import { Segmented } from './segmented';
import { TAB_BAR_SPACE } from './tab-bar';
import { useTheme } from './theme';

const BACKDROPS = ['shapes', 'bands', 'text'] as const;

type WebClipboard = {
  navigator?: { clipboard?: { writeText(text: string): Promise<void> } };
};

async function shareCode(code: string) {
  if (Platform.OS === 'web') {
    await (globalThis as WebClipboard).navigator?.clipboard?.writeText(code);
    return;
  }
  await Share.share({ message: code });
}

function CodeBlock({ code }: { code: string }) {
  const t = useTheme();
  const web = Platform.OS === 'web';
  return (
    <View style={[styles.code, { backgroundColor: t.colors.surface }]}>
      <Text
        selectable
        style={[t.font.mono, styles.grow, { color: t.colors.text }]}
      >
        {code}
      </Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={web ? 'Copy code' : 'Share code'}
        hitSlop={10}
        onPress={() => shareCode(code)}
      >
        <SymbolView
          name={{
            ios: 'square.and.arrow.up',
            android: 'share',
            web: 'content_copy',
          }}
          size={20}
          tintColor={t.colors.accent}
        />
      </Pressable>
    </View>
  );
}

/** Live preview over a switchable backdrop, its controls, and the matching JSX. */
export function Playground({
  preview,
  controls,
  code,
  notice,
}: {
  preview: ReactNode;
  controls: ReactNode;
  code: string;
  notice?: string;
}) {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const [backdrop, setBackdrop] = useState<BackdropVariant>('bands');
  return (
    <ScrollView
      style={{ backgroundColor: t.colors.grouped }}
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={[
        styles.content,
        { paddingBottom: insets.bottom + TAB_BAR_SPACE },
      ]}
    >
      {notice ? (
        <View style={[styles.notice, { backgroundColor: t.colors.chip }]}>
          <SymbolView
            name={{ ios: 'info.circle', android: 'info', web: 'info' }}
            size={16}
            tintColor={t.colors.textMuted}
          />
          <Text
            style={[t.font.footnote, styles.grow, { color: t.colors.text }]}
          >
            {notice}
          </Text>
        </View>
      ) : null}
      <View style={styles.stage}>
        <Backdrop variant={backdrop}>{preview}</Backdrop>
      </View>
      <Group>
        <Segmented
          label="Backdrop"
          value={backdrop}
          options={BACKDROPS}
          onChange={setBackdrop}
        />
      </Group>
      <Group>{controls}</Group>
      <CodeBlock code={code} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, gap: 20 },
  notice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
  },
  stage: { height: 260, borderRadius: 20, overflow: 'hidden' },
  code: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    gap: 12,
    borderRadius: 12,
  },
  grow: { flex: 1 },
});
