import { StyleSheet, View } from 'react-native';
import { BlurView } from '@sbaiahmed1/react-native-blur';

import { Backdrop } from '../../ui/backdrop';
import type { SceneProps } from '../scenes';

/** Top and bottom band colors per backdrop, muted so a saturation up to 2.5 does not clip. */
export const MATERIAL_BANDS: Record<
  'bw' | 'grays' | 'mid' | 'gb',
  readonly [top: string, bottom: string]
> = {
  bw: ['#000000', '#FFFFFF'],
  grays: ['#404040', '#BFBFBF'],
  mid: ['#808080', '#A86060'],
  gb: ['#609860', '#6868A0'],
};

export const MATERIAL_OVERLAY = '#FF3D9A66';

function CalibrationBackdrop({ bg }: { bg: SceneProps['params']['bg'] }) {
  if (bg === 'photo') return <Backdrop variant="bands" />;
  if (bg === 'edge') {
    return (
      <View style={[styles.fill, styles.row]}>
        <View style={[styles.half, styles.black]} />
        <View style={[styles.half, styles.white]} />
      </View>
    );
  }
  const [top, bottom] = MATERIAL_BANDS[bg];
  return (
    <View style={styles.fill}>
      <View style={[styles.half, { backgroundColor: top }]} />
      <View style={[styles.half, { backgroundColor: bottom }]} />
    </View>
  );
}

export default function Materials({ params }: SceneProps) {
  const frame = params.bg === 'edge' ? styles.lower : styles.right;
  return (
    <View style={styles.root}>
      <CalibrationBackdrop bg={params.bg} />
      <BlurView
        blurType={params.blurType}
        blurAmount={params.amount}
        overlayColor={params.overlay === 'prop' ? MATERIAL_OVERLAY : undefined}
        style={frame}
      />
      {params.overlay === 'above' ? (
        <View style={[frame, styles.overlay]} pointerEvents="none" />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  fill: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  row: {
    flexDirection: 'row',
  },
  half: {
    flex: 1,
  },
  black: {
    backgroundColor: '#000000',
  },
  white: {
    backgroundColor: '#FFFFFF',
  },
  right: {
    position: 'absolute',
    left: '30%',
    right: 0,
    top: 0,
    bottom: 0,
  },
  lower: {
    position: 'absolute',
    top: '30%',
    left: 0,
    right: 0,
    bottom: 0,
  },
  overlay: {
    backgroundColor: MATERIAL_OVERLAY,
  },
});
