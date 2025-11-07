import { useState } from 'react';
import { ImageBackground, StyleSheet, ScrollView } from 'react-native';
import { DEMO_IMAGES } from '../constants';
import LiquidGlassExample from '../components/LiquidGlassExample';

export default function LiquidGlassScreen() {
  const [currentImageIndex, setCurrentImageIndex] = useState(2);

  const cycleBackground = () => {
    setCurrentImageIndex(prev => (prev + 1) % DEMO_IMAGES.length);
  };

  return (
    <ImageBackground
      source={{ uri: DEMO_IMAGES[currentImageIndex] }}
      style={styles.background}
      resizeMode="cover"
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <LiquidGlassExample cycleBackground={cycleBackground} />
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
    paddingTop: 40,
  },
});
