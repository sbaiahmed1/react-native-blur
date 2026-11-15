import type React from 'react';

import type { BenchParams } from './params';
import AnimatedAmount from './scenes/animated-amount';
import BaselineList from './scenes/baseline-list';
import BlurInScroll from './scenes/blur-in-scroll';
import BlurList from './scenes/blur-list';
import Geometry from './scenes/geometry';
import GlassList from './scenes/glass-list';
import Halo from './scenes/halo';
import IdleCursor from './scenes/idle-cursor';
import ModalIdle from './scenes/modal-idle';
import ModalLive from './scenes/modal-live';
import Nested from './scenes/nested';
import Overlap from './scenes/overlap';
import ProgressiveBars from './scenes/progressive-bars';
import Recycle from './scenes/recycle';
import RootOverlay from './scenes/root-overlay';
import StackPush from './scenes/stack-push';
import Stacked from './scenes/stacked';

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
  warmup: 0,
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
    note: 'Three BlurView bars (count) pinned over a scrolling feed.',
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
    note: 'Three LiquidGlassView bars (count) pinned over a scrolling feed.',
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
    note: 'Animates blurAmount from 0 to 100 and back through animated props.',
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
  {
    id: 'overlap',
    title: 'Overlap',
    note: 'A BlurView header over a feed of BlurView cards with text.',
    defaults: {},
    Component: Overlap,
  },
  {
    id: 'nested',
    title: 'Nested',
    note: 'A BlurView card holding a red block, a BlurView badge and a glass button over it.',
    defaults: {},
    Component: Nested,
  },
  {
    id: 'halo',
    title: 'Halo',
    note: 'A raised button over a blur tab bar (#132).',
    defaults: {},
    Component: Halo,
  },
  {
    id: 'geometry',
    title: 'Geometry',
    note: 'Blur, progressive and glass over stripes: cut by the window edge, scaled to 0.5, in a hardware layer, resizing.',
    defaults: {},
    Component: Geometry,
  },
  {
    id: 'stacked',
    title: 'Stacked',
    note: 'Ten BlurView cards (count) stacked over each other over a scrolling feed (B14).',
    defaults: { count: 10 },
    Component: Stacked,
  },
];

export function getScene(id: string): SceneDef | undefined {
  return SCENES.find((scene) => scene.id === id);
}
