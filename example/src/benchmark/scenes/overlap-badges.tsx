import type { SceneProps } from '../scenes';
import { OverlapList } from './overlap';

export default function OverlapBadges({ params, running }: SceneProps) {
  return <OverlapList params={params} running={running} badges />;
}
