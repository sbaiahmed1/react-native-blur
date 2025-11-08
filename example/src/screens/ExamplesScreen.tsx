import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  ScrollView,
} from 'react-native';
import { BlurView } from '@sbaiahmed1/react-native-blur';
import { DEMO_IMAGES } from '../constants';

const BLUR_TYPES = [
  { name: 'X Light', type: 'xlight' },
  { name: 'Light', type: 'light' },
  { name: 'Dark', type: 'dark' },
  { name: 'Extra Dark', type: 'extraDark' },
  { name: 'Regular', type: 'regular' },
  { name: 'Prominent', type: 'prominent' },
  { name: 'System Material', type: 'systemMaterial' },
  { name: 'System Thick Material', type: 'systemThickMaterial' },
  { name: 'System Chrome Material', type: 'systemChromeMaterial' },
  {
    name: 'System Ultra Thin Material Light',
    type: 'systemUltraThinMaterialLight',
  },
  { name: 'System Thin Material Light', type: 'systemThinMaterialLight' },
  { name: 'System Material Light', type: 'systemMaterialLight' },
  { name: 'System Thick Material Light', type: 'systemThickMaterialLight' },
  { name: 'System Chrome Material Light', type: 'systemChromeMaterialLight' },
  {
    name: 'System Ultra Thin Material Dark',
    type: 'systemUltraThinMaterialDark',
  },
  { name: 'System Thin Material Dark', type: 'systemThinMaterialDark' },
  { name: 'System Material Dark', type: 'systemMaterialDark' },
  { name: 'System Thick Material Dark', type: 'systemThickMaterialDark' },
  { name: 'System Chrome Material Dark', type: 'systemChromeMaterialDark' },
];

export default function ExamplesScreen() {
  return (
    <ImageBackground
      source={{ uri: DEMO_IMAGES[1] }}
      style={styles.background}
      resizeMode="cover"
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.header}>Blur Examples</Text>

        <View style={styles.grid}>
          {BLUR_TYPES.map(blur => (
            <BlurView
              key={blur.type}
              blurType={blur.type as any}
              blurAmount={50}
              style={styles.blurCard}
            >
              <Text style={styles.blurCardTitle}>{blur.name}</Text>
              <Text style={styles.blurCardSubtitle}>
                blurType="{blur.type}"
              </Text>
            </BlurView>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Blur Intensity</Text>

        {[20, 40, 60, 80, 100].map(amount => (
          <BlurView
            key={amount}
            blurType="light"
            blurAmount={amount}
            style={styles.intensityCard}
          >
            <Text style={styles.intensityText}>Blur Amount: {amount}</Text>
          </BlurView>
        ))}
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
    marginBottom: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 20,
    marginBottom: 16,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  blurCard: {
    width: '48%',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
    minHeight: 100,
    justifyContent: 'center',
  },
  blurCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  blurCardSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  intensityCard: {
    padding: 20,
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  intensityText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
});
