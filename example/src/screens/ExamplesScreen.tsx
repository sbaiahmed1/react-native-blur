import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  ScrollView,
} from 'react-native';
import { BlurView, BlurSwitchButtonView } from '@sbaiahmed1/react-native-blur';
import { DEMO_IMAGES } from '../constants';

const BLUR_TYPES = [
  { name: 'X Light', type: 'xlight' },
  { name: 'Light', type: 'light' },
  { name: 'Dark', type: 'dark' },
  { name: 'Regular', type: 'regular' },
  { name: 'Prominent', type: 'prominent' },
  { name: 'Extra Dark', type: 'extraDark' },
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

const BLUR_VIEW_SWITCHES = [
  { label: 'Coral Pink', color: '#F43F5E', blurAmount: 18, disabled: true },
  { label: 'Amber Gold', color: '#F59E0B', blurAmount: 22, disabled: false },
  { label: 'Teal', color: '#14B8A6', blurAmount: 16, disabled: false },
  { label: 'Ocean Blue', color: '#0EA5E9', blurAmount: 15 },
];

export default function ExamplesScreen() {
  const [switchStates, setSwitchStates] = useState<Record<string, boolean>>({
    'Coral Pink': false,
    'Ocean Blue': false,
    'Royal Purple': true,
    'Amber Gold': true,
  });

  const toggleSwitch = (label: string) => {
    setSwitchStates(prev => ({ ...prev, [label]: !prev[label] }));
  };

  return (
    <ImageBackground
      source={{ uri: DEMO_IMAGES[1] }}
      style={styles.background}
      resizeMode="cover"
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.header}>Blur Examples</Text>

        <Text style={styles.sectionTitle}>Blur Switch</Text>
        <BlurView blurType="dark" blurAmount={60} style={styles.switchSection}>
          {BLUR_VIEW_SWITCHES.map(item => (
            <View key={item.label} style={styles.switchRow}>
              <Text style={styles.switchLabel}>{item.label}</Text>
              <BlurSwitchButtonView
                value={switchStates[item.label]}
                onValueChange={() => toggleSwitch(item.label)}
                blurAmount={item.blurAmount}
                trackColor={{ true: item.color }}
                disabled={item.disabled}
              />
            </View>
          ))}
        </BlurView>

        <Text style={styles.sectionTitle}>Blur Types</Text>

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
  switchSection: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    overflow: 'hidden',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  switchLabel: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  blurCard: {
    width: '100%',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    minHeight: 100,
    justifyContent: 'center',
    alignItems: 'center',
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
    width: '100%',
    alignItems: 'center',
  },
  intensityText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
});
