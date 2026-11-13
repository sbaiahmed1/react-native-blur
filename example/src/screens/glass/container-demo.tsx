import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  LiquidGlassContainer,
  LiquidGlassView,
} from '@sbaiahmed1/react-native-blur';

import { Backdrop } from '@/ui/backdrop';
import { NATIVE_GLASS_CONTAINER } from '@/ui/glass-support';
import { cell, Group } from '@/ui/group';
import { Section } from '@/ui/screen';
import { Slider } from '@/ui/slider';
import { useTheme } from '@/ui/theme';

const GAP = 24;

/** Two glass circles that blend into one shape as the container spacing grows. */
export function ContainerDemo() {
  const t = useTheme();
  const [spacing, setSpacing] = useState(60);
  return (
    <Section title="LiquidGlassContainer" badge="iOS 26">
      <View style={styles.stage}>
        <Backdrop variant="shapes">
          <LiquidGlassContainer spacing={spacing} style={styles.container}>
            <LiquidGlassView glassType="regular" style={styles.circle} />
            <LiquidGlassView glassType="regular" style={styles.circle} />
          </LiquidGlassContainer>
        </Backdrop>
      </View>
      <Group>
        <Slider
          label="spacing"
          value={spacing}
          min={0}
          max={80}
          onChange={setSpacing}
        />
        <View style={cell.column}>
          <Text style={[t.font.footnote, { color: t.colors.textMuted }]}>
            {NATIVE_GLASS_CONTAINER
              ? 'Glass views closer than the spacing blend into one shape. Lower it to split the circles.'
              : 'Merging needs iOS 26. Here the container lays out two separate views.'}
          </Text>
        </View>
      </Group>
    </Section>
  );
}

const styles = StyleSheet.create({
  stage: { height: 200, borderRadius: 24, overflow: 'hidden' },
  container: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: GAP,
  },
  circle: { width: 96, height: 96, borderRadius: 48 },
});
