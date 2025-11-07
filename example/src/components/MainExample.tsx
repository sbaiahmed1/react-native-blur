import BlurView, { type BlurType } from '@sbaiahmed1/react-native-blur';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { BLUR_TYPES, width } from '../constants';
import { useState } from 'react';

const MainExample = ({ cycleBackground }: { cycleBackground: () => void }) => {
  const [selectedBlurType, setSelectedBlurType] = useState<BlurType>('light');
  const [blurAmount, setBlurAmount] = useState(20);
  return (
    <>
      {/* Main Blur Demo */}
      <View style={styles.demoContainer}>
        <BlurView
          blurType={selectedBlurType}
          blurAmount={blurAmount}
          style={styles.blurCard}
          reducedTransparencyFallbackColor="rgba(255, 255, 255, 0.8)"
        >
          <Text style={styles.cardTitle}>Blur Effect Demo</Text>
          <Text style={styles.cardSubtitle}>Type: {selectedBlurType}</Text>
          <Text style={styles.cardSubtitle}>Amount: {blurAmount}%</Text>
          <TouchableOpacity
            style={styles.changeBackgroundButton}
            onPress={cycleBackground}
          >
            <Text style={styles.buttonText}>Change Background</Text>
          </TouchableOpacity>
        </BlurView>
      </View>

      {/* Blur Type Selector */}
      <View style={styles.selectorContainer}>
        <BlurView blurType="dark" blurAmount={30} style={styles.selectorHeader}>
          <Text style={styles.selectorTitle}>Blur Types</Text>
        </BlurView>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {BLUR_TYPES.map(type => (
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
        <BlurView blurType="dark" blurAmount={30} style={styles.selectorHeader}>
          <Text style={styles.selectorTitle}>Blur Amount</Text>
        </BlurView>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {[5, 10, 20, 30, 50, 75, 100].map(amount => (
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
});

export default MainExample;
