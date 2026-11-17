import type { SceneProps } from '../scenes';
import { StackedCards } from './stacked';

export default function StackedWrapped({ params, running }: SceneProps) {
  return <StackedCards params={params} running={running} layout="wrapped" />;
}
