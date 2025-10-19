import BlurView, { type BlurType } from '@sbaiahmed1/react-native-blur';
import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { width } from '../constants';

const ComparisonExamples = () => {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [selectedIntensity, setSelectedIntensity] = useState(40);
  const [showAllCards, setShowAllCards] = useState(false);
  const [useRealBlur, setUseRealBlur] = useState(false);

  const blurCards = [
    { type: 'light', emoji: '☀️' },
    { type: 'dark', emoji: '🌙' },
    { type: 'xlight', emoji: '✨' },
    { type: 'extraDark', emoji: '🖤' },
    { type: 'regular', emoji: '⚪' },
    { type: 'prominent', emoji: '💎' },
    { type: 'systemUltraThinMaterial', emoji: '🧊' },
    { type: 'systemThinMaterial', emoji: '🔮' },
    { type: 'systemMaterial', emoji: '🎭' },
    { type: 'systemThickMaterial', emoji: '🌌' },
    { type: 'systemChromeMaterial', emoji: '🪞' },
  ];

  const nextCard = () => {
    setCurrentCardIndex((prev) => (prev + 1) % blurCards.length);
  };

  const prevCard = () => {
    setCurrentCardIndex(
      (prev) => (prev - 1 + blurCards.length) % blurCards.length
    );
  };

  const currentCard = blurCards[currentCardIndex] || {
    type: 'light',
    emoji: '☀️',
  };
  return (
    <View style={styles.comparisonContainer}>
      <Text style={styles.sectionTitle}>Blur Effect Showcase</Text>

      {/* Mode Toggle */}
      <View style={styles.modeToggle}>
        <TouchableOpacity
          onPress={() => setUseRealBlur(false)}
          style={[styles.modeButton, !useRealBlur && styles.activeModeButton]}
        >
          <Text
            style={[styles.modeText, !useRealBlur && styles.activeModeText]}
          >
            Standard Blur
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setUseRealBlur(true)}
          style={[styles.modeButton, useRealBlur && styles.activeModeButton]}
        >
          <Text style={[styles.modeText, useRealBlur && styles.activeModeText]}>
            Real Blur (v3)
          </Text>
        </TouchableOpacity>
      </View>

      {/* Real Blur Example - blurs the app's background */}
      {useRealBlur ? (
        <View style={styles.realBlurContainer}>
          <BlurView
            targetId="background"
            blurType={currentCard.type as BlurType}
            blurAmount={selectedIntensity}
            style={styles.realBlurCard}
          >
            <Text style={styles.cardEmoji}>{currentCard.emoji}</Text>
            <Text style={styles.cardTitle}>{currentCard.type}</Text>
            <Text style={styles.cardIntensity}>
              {selectedIntensity}% Real Blur
            </Text>

            <View style={styles.cardControls}>
              <TouchableOpacity onPress={prevCard} style={styles.navButton}>
                <Text style={styles.navButtonText}>←</Text>
              </TouchableOpacity>

              <View style={styles.cardIndicator}>
                <Text style={styles.indicatorText}>
                  {currentCardIndex + 1} / {blurCards.length}
                </Text>
              </View>

              <TouchableOpacity onPress={nextCard} style={styles.navButton}>
                <Text style={styles.navButtonText}>→</Text>
              </TouchableOpacity>
            </View>
          </BlurView>

          <Text style={styles.realBlurNote}>
            ✨ Blurring the actual app background in real-time
          </Text>
        </View>
      ) : (
        /* Main Carousel Card - Standard Blur */
        <View style={styles.carouselContainer}>
          <View style={[styles.mainCard]}>
            <BlurView
              blurType={currentCard.type as BlurType}
              blurAmount={selectedIntensity}
              style={styles.carouselBlurView}
            >
              <Text style={styles.cardEmoji}>{currentCard.emoji}</Text>
              <Text style={styles.cardTitle}>{currentCard.type}</Text>
              <Text style={styles.cardIntensity}>
                {selectedIntensity}% Blur
              </Text>

              <View style={styles.cardControls}>
                <TouchableOpacity onPress={prevCard} style={styles.navButton}>
                  <Text style={styles.navButtonText}>←</Text>
                </TouchableOpacity>

                <View style={styles.cardIndicator}>
                  <Text style={styles.indicatorText}>
                    {currentCardIndex + 1} / {blurCards.length}
                  </Text>
                </View>

                <TouchableOpacity onPress={nextCard} style={styles.navButton}>
                  <Text style={styles.navButtonText}>→</Text>
                </TouchableOpacity>
              </View>
            </BlurView>
          </View>
        </View>
      )}

      {/* Intensity Slider */}
      <View style={styles.intensitySlider}>
        <Text style={styles.controlLabel}>Blur Intensity</Text>
        <View style={styles.sliderTrack}>
          {[10, 20, 40, 60, 80, 100].map((intensity) => (
            <TouchableOpacity
              key={intensity}
              onPress={() => setSelectedIntensity(intensity)}
              style={[
                styles.sliderDot,
                selectedIntensity === intensity && styles.activeDot,
              ]}
            >
              <Text style={styles.dotLabel}>{intensity}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Toggle View Mode */}
      <TouchableOpacity
        onPress={() => setShowAllCards(!showAllCards)}
        style={styles.toggleButton}
      >
        <BlurView blurType="dark" blurAmount={30} style={styles.toggleBlur}>
          <Text style={styles.toggleText}>
            {showAllCards ? '📱 Carousel View' : '🎯 Grid View'}
          </Text>
        </BlurView>
      </TouchableOpacity>

      {/* Grid View (when toggled) */}
      {showAllCards && (
        <View style={styles.gridContainer}>
          <Text style={styles.gridTitle}>All Blur Types</Text>
          <View style={styles.blurGrid}>
            {blurCards.map((card, index) => (
              <TouchableOpacity
                key={card.type}
                onPress={() => setCurrentCardIndex(index)}
                style={[
                  styles.gridCard,
                  currentCardIndex === index && styles.selectedGridCard,
                ]}
              >
                <BlurView
                  blurType={card.type as BlurType}
                  blurAmount={30}
                  style={styles.gridBlurView}
                >
                  <Text style={styles.gridEmoji}>{card.emoji}</Text>
                  <Text style={styles.gridCardText}>
                    {card.type.slice(0, 8)}
                  </Text>
                </BlurView>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Fun Facts */}
      <View style={styles.funFactsContainer}>
        <BlurView
          blurType="systemMaterial"
          blurAmount={20}
          style={styles.funFactsBlur}
        >
          <Text style={styles.funFactTitle}>💡 Did you know?</Text>
          <Text style={styles.funFactText}>
            {currentCard.type === 'light' &&
              'Light blur is perfect for bright backgrounds!'}
            {currentCard.type === 'dark' &&
              'Dark blur creates elegant overlays!'}
            {currentCard.type === 'xlight' &&
              'Extra light blur is subtle and refined!'}
            {currentCard.type === 'extraDark' &&
              'Extra dark blur provides maximum contrast!'}
            {currentCard.type === 'regular' &&
              'Regular blur is the most versatile option!'}
            {currentCard.type === 'prominent' &&
              'Prominent blur makes content stand out!'}
            {currentCard.type.includes('system') &&
              'System materials adapt to iOS appearance!'}
          </Text>
        </BlurView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 15,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  comparisonContainer: {
    marginBottom: 20,
  },
  carouselContainer: {
    marginBottom: 25,
    alignItems: 'center',
  },
  mainCard: {
    width: width * 0.9,
    height: 250,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  carouselBlurView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  cardEmoji: {
    fontSize: 48,
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  cardIntensity: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
    marginBottom: 20,
  },
  cardControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  navButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  navButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  cardIndicator: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 15,
  },
  indicatorText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  intensitySlider: {
    marginBottom: 25,
  },
  controlLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 15,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  sliderTrack: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  sliderDot: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeDot: {
    backgroundColor: '#007AFF',
    transform: [{ scale: 1.2 }],
  },
  dotLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
  },
  toggleButton: {
    marginBottom: 20,
    alignSelf: 'center',
    borderRadius: 25,
    overflow: 'hidden',
  },
  toggleBlur: {
    paddingHorizontal: 25,
    paddingVertical: 12,
  },
  toggleText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    textAlign: 'center',
  },
  gridContainer: {
    marginBottom: 25,
  },
  gridTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 15,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  blurGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
  gridCard: {
    width: '30%',
    height: 80,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 10,
  },
  selectedGridCard: {
    borderWidth: 3,
    borderColor: '#007AFF',
  },
  gridBlurView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
  },
  gridEmoji: {
    fontSize: 20,
    marginBottom: 4,
  },
  gridCardText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  funFactsContainer: {
    marginBottom: 20,
    borderRadius: 15,
    overflow: 'hidden',
  },
  funFactsBlur: {
    padding: 20,
  },
  funFactTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  funFactText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  modeToggle: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 10,
  },
  modeButton: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
  },
  activeModeButton: {
    backgroundColor: 'rgba(0, 122, 255, 0.8)',
  },
  modeText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  activeModeText: {
    color: '#fff',
  },
  realBlurContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  realBlurCard: {
    width: width * 0.9,
    height: 250,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  realBlurNote: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
});

export default ComparisonExamples;
