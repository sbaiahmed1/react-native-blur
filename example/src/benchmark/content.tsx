import type React from 'react';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import Animated, { useAnimatedRef } from 'react-native-reanimated';

import { useAutoScroll } from './use-auto-scroll';

const ROW_COUNT = 60;
const ROW_HEIGHT = 96;
const IMAGE_SIZE = 160;
const ROWS = Array.from({ length: ROW_COUNT }, (_, index) => index);
const LOGO = require('@/assets/images/logo-glow.png');

type FeedListProps = {
  scrolling: boolean;
  images: boolean;
  renderRowOverlay?: (index: number) => React.ReactNode;
  children?: React.ReactNode;
};

function rowColor(index: number): string {
  return `hsl(${(index * 37) % 360}, 70%, ${index % 2 === 0 ? 55 : 40}%)`;
}

function FeedRow({
  index,
  images,
  overlay,
}: {
  index: number;
  images: boolean;
  overlay: React.ReactNode;
}) {
  const withImage = images && index % 3 === 0;
  return (
    <View
      style={[
        styles.row,
        { backgroundColor: rowColor(index) },
        withImage && styles.rowWithImage,
      ]}
    >
      <View style={styles.rowText}>
        <Text style={styles.rowTitle}>Row {index + 1}</Text>
        <Text style={styles.rowBody}>
          {`Item ${(index * 7919) % 1000} of the benchmark feed`}
        </Text>
      </View>
      {withImage ? (
        <Image source={LOGO} style={styles.image} contentFit="contain" />
      ) : null}
      {overlay ? <View style={StyleSheet.absoluteFill}>{overlay}</View> : null}
    </View>
  );
}

export function FeedList({
  scrolling,
  images,
  renderRowOverlay,
  children,
}: FeedListProps): React.JSX.Element {
  const ref = useAnimatedRef<Animated.ScrollView>();
  const [viewportHeight, setViewportHeight] = useState(0);
  const [contentHeight, setContentHeight] = useState(0);
  useAutoScroll(ref, scrolling, Math.max(0, contentHeight - viewportHeight));

  return (
    <View style={styles.root}>
      <Animated.ScrollView
        ref={ref}
        testID="bench-feed"
        onLayout={(event) => setViewportHeight(event.nativeEvent.layout.height)}
        onContentSizeChange={(_, height) => setContentHeight(height)}
      >
        {ROWS.map((index) => (
          <FeedRow
            key={index}
            index={index}
            images={images}
            overlay={renderRowOverlay?.(index)}
          />
        ))}
      </Animated.ScrollView>
      {children ? (
        <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
          {children}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  row: {
    height: ROW_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  rowWithImage: {
    height: IMAGE_SIZE + 16,
  },
  rowText: {
    flex: 1,
  },
  rowTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  rowBody: {
    fontSize: 14,
    color: '#FFFFFF',
    marginTop: 4,
  },
  image: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
  },
});
