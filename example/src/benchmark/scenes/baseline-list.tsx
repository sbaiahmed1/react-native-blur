import { FeedList } from '../content';
import type { SceneProps } from '../scenes';

export default function BaselineList({ params, running }: SceneProps) {
  return <FeedList scrolling={running} images={params.images} />;
}
