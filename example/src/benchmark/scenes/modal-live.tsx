import type { SceneProps } from '../scenes';
import { ModalScene } from './modal-idle';

export default function ModalLive(props: SceneProps) {
  return <ModalScene {...props} scrolling={props.running} />;
}
