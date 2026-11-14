import { useRouter } from 'expo-router';

import { Materials } from '@/screens/blur/materials';
import { ModalSection } from '@/screens/blur/modal-section';
import { NowPlaying } from '@/screens/blur/now-playing';
import { SwitchSection } from '@/screens/blur/switch-section';
import { VibrancySection } from '@/screens/blur/vibrancy-section';
import { PlaygroundLink, Screen } from '@/ui/screen';

export default function BlurShowcase() {
  const router = useRouter();
  return (
    <Screen title="Blur" subtitle="BlurView, VibrancyView and BlurSwitch">
      <NowPlaying />
      <Materials />
      <PlaygroundLink
        text="Every blur type, amount and overlay color"
        onPress={() => router.push('/blur/playground')}
      />
      <VibrancySection />
      <SwitchSection />
      <ModalSection />
    </Screen>
  );
}
