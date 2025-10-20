import { BlurView, TargetView } from '@sbaiahmed1/react-native-blur';
import React from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { DEMO_IMAGES } from '../constants';

const GLASS_EXAMPLES = [
  { color: '#FF6B6B', opacity: 0.3, label: 'Red Glass' },
  { color: '#4ECDC4', opacity: 0.4, label: 'Cyan Glass' },
  { color: '#FFE66D', opacity: 0.35, label: 'Yellow Glass' },
  { color: '#A8E6CF', opacity: 0.45, label: 'Green Glass' },
  { color: '#B8A4E8', opacity: 0.4, label: 'Purple Glass' },
  { color: 'transparent', opacity: 0.0, label: 'Clear Glass' },
];

export function LiquidGlassScreen() {
  const [imageIndex] = React.useState(1);

  return (
    <View style={styles.container}>
      <TargetView id="background" style={styles.blurTarget}>
        <Image
          source={{ uri: DEMO_IMAGES[imageIndex] }}
          style={styles.backgroundImage}
          resizeMode="cover"
        />
      </TargetView>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.infoCard}>
          <BlurView
            targetId="background"
            blurType="systemMaterial"
            blurAmount={20}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Liquid Glass (iOS Only)</Text>
            <Text style={styles.infoText}>
              Available on iOS 26.0+. Falls back to blur on older versions.
            </Text>
          </View>
        </View>

        {GLASS_EXAMPLES.map((glass) => (
          <View key={glass.label} style={styles.glassCard}>
            <BlurView
              targetId="background"
              type="liquidGlass"
              glassTintColor={glass.color}
              glassOpacity={glass.opacity}
              blurAmount={25}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.glassContent}>
              <Text style={styles.glassTitle}>{glass.label}</Text>
              <Text style={styles.glassSubtitle}>Color: {glass.color}</Text>
              <Text style={styles.glassSubtitle}>Opacity: {glass.opacity}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  blurTarget: {
    ...StyleSheet.absoluteFillObject,
  },
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    gap: 16,
  },
  infoCard: {
    padding: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  infoContent: {
    gap: 8,
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#202020',
  },
  infoText: {
    fontSize: 14,
    color: '#202020',
    opacity: 0.8,
  },
  glassCard: {
    height: 140,
    borderRadius: 16,
    overflow: 'hidden',
  },
  glassContent: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  glassTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#F1F1F1',
    marginBottom: 8,
  },
  glassSubtitle: {
    fontSize: 14,
    color: '#F1F1F1',
    opacity: 0.9,
  },
});
