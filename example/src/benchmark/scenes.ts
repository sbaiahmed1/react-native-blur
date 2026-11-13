import type React from 'react';

import type { BenchParams } from './params';
import AnimatedAmount from './scenes/animated-amount';
import BaselineList from './scenes/baseline-list';
import BlurInScroll from './scenes/blur-in-scroll';
import BlurList from './scenes/blur-list';
import GlassList from './scenes/glass-list';
import IdleCursor from './scenes/idle-cursor';
import ModalIdle from './scenes/modal-idle';
import ModalLive from './scenes/modal-live';
import ProgressiveBars from './scenes/progressive-bars';
import Recycle from './scenes/recycle';
import RootOverlay from './scenes/root-overlay';
import StackPush from './scenes/stack-push';

/** `onStop` ends the run early, with no result, for example on Android back. */
export type SceneProps = {
  params: BenchParams;
  running: boolean;
  onStop: () => void;
};

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
  {
    id: 'modal-idle',
    title: 'Modal idle',
    note: 'A full-screen BlurView in a Modal, nothing moving (B2).',
    defaults: {},
    Component: ModalIdle,
  },
  {
    id: 'modal-live',
    title: 'Modal live',
    note: 'The same Modal blur with the feed scrolling behind it.',
    defaults: {},
    Component: ModalLive,
  },
  {
    id: 'stack-push',
    title: 'Stack push',
    note: 'Push and pop a screen under a blur header every second (#167, #109).',
    defaults: {},
    Component: StackPush,
  },
  {
    id: 'root-overlay',
    title: 'Root overlay',
    note: 'Glass and blur rendered outside every Screen (B3a).',
    defaults: {},
    Component: RootOverlay,
  },
  {
    id: 'recycle',
    title: 'Recycle',
    note: 'Swaps two blur and glass pairs every second (B7).',
    defaults: {},
    Component: Recycle,
  },
];

export function getScene(id: string): SceneDef | undefined {
  return SCENES.find((scene) => scene.id === id);
}
