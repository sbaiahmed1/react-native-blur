import { Text, StyleSheet, ImageBackground, ScrollView } from 'react-native';
import { BlurView } from '@sbaiahmed1/react-native-blur';
import { DEMO_IMAGES } from '../constants';

export default function HomeScreen() {
  return (
    <ImageBackground
      source={{ uri: DEMO_IMAGES[0] }}
      style={styles.background}
      resizeMode="cover"
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.header}>Welcome to React Native Blur</Text>

        <BlurView blurType="regular" blurAmount={50} style={styles.card}>
          <Text style={styles.cardTitle}>🎨 Beautiful Blur Effects</Text>
          <Text style={styles.cardText}>
            Experience stunning blur effects powered by QmBlurView library.
            High-performance native blur with automatic memory management.
          </Text>
        </BlurView>

        <BlurView blurType="dark" blurAmount={60} style={styles.card}>
          <Text style={styles.cardTitle}>⚡ Native Performance</Text>
          <Text style={styles.cardText}>
            Uses native blur algorithms with underlying JNI calls for optimal
            performance. Works seamlessly on both iOS and Android.
          </Text>
        </BlurView>

        <BlurView blurType="prominent" blurAmount={70} style={styles.card}>
          <Text style={styles.cardTitle}>🚀 Easy to Use</Text>
          <Text style={styles.cardText}>
            Simple API with no complex setup required. Just import and use!
          </Text>
        </BlurView>
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
  },
  header: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 40,
    marginBottom: 30,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
  card: {
    padding: 20,
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  cardText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 24,
  },
});
