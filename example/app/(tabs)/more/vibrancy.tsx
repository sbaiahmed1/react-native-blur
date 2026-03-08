import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  ScrollView,
} from 'react-native';
import { VibrancyView } from '@sbaiahmed1/react-native-blur';
import { DEMO_IMAGES } from '@/constants/blur';
import ScreenHeader from '@/components/screen-header';

const VIBRANCY_TYPES = [
  'xlight',
  'light',
  'dark',
  'regular',
  'prominent',
  'systemUltraThinMaterial',
  'systemThinMaterial',
  'systemMaterial',
  'systemThickMaterial',
  'systemChromeMaterial',
] as const;

export default function VibrancyScreen() {
  return (
    <ImageBackground
      source={{ uri: DEMO_IMAGES[0] }}
      style={styles.background}
      resizeMode="cover"
    >
      <ScreenHeader title="Vibrancy" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.header}>Vibrancy Examples</Text>
        <Text style={styles.description}>
          Vibrancy effect makes the content inside the view vibrant, matching
          the blur background. (iOS only - falls back to simple view on Android)
        </Text>

        {VIBRANCY_TYPES.map((type) => (
          <View key={type} style={styles.section}>
            <Text style={styles.label}>{type}</Text>
            <VibrancyView
              blurType={type}
              blurAmount={30}
              style={styles.vibrancyView}
            >
              <View style={styles.contentContainer}>
                <Text style={styles.vibrantText}>Vibrant Text</Text>
                <Text
                  style={[
                    styles.vibrantText,
                    { fontSize: 24, fontWeight: 'bold' },
                  ]}
                >
                  Bold Vibrant
                </Text>
              </View>
            </VibrancyView>
          </View>
        ))}

        <View style={{ height: 100 }} />
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  scrollContent: {
    padding: 20,
    paddingTop: 110,
  },
  header: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  description: {
    fontSize: 16,
    color: 'white',
    marginBottom: 30,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: 'white',
    marginBottom: 8,
    fontWeight: '600',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  vibrancyView: {
    height: 100,
    borderRadius: 15,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  vibrantText: {
    color: 'black',
    fontSize: 18,
  },
});
