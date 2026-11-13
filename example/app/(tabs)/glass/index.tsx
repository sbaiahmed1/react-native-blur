import { useRouter } from 'expo-router';

import { ContainerDemo } from '@/screens/glass/container-demo';
import { ControlCenter } from '@/screens/glass/control-center';
import { GlassUseCases } from '@/screens/glass/use-cases';
import { PlaygroundLink, Screen } from '@/ui/screen';

export default function GlassShowcase() {
  const router = useRouter();
  return (
    <Screen title="Glass" subtitle="LiquidGlassView and LiquidGlassContainer">
      <ControlCenter />
      <PlaygroundLink
        text="Glass type, tint, opacity and interaction"
        onPress={() => router.push('/glass/playground')}
      />
      <ContainerDemo />
      <GlassUseCases />
    </Screen>
  );
}
