import {
  BlurView,
  TargetView,
  type BlurType,
} from '@sbaiahmed1/react-native-blur';
import React from 'react';
import {
  Button,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { DEMO_IMAGES } from '../constants';

const BLUR_TYPES: BlurType[] = [
  'xlight',
  'light',
  'dark',
  'extraDark',
  'prominent',
  'systemChromeMaterial',
  'systemMaterial',
  'systemThinMaterial',
  'systemThickMaterial',
];

export function BlurDemoScreen() {
  const [blurType, setBlurType] = React.useState<BlurType>('light');
  const [blurAmount, setBlurAmount] = React.useState(10);
  const [imageIndex] = React.useState(0);

  const isDark = blurType.includes('dark');

  const incrementAmount = () => {
    if (blurAmount < 100) setBlurAmount(blurAmount + 5);
  };

  const decrementAmount = () => {
    if (blurAmount > 0) setBlurAmount(blurAmount - 5);
  };

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
        <View style={styles.previewCard}>
          <BlurView
            targetId="background"
            blurType={blurType}
            blurAmount={blurAmount}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.previewContent}>
            <Text style={[styles.previewTitle, isDark && styles.textLight]}>
              Preview
            </Text>
            <Text style={[styles.previewText, isDark && styles.textLight]}>
              Type: {blurType}
            </Text>
            <Text style={[styles.previewText, isDark && styles.textLight]}>
              Amount: {blurAmount}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Blur Amount</Text>
          <View style={styles.control}>
            <Button
              title="-"
              onPress={decrementAmount}
              disabled={blurAmount <= 0}
            />
            <Text style={styles.controlText}>{blurAmount}</Text>
            <Button
              title="+"
              onPress={incrementAmount}
              disabled={blurAmount >= 100}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Blur Type</Text>
          {BLUR_TYPES.map((type) => (
            <TouchableOpacity
              key={type}
              style={styles.typeItem}
              onPress={() => setBlurType(type)}
            >
              <Text style={styles.typeText}>{type}</Text>
              <View
                style={[
                  styles.radio,
                  blurType === type && styles.radioSelected,
                ]}
              />
            </TouchableOpacity>
          ))}
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
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    gap: 20,
  },
  previewCard: {
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
  },
  previewContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  previewTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#202020',
  },
  previewText: {
    fontSize: 16,
    color: '#202020',
  },
  textLight: {
    color: '#F1F1F1',
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#F1F1F1',
  },
  control: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  controlText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#F1F1F1',
    minWidth: 50,
    textAlign: 'center',
  },
  typeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF20',
    borderRadius: 8,
  },
  typeText: {
    fontSize: 16,
    color: '#F1F1F1',
  },
  radio: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    borderRadius: 10,
  },
  radioSelected: {
    borderWidth: 6,
  },
});
