import type { SceneProps } from '../scenes';
import { StackedCards } from './stacked';

export default function StackedZigzag({ params, running }: SceneProps) {
  return <StackedCards params={params} running={running} layout="zigzag" />;
}
