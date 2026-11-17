import type { SceneProps } from '../scenes';
import { StackedCards } from './stacked';

export default function StackedBadges({ params, running }: SceneProps) {
  return <StackedCards params={params} running={running} layout="badges" />;
}
