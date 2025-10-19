import BlurView, { type BlurType } from '@sbaiahmed1/react-native-blur';
import { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { BLUR_TYPES, width } from '../constants';

const MainExample = ({ cycleBackground }: { cycleBackground: () => void }) => {
  const [selectedBlurType, setSelectedBlurType] = useState<BlurType>('light');
  const [blurAmount, setBlurAmount] = useState(20);

  return (
    <>
      <View style={styles.targetBlurContainer}>
        <BlurView
          // targetId="app-background"
          blurType={selectedBlurType}
          blurAmount={blurAmount}
          style={styles.blurOverlay}
        >
          <View style={styles.blurContent}>
            <Text style={styles.cardTitle}>Real Blur with Target</Text>
            <Text style={styles.cardSubtitle}>Type: {selectedBlurType}</Text>
            <Text style={styles.cardSubtitle}>Amount: {blurAmount}%</Text>
            <TouchableOpacity
              style={styles.changeBackgroundButton}
              onPress={cycleBackground}
            >
              <Text style={styles.buttonText}>Change Background</Text>
            </TouchableOpacity>
            <ScrollView contentContainerStyle={styles.targetScrollContent}>
              <Text style={styles.targetText}>This is the blur target 🎯</Text>
              {Array.from({ length: 5 }, (_, i) => (
                <View key={i} style={styles.targetCard}>
                  <Text style={styles.targetCardText}>Content {i + 1}</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        </BlurView>
      </View>

      {/* Blur Type Selector */}
      <View style={styles.selectorContainer}>
        <BlurView blurType="dark" blurAmount={30} style={styles.selectorHeader}>
          <Text style={styles.selectorTitle}>Blur Types</Text>
        </BlurView>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {BLUR_TYPES.map((type) => (
            <TouchableOpacity
              key={type}
              onPress={() => setSelectedBlurType(type)}
              style={styles.typeButton}
            >
              <BlurView
                blurType={type}
                blurAmount={25}
                style={[
                  styles.typeButtonBlur,
                  selectedBlurType === type && styles.selectedType,
                ]}
              >
                <Text style={styles.typeButtonText}>{type}</Text>
              </BlurView>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Blur Amount Selector */}
      <View style={styles.selectorContainer}>
        <BlurView
          targetId="app-background"
          blurType="dark"
          blurAmount={30}
          style={styles.selectorHeader}
        >
          <Text style={styles.selectorTitle}>Blur Amount</Text>
        </BlurView>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {[5, 10, 20, 30, 50, 75, 100].map((amount) => (
            <TouchableOpacity
              key={amount}
              onPress={() => setBlurAmount(amount)}
              style={styles.amountButton}
            >
              <BlurView
                blurType="light"
                blurAmount={amount}
                style={[
                  styles.amountButtonBlur,
                  blurAmount === amount && styles.selectedAmount,
                ]}
              >
                <Text style={styles.amountButtonText}>{amount}%</Text>
              </BlurView>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  blurCard: {
    borderRadius: 20,
    alignItems: 'center',
    width: width * 0.85,
    overflow: 'hidden',
    padding: 20,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  cardSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  changeBackgroundButton: {
    marginTop: 15,
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
  },
  selectorContainer: {
    marginBottom: 25,
  },
  selectorHeader: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  selectorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  selectedType: {
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  typeButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  amountButton: {
    marginRight: 10,
  },
  typeButtonBlur: {
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
    height: 50,
    justifyContent: 'center',
    overflow: 'hidden',
    padding: 10,
  },
  amountButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  amountButtonBlur: {
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
    height: 50,
    padding: 10,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  selectedAmount: {
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  typeButton: {
    marginRight: 10,
  },
  demoContainer: {
    marginBottom: 30,
    alignItems: 'center',
  },
  modeToggle: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 10,
  },
  modeButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
  },
  activeModeButton: {
    backgroundColor: 'rgba(0, 122, 255, 0.8)',
  },
  modeButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  activeModeText: {
    color: '#fff',
  },
  targetBlurContainer: {
    height: 350,
    marginBottom: 30,
    borderRadius: 12,
    overflow: 'hidden',
  },
  blurOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  blurContent: {
    padding: 20,
    alignItems: 'center',
  },
  targetView: {
    flex: 1,
  },
  targetBackground: {
    flex: 1,
  },
  targetScrollContent: {
    padding: 16,
    paddingTop: 200,
  },
  targetText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  targetCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
  },
  targetCardText: {
    fontSize: 16,
    color: '#333',
  },
});

export default MainExample;
