import {
  Linking,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SymbolView } from 'expo-symbols';

import { version } from '../../../package.json';
import { Group, cell } from './group';
import { PlatformBadge } from './platform-badge';
import { useTheme } from './theme';

const COMPONENTS = [
  {
    name: 'BlurView',
    text: 'Blur behind any view, with 21 blur types.',
    badge: undefined,
  },
  {
    name: 'ProgressiveBlurView',
    text: 'A blur that fades across the view.',
    badge: undefined,
  },
  {
    name: 'VibrancyView',
    text: 'Content that takes its color from the blur.',
    badge: 'iOS',
  },
  {
    name: 'LiquidGlassView',
    text: 'Liquid glass, with a blur fallback on older systems.',
    badge: 'iOS 26 and Android 13',
  },
  {
    name: 'LiquidGlassContainer',
    text: 'Glass shapes that merge when close.',
    badge: 'iOS 26',
  },
  {
    name: 'BlurSwitch',
    text: 'A blurred switch on Android, the system switch on iOS.',
    badge: 'Android',
  },
] as const;

const LINKS = [
  {
    label: 'Documentation',
    url: 'https://sbaiahmed1.github.io/react-native-blur',
  },
  { label: 'GitHub', url: 'https://github.com/sbaiahmed1/react-native-blur' },
  {
    label: 'npm',
    url: 'https://www.npmjs.com/package/@sbaiahmed1/react-native-blur',
  },
] as const;

export function AboutSheet({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const t = useTheme();
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <ScrollView
        style={{ backgroundColor: t.colors.grouped }}
        contentContainerStyle={styles.content}
      >
        <View style={styles.header}>
          <View style={styles.grow}>
            <Text style={[t.font.title, { color: t.colors.text }]}>
              React Native Blur
            </Text>
            <Text style={[t.font.label, { color: t.colors.textMuted }]}>
              Version {version}
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close"
            hitSlop={10}
            onPress={onClose}
            style={[styles.close, { backgroundColor: t.colors.chip }]}
          >
            <SymbolView
              name={{ ios: 'xmark', android: 'close', web: 'close' }}
              size={14}
              tintColor={t.colors.text}
            />
          </Pressable>
        </View>
        <Group>
          {COMPONENTS.map((c) => (
            <View key={c.name} style={cell.column}>
              <View style={styles.title}>
                <Text style={[t.font.headline, { color: t.colors.text }]}>
                  {c.name}
                </Text>
                {c.badge ? <PlatformBadge text={c.badge} /> : null}
              </View>
              <Text style={[t.font.label, { color: t.colors.textMuted }]}>
                {c.text}
              </Text>
            </View>
          ))}
        </Group>
        <Group>
          {LINKS.map((link) => (
            <Pressable
              key={link.label}
              accessibilityRole="link"
              onPress={() => Linking.openURL(link.url)}
              style={cell.row}
            >
              <Text style={[t.font.body, { color: t.colors.accent }]}>
                {link.label}
              </Text>
              <SymbolView
                name={{
                  ios: 'arrow.up.right',
                  android: 'open_in_new',
                  web: 'open_in_new',
                }}
                size={14}
                tintColor={t.colors.textMuted}
              />
            </Pressable>
          ))}
        </Group>
      </ScrollView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, gap: 20 },
  header: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  grow: { flex: 1 },
  close: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
});
