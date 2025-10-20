import {
  BlurView,
  TargetView,
  type BlurType,
} from '@sbaiahmed1/react-native-blur';
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

export function CardsScreen() {
  const [imageIndex] = React.useState(2);

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
        <Text style={styles.sectionTitle}>Blurred Card Styles</Text>

        {(['light', 'dark', 'extraDark', 'prominent'] as BlurType[]).map(
          (type) => {
            const isDark = type.includes('dark') || type === 'prominent';
            return (
              <View key={type} style={styles.card}>
                <BlurView
                  targetId="background"
                  blurType={type}
                  blurAmount={20}
                  style={StyleSheet.absoluteFill}
                />
                <View style={styles.cardContent}>
                  <Text style={[styles.cardTitle, isDark && styles.textLight]}>
                    {type.toUpperCase()} Card
                  </Text>
                  <Text style={[styles.cardText, isDark && styles.textLight]}>
                    This card uses the "{type}" blur type
                  </Text>
                  <TouchableOpacity style={styles.cardButton}>
                    <Text
                      style={[
                        styles.buttonText,
                        !isDark && styles.buttonTextDark,
                      ]}
                    >
                      Learn More
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          }
        )}

        <Text style={styles.sectionTitle}>Variable Intensity</Text>

        {[10, 25, 40, 60].map((amount) => (
          <View key={amount} style={styles.card}>
            <BlurView
              targetId="background"
              blurType="systemMaterial"
              blurAmount={amount}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Blur Amount: {amount}</Text>
              <Text style={styles.cardText}>
                Same blur type, different intensity
              </Text>
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
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#F1F1F1',
    marginTop: 8,
  },
  card: {
    minHeight: 120,
    borderRadius: 16,
    overflow: 'hidden',
  },
  cardContent: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    gap: 8,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#202020',
  },
  cardText: {
    fontSize: 14,
    color: '#202020',
    opacity: 0.8,
  },
  cardButton: {
    marginTop: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF40',
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F1F1F1',
  },
  buttonTextDark: {
    color: '#202020',
  },
  textLight: {
    color: '#F1F1F1',
  },
});
