import { Pressable, StyleSheet, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SymbolView } from 'expo-symbols';
import { LiquidGlassView } from '@sbaiahmed1/react-native-blur';

import { isTabBarVisible } from './tab-bar-visibility';
import { useTheme } from './theme';

/** Bottom padding a screen needs so its last row clears the floating bar. */
export const TAB_BAR_SPACE = 96;

export const TABS = [
  { name: 'blur', label: 'Blur', ios: 'camera.filters', md: 'blur_on' },
  {
    name: 'progressive',
    label: 'Progressive',
    ios: 'square.bottomhalf.filled',
    md: 'gradient',
  },
  { name: 'glass', label: 'Glass', ios: 'drop.fill', md: 'water_drop' },
  { name: 'benchmark', label: 'Benchmark', ios: 'speedometer', md: 'speed' },
] as const;

type TabBarProps = {
  state: {
    index: number;
    routes: readonly {
      key: string;
      name: string;
      state?: { index?: number };
    }[];
  };
  navigateToTab: (routeKey: string) => void;
};

export function GlassTabBar({ state, navigateToTab }: TabBarProps) {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  if (!isTabBarVisible(state)) return null;
  const current = state.routes[state.index]?.name;
  const tabs = TABS.filter((tab) =>
    state.routes.some((r) => r.name === tab.name)
  );

  return (
    <LiquidGlassView
      glassType="regular"
      isInteractive
      reducedTransparencyFallbackColor={t.colors.surface}
      style={[styles.bar, { bottom: Math.max(insets.bottom, 12) + 4 }]}
      accessibilityRole="tablist"
    >
      {tabs.map((tab) => {
        const selected = current === tab.name;
        const color = selected ? t.colors.text : t.colors.textMuted;
        return (
          <Pressable
            key={tab.name}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            accessibilityLabel={tab.label}
            onPress={() => {
              const route = state.routes.find((r) => r.name === tab.name);
              if (route) navigateToTab(route.key);
            }}
            style={[
              styles.item,
              selected && { backgroundColor: t.colors.chip },
            ]}
          >
            <SymbolView
              name={{ ios: tab.ios, android: tab.md, web: tab.md } as never}
              size={22}
              tintColor={color}
            />
            <Text style={[t.font.caption, { color }]}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </LiquidGlassView>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    left: 20,
    right: 20,
    height: 64,
    borderRadius: 32,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    overflow: 'hidden',
  },
  item: {
    flex: 1,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
});
