import type React from 'react';

import type { BenchParams } from './params';
import BaselineList from './scenes/baseline-list';

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
];

export function getScene(id: string): SceneDef | undefined {
  return SCENES.find((scene) => scene.id === id);
}
