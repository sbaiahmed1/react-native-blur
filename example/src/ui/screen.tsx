import { useState, type ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SymbolView } from 'expo-symbols';
import { BlurView } from '@sbaiahmed1/react-native-blur';

import { AboutSheet } from './about-sheet';
import { ColorField } from './field';
import { FieldSheet } from './field-sheet';
import { PlatformBadge } from './platform-badge';
import { TAB_BAR_SPACE } from './tab-bar';
import { useTheme } from './theme';

/** A showcase tab: color field, large title, backdrop and About buttons, then the content. */
export function Screen({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const [about, setAbout] = useState(false);
  const [picker, setPicker] = useState(false);
  return (
    <View style={[styles.root, { backgroundColor: t.colors.bg }]}>
      <ColorField />
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: insets.top + 12,
            paddingBottom: insets.bottom + TAB_BAR_SPACE,
          },
        ]}
      >
        <View>
          <View style={styles.titleRow}>
            <Text
              style={[t.font.largeTitle, styles.grow, { color: t.colors.text }]}
              accessibilityRole="header"
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.7}
            >
              {title}
            </Text>
            <HeaderButton
              label="Choose the backdrop"
              ios="gearshape"
              md="settings"
              onPress={() => setPicker(true)}
            />
            <HeaderButton
              label="About the library"
              ios="info"
              md="info"
              onPress={() => setAbout(true)}
            />
          </View>
          {subtitle ? (
            <Text style={[t.font.label, { color: t.colors.textMuted }]}>
              {subtitle}
            </Text>
          ) : null}
        </View>
        {children}
      </ScrollView>
      <FieldSheet visible={picker} onClose={() => setPicker(false)} />
      <AboutSheet visible={about} onClose={() => setAbout(false)} />
    </View>
  );
}

function HeaderButton({
  label,
  ios,
  md,
  onPress,
}: {
  label: string;
  ios: string;
  md: string;
  onPress: () => void;
}) {
  const t = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={[styles.about, { backgroundColor: t.colors.chip }]}
    >
      <SymbolView
        name={{ ios, android: md, web: md } as never}
        size={18}
        tintColor={t.colors.text}
      />
    </Pressable>
  );
}

/** A titled block in a showcase, with an optional platform badge. */
export function Section({
  title,
  badge,
  children,
}: {
  title: string;
  badge?: string;
  children: ReactNode;
}) {
  const t = useTheme();
  return (
    <View style={styles.section}>
      <View style={styles.sectionTitle}>
        <Text
          style={[t.font.headline, { color: t.colors.text }]}
          accessibilityRole="header"
        >
          {title}
        </Text>
        {badge ? <PlatformBadge text={badge} /> : null}
      </View>
      {children}
    </View>
  );
}

/** The standard showcase card: the regular system material at full intensity, as UIKit draws it. */
export function MaterialCard({ children }: { children: ReactNode }) {
  const t = useTheme();
  return (
    <BlurView
      blurType={t.dark ? 'systemMaterialDark' : 'systemMaterialLight'}
      blurAmount={100}
      reducedTransparencyFallbackColor={t.colors.surface}
      style={styles.card}
    >
      {children}
    </BlurView>
  );
}

/** The card that opens a tab's playground. */
export function PlaygroundLink({
  text,
  onPress,
}: {
  text: string;
  onPress: () => void;
}) {
  const t = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Open the playground"
      onPress={onPress}
    >
      <MaterialCard>
        <View style={styles.linkRow}>
          <View style={[styles.linkIcon, { backgroundColor: t.colors.text }]}>
            <SymbolView
              name={{
                ios: 'slider.horizontal.3',
                android: 'tune',
                web: 'tune',
              }}
              size={18}
              tintColor={t.colors.bg}
            />
          </View>
          <View style={styles.grow}>
            <Text style={[t.font.headline, { color: t.colors.text }]}>
              Playground
            </Text>
            <Text style={[t.font.footnote, { color: t.colors.textMuted }]}>
              {text}
            </Text>
          </View>
          <SymbolView
            name={{
              ios: 'chevron.right',
              android: 'chevron_right',
              web: 'chevron_right',
            }}
            size={14}
            tintColor={t.colors.textMuted}
          />
        </View>
      </MaterialCard>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingHorizontal: 20, gap: 24 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  grow: { flex: 1 },
  about: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: { gap: 10 },
  sectionTitle: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  card: { borderRadius: 24, padding: 16, gap: 12, overflow: 'hidden' },
  linkRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  linkIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
