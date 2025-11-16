import { Text, StyleSheet, ImageBackground, ScrollView } from 'react-native';
import { BlurView } from '@sbaiahmed1/react-native-blur';
import { DEMO_IMAGES } from '../constants';

export default function SettingsScreen() {
  return (
    <ImageBackground
      source={{ uri: DEMO_IMAGES[2] }}
      style={styles.background}
      resizeMode="cover"
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.header}>Settings</Text>

        <BlurView blurType="dark" blurAmount={70} style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.sectionText}>
            React Native Blur with QmBlurView integration
          </Text>
          <Text style={styles.sectionText}>Version: 1.0.0</Text>
        </BlurView>

        <BlurView blurType="regular" blurAmount={60} style={styles.section}>
          <Text style={styles.sectionTitle}>Features</Text>
          <Text style={styles.sectionText}>✅ Native blur performance</Text>
          <Text style={styles.sectionText}>✅ Cross-platform support</Text>
          <Text style={styles.sectionText}>✅ Automatic memory management</Text>
          <Text style={styles.sectionText}>✅ Multiple blur types</Text>
          <Text style={styles.sectionText}>✅ Customizable blur intensity</Text>
        </BlurView>

        <BlurView blurType="prominent" blurAmount={80} style={styles.section}>
          <Text style={styles.sectionTitle}>Library</Text>
          <Text style={styles.sectionText}>
            Powered by QmBlurView - A high-performance Android blur library
          </Text>
          <Text style={styles.sectionText}>
            Minimum SDK: Android 5.0 (API 21)
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
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 40,
    marginBottom: 30,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
  section: {
    padding: 20,
    marginBottom: 20,
    borderRadius: 16,
    width: '100%',
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  sectionText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 24,
    marginBottom: 8,
  },
});
