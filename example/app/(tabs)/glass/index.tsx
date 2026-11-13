import { Text } from 'react-native';
import { useRouter } from 'expo-router';

import { ContainerDemo } from '@/screens/glass/container-demo';
import { MapHero } from '@/screens/glass/map-hero';
import { GlassUseCases } from '@/screens/glass/use-cases';
import { glassNotice, NATIVE_GLASS } from '@/ui/glass-support';
import { MaterialCard, PlaygroundLink, Screen } from '@/ui/screen';
import { useTheme } from '@/ui/theme';
import { useReduceTransparency } from '@/ui/use-reduce-transparency';

export default function GlassShowcase() {
  const router = useRouter();
  const t = useTheme();
  const notice = glassNotice(NATIVE_GLASS, useReduceTransparency());
  return (
    <Screen title="Glass" subtitle="LiquidGlassView and LiquidGlassContainer">
      {notice ? (
        <MaterialCard>
          <Text style={[t.font.footnote, { color: t.colors.text }]}>
            {notice}
          </Text>
        </MaterialCard>
      ) : null}
      <MapHero />
      <PlaygroundLink
        text="Glass type, tint, opacity and interaction"
        onPress={() => router.push('/glass/playground')}
      />
      <ContainerDemo />
      <GlassUseCases />
    </Screen>
  );
}
