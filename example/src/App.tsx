import { useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  SafeAreaView,
  Image,
  Dimensions,
  StatusBar,
} from 'react-native';
import { BlurView, type BlurType } from '@sbaiahmed1/react-native-blur';

const { width } = Dimensions.get('window');

const BLUR_TYPES: BlurType[] = [
  'light',
  'dark',
  'xlight',
  'extraDark',
  'regular',
  'prominent',
  'systemUltraThinMaterial',
  'systemThinMaterial',
  'systemMaterial',
  'systemThickMaterial',
  'systemChromeMaterial',
];

const DEMO_IMAGES = [
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80',
  'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?ixlib=rb-4.0.3&auto=format&fit=crop&w=1788&q=80',
  'https://images.unsplash.com/photo-1560703650-ef3e0f254ae0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1770&q=80',
];

export default function App() {
  const [selectedBlurType, setSelectedBlurType] = useState<BlurType>('light');
  const [blurAmount, setBlurAmount] = useState(20);
  const [backgroundIndex, setBackgroundIndex] = useState(0);
  const [showSection, setShowSection] = useState('demo');
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [selectedIntensity, setSelectedIntensity] = useState(40);
  const [showAllCards, setShowAllCards] = useState(false);
  const cycleBackground = () => {
    setBackgroundIndex((prev) => (prev + 1) % DEMO_IMAGES.length);
  };

  const renderSection = () => {
    switch (showSection) {
      case 'demo':
        return renderMainDemo();
      case 'practical':
        return renderPracticalExamples();
      case 'comparison':
        return renderComparisonExamples();
      default:
        return renderMainDemo();
    }
  };

  const renderMainDemo = () => (
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
        <BlurView blurType="dark" blurAmount={30} style={styles.selectorHeader}>
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

  const renderPracticalExamples = () => (
    <View style={styles.practicalExamplesContainer}>
      <Text style={styles.sectionTitle}>Practical Use Cases</Text>

      {/* Card with Blurred Header */}
      <View style={styles.exampleCard}>
        <ImageBackground
          source={{
            uri: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?ixlib=rb-4.0.3&auto=format&fit=crop&w=1770&q=80',
          }}
          style={styles.cardHeader}
        >
          <BlurView
            blurType="dark"
            blurAmount={50}
            style={styles.cardHeaderBlur}
          >
            <Text style={styles.cardHeaderTitle}>Blurred Header</Text>
          </BlurView>
        </ImageBackground>
        <View style={styles.cardBody}>
          <Text style={styles.cardBodyText}>
            A common UI pattern with a blurred header over an image
          </Text>
        </View>
      </View>

      {/* Frosted Glass Modal */}
      <View style={styles.exampleCard}>
        <View style={styles.modalExample}>
          <Image
            source={{
              uri: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?ixlib=rb-4.0.3&auto=format&fit=crop&w=1964&q=80',
            }}
            style={styles.modalBackground}
          />
          <BlurView
            blurType="systemMaterial"
            blurAmount={40}
            style={styles.frostedModal}
          >
            <Text style={styles.modalTitle}>Frosted Glass Modal</Text>
            <Text style={styles.modalText}>
              Blur effects create elegant, modern UI components
            </Text>
            <View style={styles.modalButton}>
              <Text style={styles.modalButtonText}>OK</Text>
            </View>
          </BlurView>
        </View>
      </View>

      {/* Bottom Sheet */}
      <View style={styles.exampleCard}>
        <Image
          source={{
            uri: 'https://images.unsplash.com/photo-1604537466608-109fa2f16c3b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1769&q=80',
          }}
          style={styles.bottomSheetBackground}
        />
        <BlurView
          blurType="systemThinMaterial"
          blurAmount={30}
          style={styles.bottomSheet}
        >
          <View style={styles.bottomSheetHandle} />
          <Text style={styles.bottomSheetTitle}>Blurred Bottom Sheet</Text>
          <Text style={styles.bottomSheetText}>
            Perfect for overlays and action sheets
          </Text>
        </BlurView>
      </View>
    </View>
  );

  const renderComparisonExamples = () => {
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

        {/* Main Carousel Card */}
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

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />
      <ImageBackground
        source={{ uri: DEMO_IMAGES[backgroundIndex] }}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.title}>React Native Blur Demo</Text>

          {/* Navigation Tabs */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              onPress={() => setShowSection('demo')}
              style={[styles.tab, showSection === 'demo' && styles.activeTab]}
            >
              <BlurView
                key="demo-tab"
                blurType={showSection === 'demo' ? 'dark' : 'light'}
                blurAmount={30}
                style={styles.tabBlur}
              >
                <Text
                  style={[
                    styles.tabText,
                    showSection === 'demo' && styles.activeTabText,
                  ]}
                >
                  Demo
                </Text>
              </BlurView>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setShowSection('practical')}
              style={[
                styles.tab,
                showSection === 'practical' && styles.activeTab,
              ]}
            >
              <BlurView
                key="practical-tab"
                blurType={showSection === 'practical' ? 'dark' : 'light'}
                blurAmount={30}
                style={styles.tabBlur}
              >
                <Text
                  style={[
                    styles.tabText,
                    showSection === 'practical' && styles.activeTabText,
                  ]}
                >
                  Use Cases
                </Text>
              </BlurView>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setShowSection('comparison')}
              style={[
                styles.tab,
                showSection === 'comparison' && styles.activeTab,
              ]}
            >
              <BlurView
                key="comparison-tab"
                blurType={showSection === 'comparison' ? 'dark' : 'light'}
                blurAmount={30}
                style={styles.tabBlur}
              >
                <Text
                  style={[
                    styles.tabText,
                    showSection === 'comparison' && styles.activeTabText,
                  ]}
                >
                  Compare
                </Text>
              </BlurView>
            </TouchableOpacity>
          </View>

          {renderSection()}
        </ScrollView>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tab: {
    flex: 1,
    marginHorizontal: 5,
    borderWidth: 2,
    borderColor: 'black',
    borderRadius: 5,
    overflow: 'hidden',
  },
  activeTab: {
    borderWidth: 2,
    borderColor: '#fff',
  },
  tabBlur: {
    alignItems: 'center',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  activeTabText: {
    color: '#fff',
  },
  demoContainer: {
    marginBottom: 30,
    alignItems: 'center',
  },
  blurCard: {
    borderRadius: 20,
    alignItems: 'center',
    width: width * 0.85,
    overflow: 'hidden',
    padding: 20,
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
  typeButton: {
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
  amountButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 15,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  practicalExamplesContainer: {
    marginBottom: 20,
  },
  exampleCard: {
    marginBottom: 20,
    borderRadius: 15,
    overflow: 'hidden',
    backgroundColor: 'white',
  },
  cardHeader: {
    height: 120,
  },
  cardHeaderBlur: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 15,
  },
  cardHeaderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  cardBody: {
    padding: 15,
  },
  cardBodyText: {
    fontSize: 14,
    color: '#333',
  },
  modalExample: {
    height: 200,
    position: 'relative',
  },
  modalBackground: {
    width: '100%',
    height: '100%',
  },
  frostedModal: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: '80%',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    transform: [{ translateX: -width * 0.4 }, { translateY: -70 }],
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  modalText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 15,
  },
  modalButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 8,
    paddingHorizontal: 25,
    borderRadius: 20,
  },
  modalButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  bottomSheetBackground: {
    width: '100%',
    height: 150,
  },
  bottomSheet: {
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    alignItems: 'center',
  },
  bottomSheetHandle: {
    width: 40,
    height: 5,
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderRadius: 3,
    marginBottom: 15,
  },
  bottomSheetTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  bottomSheetText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
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
});
