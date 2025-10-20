import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BlurView, TargetView } from '@sbaiahmed1/react-native-blur';
import React from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { DEMO_IMAGES } from '../constants';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export function HomeScreen({ navigation }: Props) {
  const [imageIndex, setImageIndex] = React.useState(0);

  const cycleImage = () => {
    setImageIndex((prev) => (prev + 1) % DEMO_IMAGES.length);
  };

  return (
    <View style={styles.container}>
      <TargetView id="background" style={styles.blurTarget}>
        <View style={styles.backgroundContainer}>
          <Image
            source={{ uri: DEMO_IMAGES[imageIndex] }}
            style={styles.backgroundImage}
            resizeMode="cover"
          />
        </View>
      </TargetView>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroCard}>
          <BlurView
            targetId="background"
            blurType="light"
            blurAmount={30}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>React Native Blur</Text>
            <Text style={styles.heroSubtitle}>
              Modern blur effects for React Native
            </Text>
          </View>
        </View>

        <TouchableOpacity style={styles.imageButton} onPress={cycleImage}>
          <BlurView
            targetId="background"
            blurType="systemMaterial"
            blurAmount={20}
            style={StyleSheet.absoluteFill}
          />
          <Text style={styles.buttonText}>Change Background</Text>
        </TouchableOpacity>

        <View style={styles.menuGrid}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('BlurDemo')}
          >
            <BlurView
              targetId="background"
              blurType="light"
              blurAmount={25}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.menuContent}>
              <Text style={styles.menuIcon}>🌫️</Text>
              <Text style={styles.menuTitle}>Blur Effects</Text>
              <Text style={styles.menuDescription}>
                Explore different blur types
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('LiquidGlass')}
          >
            <BlurView
              targetId="background"
              type="liquidGlass"
              glassTintColor="#4A90E2"
              glassOpacity={0.4}
              blurAmount={25}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.menuContent}>
              <Text style={styles.menuIcon}>✨</Text>
              <Text style={[styles.menuTitle, styles.textLight]}>
                Liquid Glass
              </Text>
              <Text style={[styles.menuDescription, styles.textLight]}>
                iOS glass morphism
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('Cards')}
          >
            <BlurView
              targetId="background"
              blurType="dark"
              blurAmount={30}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.menuContent}>
              <Text style={styles.menuIcon}>🃏</Text>
              <Text style={[styles.menuTitle, styles.textLight]}>
                Blurred Cards
              </Text>
              <Text style={[styles.menuDescription, styles.textLight]}>
                UI components with blur
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('Gallery')}
          >
            <BlurView
              targetId="background"
              blurType="prominent"
              blurAmount={20}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.menuContent}>
              <Text style={styles.menuIcon}>🖼️</Text>
              <Text style={[styles.menuTitle, styles.textLight]}>Gallery</Text>
              <Text style={[styles.menuDescription, styles.textLight]}>
                Image gallery examples
              </Text>
            </View>
          </TouchableOpacity>
        </View>
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
  backgroundContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#6366f1',
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
  heroCard: {
    height: 200,
    borderRadius: 20,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroContent: {
    padding: 20,
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#202020',
    marginBottom: 8,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#202020',
    opacity: 0.8,
    textAlign: 'center',
  },
  imageButton: {
    height: 60,
    borderRadius: 12,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#202020',
    fontSize: 18,
    fontWeight: '600',
  },
  menuGrid: {
    gap: 16,
  },
  menuItem: {
    height: 140,
    borderRadius: 16,
    overflow: 'hidden',
  },
  menuContent: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  menuIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  menuTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#202020',
    marginBottom: 4,
  },
  menuDescription: {
    fontSize: 14,
    color: '#202020',
    opacity: 0.7,
  },
  textLight: {
    color: '#F1F1F1',
  },
});
