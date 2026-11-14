import { useRouter } from 'expo-router';

import { ArtworkCard } from '@/screens/progressive/artwork-card';
import { HeaderOverlay } from '@/screens/progressive/header-overlay';
import { LockedContent } from '@/screens/progressive/locked-content';
import { PlaygroundLink, Screen } from '@/ui/screen';

export default function ProgressiveShowcase() {
  const router = useRouter();
  return (
    <Screen title="Progressive" subtitle="ProgressiveBlurView">
      <ArtworkCard />
      <PlaygroundLink
        text="Direction, start offset, amount and blur type"
        onPress={() => router.push('/progressive/playground')}
      />
      <HeaderOverlay />
      <LockedContent />
    </Screen>
  );
}
