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
  const [showSection, setShowSection] = useState('liquidGlass');
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [selectedIntensity, setSelectedIntensity] = useState(40);
  const [showAllCards, setShowAllCards] = useState(false);
  const [selectedGlassType, setSelectedGlassType] = useState<
    'clear' | 'regular'
  >('clear');
  const [glassTintColor, setGlassTintColor] = useState('#007AFF');
  const [glassOpacity, setGlassOpacity] = useState(0.8);
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
      case 'liquidGlass':
        return renderLiquidGlassExamples();
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

  const renderLiquidGlassExamples = () => {
    const glassColors = [
      { name: 'Blue', color: '#007AFF', emoji: '💙' },
      { name: 'Purple', color: '#AF52DE', emoji: '💜' },
      { name: 'Green', color: '#34C759', emoji: '💚' },
      { name: 'Orange', color: '#FF9500', emoji: '🧡' },
      { name: 'Red', color: '#FF3B30', emoji: '❤️' },
      { name: 'Pink', color: '#FF2D92', emoji: '💗' },
      { name: 'Teal', color: '#5AC8FA', emoji: '💎' },
      { name: 'Clear', color: 'clear', emoji: '🔮' },
    ];

    return (
      <View style={styles.liquidGlassContainer}>
        <Text style={styles.sectionTitle}>Liquid Glass Effects</Text>
        <Text style={styles.liquidGlassSubtitle}>
          ✨ Available on iOS 26+ • Fallback to blur on older versions
        </Text>

        {/* Main Liquid Glass Demo */}
        <View style={styles.liquidGlassDemo}>
          <BlurView
            type="liquidGlass"
            glassType={selectedGlassType}
            glassTintColor={glassTintColor}
            glassOpacity={glassOpacity}
            style={styles.liquidGlassCard}
            reducedTransparencyFallbackColor="rgba(255, 255, 255, 0.9)"
          >
            <Text style={styles.liquidGlassTitle}>🌊 Liquid Glass</Text>
            <Text style={styles.liquidGlassInfo}>
              Type: {selectedGlassType}
            </Text>
            <Text style={styles.liquidGlassInfo}>Tint: {glassTintColor}</Text>
            <Text style={styles.liquidGlassInfo}>
              Opacity: {Math.round(glassOpacity * 100)}%
            </Text>

            <TouchableOpacity
              style={[
                styles.glassButton,
                { backgroundColor: glassTintColor + '40' },
              ]}
              onPress={cycleBackground}
            >
              <Text style={styles.glassButtonText}>Change Background</Text>
            </TouchableOpacity>
          </BlurView>
        </View>

        {/* Glass Type Selector */}
        <View style={styles.selectorContainer}>
          <BlurView
            type="liquidGlass"
            glassType="clear"
            glassTintColor="#000000"
            glassOpacity={0.3}
            style={styles.selectorHeader}
          >
            <Text style={styles.selectorTitle}>Glass Types</Text>
          </BlurView>

          <View style={styles.glassTypeSelector}>
            {['clear', 'regular'].map((type) => (
              <TouchableOpacity
                key={type}
                onPress={() =>
                  setSelectedGlassType(type as 'clear' | 'regular')
                }
                style={styles.glassTypeButton}
              >
                <BlurView
                  type="liquidGlass"
                  glassType={type as 'clear' | 'regular'}
                  glassTintColor={glassTintColor}
                  glassOpacity={0.6}
                  style={[
                    styles.glassTypeButtonBlur,
                    selectedGlassType === type && styles.selectedGlassType,
                  ]}
                >
                  <Text style={styles.glassTypeText}>
                    {type === 'clear' ? '🔮 Clear' : '💎 Regular'}
                  </Text>
                  <Text style={styles.glassTypeSubtext}>{type}</Text>
                </BlurView>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Glass Tint Color Selector */}
        <View style={styles.selectorContainer}>
          <BlurView
            type="liquidGlass"
            glassType="clear"
            glassTintColor="#000000"
            glassOpacity={0.3}
            style={styles.selectorHeader}
          >
            <Text style={styles.selectorTitle}>Glass Tint Colors</Text>
          </BlurView>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {glassColors.map((colorItem) => (
              <TouchableOpacity
                key={colorItem.name}
                onPress={() => setGlassTintColor(colorItem.color)}
                style={styles.colorButton}
              >
                <BlurView
                  type="liquidGlass"
                  glassType={selectedGlassType}
                  glassTintColor={colorItem.color}
                  glassOpacity={0.8}
                  style={[
                    styles.colorButtonBlur,
                    glassTintColor === colorItem.color && styles.selectedColor,
                  ]}
                >
                  <Text style={styles.colorEmoji}>{colorItem.emoji}</Text>
                  <Text style={styles.colorName}>{colorItem.name}</Text>
                </BlurView>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Glass Opacity Slider */}
        <View style={styles.selectorContainer}>
          <BlurView
            type="liquidGlass"
            glassType="clear"
            glassTintColor="#000000"
            glassOpacity={0.3}
            style={styles.selectorHeader}
          >
            <Text style={styles.selectorTitle}>Glass Opacity</Text>
          </BlurView>

          <View style={styles.opacitySlider}>
            {[0.2, 0.4, 0.6, 0.8, 1.0].map((opacity) => (
              <TouchableOpacity
                key={opacity}
                onPress={() => setGlassOpacity(opacity)}
                style={styles.opacityButton}
              >
                <BlurView
                  type="liquidGlass"
                  glassType={selectedGlassType}
                  glassTintColor={glassTintColor}
                  glassOpacity={opacity}
                  style={[
                    styles.opacityButtonBlur,
                    glassOpacity === opacity && styles.selectedOpacity,
                  ]}
                >
                  <Text style={styles.opacityText}>
                    {Math.round(opacity * 100)}%
                  </Text>
                </BlurView>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Practical Liquid Glass Examples */}
        <View style={styles.practicalGlassContainer}>
          <Text style={styles.sectionTitle}>Practical Examples</Text>

          {/* Interactive Card */}
          <View style={styles.glassExampleCard}>
            <ImageBackground
              source={{
                uri: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1974&q=80',
              }}
              style={styles.glassCardBackground}
            >
              <BlurView
                type="liquidGlass"
                glassType="regular"
                glassTintColor="#FFFFFF"
                glassOpacity={0.7}
                style={styles.glassCardOverlay}
              >
                <Text style={styles.glassCardTitle}>
                  Interactive Glass Card
                </Text>
                <Text style={styles.glassCardText}>
                  Liquid glass creates beautiful, interactive surfaces that
                  respond to touch and light.
                </Text>
                <View style={styles.glassCardButtons}>
                  <TouchableOpacity style={styles.glassCardButton}>
                    <Text style={styles.glassCardButtonText}>Action</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.glassCardButton}>
                    <Text style={styles.glassCardButtonText}>Share</Text>
                  </TouchableOpacity>
                </View>
              </BlurView>
            </ImageBackground>
          </View>

          {/* Glass Navigation Bar */}
          <View style={styles.glassNavExample}>
            <Image
              source={{
                uri: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80',
              }}
              style={styles.glassNavBackground}
            />
            <BlurView
              type="liquidGlass"
              glassType="clear"
              glassTintColor="#000000"
              glassOpacity={0.4}
              style={styles.glassNavBar}
            >
              <View style={styles.glassNavContent}>
                <Text style={styles.glassNavTitle}>Glass Navigation</Text>
                <View style={styles.glassNavButtons}>
                  <TouchableOpacity style={styles.glassNavButton}>
                    <Text style={styles.glassNavButtonText}>🏠</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.glassNavButton}>
                    <Text style={styles.glassNavButtonText}>⭐</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.glassNavButton}>
                    <Text style={styles.glassNavButtonText}>👤</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </BlurView>
          </View>

          {/* Glass Modal */}
          <View style={styles.glassModalExample}>
            <Image
              source={{
                uri: 'https://images.unsplash.com/photo-1560703650-ef3e0f254ae0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1770&q=80',
              }}
              style={styles.glassModalBackground}
            />
            <BlurView
              type="liquidGlass"
              glassType="regular"
              glassTintColor="#007AFF"
              glassOpacity={0.6}
              style={styles.glassModal}
            >
              <Text style={styles.glassModalTitle}>🌊 Liquid Glass Modal</Text>
              <Text style={styles.glassModalText}>
                Experience the fluid, dynamic nature of liquid glass effects.
              </Text>
              <TouchableOpacity style={styles.glassModalButton}>
                <Text style={styles.glassModalButtonText}>Continue</Text>
              </TouchableOpacity>
            </BlurView>
          </View>
        </View>

        {/* iOS Version Info */}
        <View style={styles.versionInfoContainer}>
          <BlurView
            type="liquidGlass"
            glassType="clear"
            glassTintColor="#FF9500"
            glassOpacity={0.5}
            style={styles.versionInfo}
          >
            <Text style={styles.versionInfoTitle}>📱 iOS 26+ Required</Text>
            <Text style={styles.versionInfoText}>
              Liquid glass effects are only available on iOS 26 and later. On
              older versions, the component automatically falls back to regular
              blur effects.
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
            <TouchableOpacity
              onPress={() => setShowSection('liquidGlass')}
              style={[
                styles.tab,
                showSection === 'liquidGlass' && styles.activeTab,
              ]}
            >
              <BlurView
                key="comparison-tab"
                blurType={showSection === 'liquidGlass' ? 'dark' : 'light'}
                blurAmount={30}
                style={styles.tabBlur}
              >
                <Text
                  numberOfLines={1}
                  style={[
                    styles.tabText,
                    showSection === 'liquidGlass' && styles.activeTabText,
                  ]}
                >
                  Liquid Glass
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
  // Liquid Glass Styles
  liquidGlassContainer: {
    padding: 20,
  },
  liquidGlassSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    fontStyle: 'italic',
  },
  liquidGlassDemo: {
    marginBottom: 30,
  },
  liquidGlassCard: {
    padding: 20,
    borderRadius: 20,
    minHeight: 150,
    justifyContent: 'center',
    alignItems: 'center',
  },
  liquidGlassTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 10,
    textAlign: 'center',
  },
  liquidGlassInfo: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
    textAlign: 'center',
  },
  glassButton: {
    marginTop: 15,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  glassButtonText: {
    color: '#000',
    fontWeight: '600',
    textAlign: 'center',
  },
  glassTypeSelector: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  glassTypeButton: {
    flex: 1,
    marginHorizontal: 5,
  },
  glassTypeButtonBlur: {
    padding: 15,
    borderRadius: 15,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedGlassType: {
    borderColor: '#007AFF',
    borderWidth: 2,
  },
  glassTypeText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 5,
  },
  glassTypeSubtext: {
    fontSize: 12,
    color: '#666',
    textTransform: 'capitalize',
  },
  colorButton: {
    marginHorizontal: 5,
  },
  colorButtonBlur: {
    width: 80,
    height: 80,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedColor: {
    borderColor: '#007AFF',
    borderWidth: 2,
  },
  colorEmoji: {
    fontSize: 24,
    marginBottom: 5,
  },
  colorName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000',
    textAlign: 'center',
  },
  opacitySlider: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  opacityButton: {
    flex: 1,
    marginHorizontal: 2,
  },
  opacityButtonBlur: {
    padding: 15,
    borderRadius: 15,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedOpacity: {
    borderColor: '#007AFF',
    borderWidth: 2,
  },
  opacityText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
  },
  practicalGlassContainer: {
    marginTop: 20,
  },
  glassExampleCard: {
    marginBottom: 20,
    borderRadius: 20,
    overflow: 'hidden',
    height: 200,
  },
  glassCardBackground: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  glassCardOverlay: {
    padding: 20,
    minHeight: 120,
  },
  glassCardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  glassCardText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 15,
    lineHeight: 20,
  },
  glassCardButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  glassCardButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  glassCardButtonText: {
    color: '#000',
    fontWeight: '600',
    fontSize: 14,
  },
  glassNavExample: {
    marginBottom: 20,
    borderRadius: 20,
    overflow: 'hidden',
    height: 120,
  },
  glassNavBackground: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  glassNavBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
  },
  glassNavContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  glassNavTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },
  glassNavButtons: {
    flexDirection: 'row',
    gap: 15,
  },
  glassNavButton: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  glassNavButtonText: {
    fontSize: 18,
  },
  glassModalExample: {
    marginBottom: 20,
    borderRadius: 20,
    overflow: 'hidden',
    height: 180,
  },
  glassModalBackground: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  glassModal: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  glassModalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 10,
    textAlign: 'center',
  },
  glassModalText: {
    fontSize: 14,
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  glassModalButton: {
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  glassModalButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  versionInfoContainer: {
    marginTop: 20,
  },
  versionInfo: {
    padding: 20,
    borderRadius: 15,
  },
  versionInfoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 10,
    textAlign: 'center',
  },
  versionInfoText: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
    lineHeight: 20,
  },
});
