import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SymbolView } from 'expo-symbols';
import { LiquidGlassView } from '@sbaiahmed1/react-native-blur';

import { SHAPES, useTheme } from '@/ui/theme';

const TOGGLES = [
  { label: 'Wi-Fi', ios: 'wifi', md: 'wifi', color: SHAPES.blue },
  {
    label: 'Bluetooth',
    ios: 'antenna.radiowaves.left.and.right',
    md: 'bluetooth',
    color: SHAPES.blue,
  },
] as const;

const BUTTONS = [
  { label: 'Flashlight', ios: 'flashlight.on.fill', md: 'flashlight_on' },
  { label: 'Timer', ios: 'timer', md: 'timer' },
  { label: 'Camera', ios: 'camera.fill', md: 'photo_camera' },
] as const;

/** Glass tiles over the color field, in the shape of a control center. */
export function ControlCenter() {
  const t = useTheme();
  const [on, setOn] = useState([true, false]);
  const [lit, setLit] = useState(-1);
  return (
    <View style={styles.grid}>
      <View style={styles.row}>
        <LiquidGlassView glassType="regular" style={styles.tile}>
          {TOGGLES.map((toggle, i) => (
            <Pressable
              key={toggle.label}
              accessibilityRole="switch"
              accessibilityLabel={toggle.label}
              accessibilityState={{ checked: on[i] }}
              onPress={() =>
                setOn((prev) => prev.map((v, j) => (j === i ? !v : v)))
              }
              style={styles.toggle}
            >
              <View
                style={[
                  styles.dot,
                  { backgroundColor: on[i] ? toggle.color : t.colors.chip },
                ]}
              >
                <SymbolView
                  name={
                    {
                      ios: toggle.ios,
                      android: toggle.md,
                      web: toggle.md,
                    } as never
                  }
                  size={16}
                  tintColor={on[i] ? '#FFFFFF' : t.colors.text}
                />
              </View>
              <Text
                style={[t.font.footnote, styles.bold, { color: t.colors.text }]}
              >
                {toggle.label}
              </Text>
            </Pressable>
          ))}
        </LiquidGlassView>
        <LiquidGlassView
          glassType="regular"
          style={[styles.tile, styles.slider]}
        >
          <View style={[styles.level, { backgroundColor: t.colors.text }]} />
          <SymbolView
            name={{
              ios: 'sun.max.fill',
              android: 'light_mode',
              web: 'light_mode',
            }}
            size={20}
            tintColor={t.colors.bg}
            style={styles.sun}
          />
        </LiquidGlassView>
      </View>
      <View style={styles.row}>
        {BUTTONS.map((button, i) => (
          <LiquidGlassView
            key={button.label}
            glassType="regular"
            glassTintColor={lit === i ? SHAPES.orange : undefined}
            style={styles.round}
          >
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={button.label}
              accessibilityState={{ selected: lit === i }}
              onPress={() => setLit((current) => (current === i ? -1 : i))}
              style={styles.press}
            >
              <SymbolView
                name={
                  {
                    ios: button.ios,
                    android: button.md,
                    web: button.md,
                  } as never
                }
                size={22}
                tintColor={t.colors.text}
              />
            </Pressable>
          </LiquidGlassView>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { gap: 16 },
  row: { flexDirection: 'row', gap: 16 },
  tile: {
    flex: 1,
    height: 152,
    borderRadius: 32,
    padding: 16,
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  toggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: 44,
  },
  dot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bold: { fontWeight: '600' },
  slider: { flex: 0, width: 76, padding: 0, justifyContent: 'flex-end' },
  level: { height: '55%' },
  sun: { position: 'absolute', bottom: 14, alignSelf: 'center' },
  round: { flex: 1, aspectRatio: 1, borderRadius: 9999, overflow: 'hidden' },
  press: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
