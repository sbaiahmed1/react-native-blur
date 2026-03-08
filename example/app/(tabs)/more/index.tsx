import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
} from 'react-native';
import { useRouter } from 'expo-router';
import { BlurView } from '@sbaiahmed1/react-native-blur';
import { DEMO_IMAGES } from '@/constants/blur';

const MORE_SCREENS = [
  {
    name: '/more/vibrancy',
    label: '✨ Vibrancy',
    description: 'iOS vibrancy effects',
  },
  {
    name: '/more/liquid-glass',
    label: '🌊 Liquid Glass',
    description: 'Liquid glass effect',
  },
  {
    name: '/more/progressive-blur',
    label: '🎨 Progressive Blur',
    description: 'Gradient blur effects',
  },
] as const;

export default function MoreScreen() {
  const router = useRouter();

  return (
    <ImageBackground
      source={{ uri: DEMO_IMAGES[1] }}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.container}>
        <Text style={styles.header}>More</Text>

        {MORE_SCREENS.map((screen) => (
          <TouchableOpacity
            key={screen.name}
            onPress={() => router.navigate(screen.name)}
            accessibilityRole="button"
            accessibilityLabel={`Navigate to ${screen.label}`}
          >
            <BlurView blurType="dark" blurAmount={60} style={styles.card}>
              <Text style={styles.cardTitle}>{screen.label}</Text>
              <Text style={styles.cardDescription}>{screen.description}</Text>
            </BlurView>
          </TouchableOpacity>
        ))}
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
    paddingBottom: 100,
  },
  header: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 30,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  card: {
    padding: 20,
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  cardDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
});
