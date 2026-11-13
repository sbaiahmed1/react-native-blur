import type React from 'react';

import type { BenchParams } from './params';
import AnimatedAmount from './scenes/animated-amount';
import BaselineList from './scenes/baseline-list';
import BlurInScroll from './scenes/blur-in-scroll';
import BlurList from './scenes/blur-list';
import GlassList from './scenes/glass-list';
import IdleCursor from './scenes/idle-cursor';
import ProgressiveBars from './scenes/progressive-bars';

export type SceneProps = { params: BenchParams; running: boolean };

export type SceneDef = {
  id: string;
  title: string;
  note: string;
  defaults: Partial<BenchParams>;
  Component: React.ComponentType<SceneProps>;
};

export const DEFAULT_PARAMS: BenchParams = {
  count: 3,
  duration: 10,
  amount: 20,
  rounds: 5,
  images: false,
  autoplay: false,
  animation: 'default',
};

export const SCENES: readonly SceneDef[] = [
  {
    id: 'baseline-list',
    title: 'Baseline list',
    note: 'Scrolling feed with no effect. The control.',
    defaults: {},
    Component: BaselineList,
  },
  {
    id: 'blur-list',
    title: 'Blur list',
    note: 'count BlurView bars pinned over a scrolling feed.',
    defaults: { count: 3 },
    Component: BlurList,
  },
  {
    id: 'progressive-bars',
    title: 'Progressive bars',
    note: 'Top and bottom ProgressiveBlurView over a scrolling feed (#119).',
    defaults: { amount: 16, rounds: 8 },
    Component: ProgressiveBars,
  },
  {
    id: 'glass-list',
    title: 'Glass list',
    note: 'count LiquidGlassView bars pinned over a scrolling feed.',
    defaults: { count: 3 },
    Component: GlassList,
  },
  {
    id: 'blur-in-scroll',
    title: 'Blur in scroll',
    note: 'A BlurView inside every fifth row, scrolling with it.',
    defaults: { count: 6 },
    Component: BlurInScroll,
  },
  {
    id: 'animated-amount',
    title: 'Animated amount',
    note: 'blurAmount runs 0 to 100 and back through animated props.',
    defaults: {},
    Component: AnimatedAmount,
  },
  {
    id: 'idle-cursor',
    title: 'Idle cursor',
    note: 'A static blur bar while only a text caret blinks.',
    defaults: {},
    Component: IdleCursor,
  },
];

export function getScene(id: string): SceneDef | undefined {
  return SCENES.find((scene) => scene.id === id);
}
