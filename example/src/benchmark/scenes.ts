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
import Materials from './scenes/materials';
import ModalIdle from './scenes/modal-idle';
import ModalLive from './scenes/modal-live';
import Nested from './scenes/nested';
import Overlap from './scenes/overlap';
import OverlapBadges from './scenes/overlap-badges';
import ProgressiveBars from './scenes/progressive-bars';
import ProgressiveRamp from './scenes/progressive-ramp';
import Recycle from './scenes/recycle';
import RootOverlay from './scenes/root-overlay';
import SideBySide from './scenes/side-by-side';
import StackPush from './scenes/stack-push';
import Stacked from './scenes/stacked';
import StackedBadges from './scenes/stacked-badges';
import StackedModal from './scenes/stacked-modal';
import StackedWrapped from './scenes/stacked-wrapped';
import StackedZigzag from './scenes/stacked-zigzag';

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
  direction: 'blurredTopClearBottom',
  offset: 0,
  blurType: 'systemMaterial',
  bg: 'bw',
  overlay: 'none',
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
    id: 'progressive-ramp',
    title: 'Progressive ramp',
    note: 'One ProgressiveBlurView over the whole feed, so the fade runs from edge to edge. The rows in the clear half should read as sharp text. count=2 adds a BlurView card over it.',
    defaults: { amount: 20, count: 1 },
    Component: ProgressiveRamp,
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
    defaults: { blurType: 'light' },
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
    note: 'A full-screen BlurView in a Modal with nothing moving, which should draw no frames.',
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
    note: 'Glass and blur rendered outside every Screen, which should still blur the feed.',
    defaults: {},
    Component: RootOverlay,
  },
  {
    id: 'recycle',
    title: 'Recycle',
    note: 'Swaps a red-tinted blur and glass pair with a plain pair every second. The plain pair must not keep the red tint.',
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
    id: 'overlap-badges',
    title: 'Overlap badges',
    note: 'The overlap feed with a BlurView badge in every card and in the header. The cards under the header stay blurred in its backdrop, and the header badge blurs the header.',
    defaults: {},
    Component: OverlapBadges,
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
    note: 'Ten BlurView cards (count) stacked over each other over a scrolling feed, each one blurring the cards behind it.',
    defaults: { count: 10 },
    Component: Stacked,
  },
  {
    id: 'stacked-zigzag',
    title: 'Stacked zigzag',
    note: 'Ten BlurView cards (count) in a zigzag, so each card shows a strip of the card two behind it. Past the budget, farther cards draw flat in those strips.',
    defaults: { count: 10 },
    Component: StackedZigzag,
  },
  {
    id: 'stacked-wrapped',
    title: 'Stacked wrapped',
    note: 'The zigzag cards, each inside a rotated View with a border, so a backdrop has to replay the View to reach the card.',
    defaults: { count: 10 },
    Component: StackedWrapped,
  },
  {
    id: 'stacked-badges',
    title: 'Stacked badges',
    note: 'Six stacked BlurView cards (count), each holding a BlurView badge. A badge must not walk the cards behind its own card.',
    defaults: { count: 6 },
    Component: StackedBadges,
  },
  {
    id: 'side-by-side',
    title: 'Side by side',
    note: 'A BlurView card over two cards that sit side by side. Both stay blurred in its backdrop.',
    defaults: {},
    Component: SideBySide,
  },
  {
    id: 'stacked-modal',
    title: 'Stacked modal',
    note: 'Ten stacked BlurView cards (count) in a transparent Modal over the scrolling feed, open from mount. Android back closes it.',
    defaults: { count: 10 },
    Component: StackedModal,
  },
  {
    id: 'materials',
    title: 'Materials',
    note: 'Flat color bands under one BlurView, for material calibration shots.',
    defaults: {},
    Component: Materials,
  },
];

export function getScene(id: string): SceneDef | undefined {
  return SCENES.find((scene) => scene.id === id);
}
