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
  Pressable,
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
  const [showSection, setShowSection] = useState('practical');

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
        >
          <View style={{ position: 'static' }}>
            <Text style={styles.cardTitle}>Blur Effect Demo</Text>
            <Text style={styles.cardSubtitle}>Type: {selectedBlurType}</Text>
            <Text style={styles.cardSubtitle}>Amount: {blurAmount}%</Text>
            <Pressable
              style={styles.changeBackgroundButton}
              onPress={cycleBackground}
            >
              <Text style={styles.buttonText}>Change Background</Text>
            </Pressable>
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
        <BlurView blurType="dark" blurAmount={30} style={styles.selectorHeader}>
          <Text style={styles.selectorTitle}>Blur Amount</Text>
        </BlurView>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {[5, 10, 20, 30, 50, 75, 100].map((amount) => (
            <Pressable
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
            </Pressable>
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
            blurType="light"
            blurAmount={100}
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

  const renderComparisonExamples = () => (
    <View style={styles.comparisonContainer}>
      <Text style={styles.sectionTitle}>Blur Type Comparison</Text>

      <View style={styles.comparisonGrid}>
        {BLUR_TYPES.map((type) => (
          <View key={type} style={styles.comparisonItem}>
            <BlurView
              blurType={type}
              blurAmount={40}
              style={styles.comparisonBlur}
            >
              <Text style={styles.comparisonText}>{type}</Text>
            </BlurView>
          </View>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Blur Amount Comparison</Text>

      <View style={styles.comparisonRow}>
        {[10, 30, 50, 70, 90].map((amount) => (
          <View key={amount} style={styles.amountComparisonItem}>
            <BlurView
              blurType="light"
              blurAmount={amount}
              style={styles.amountComparisonBlur}
            >
              <Text style={styles.amountComparisonText}>{amount}%</Text>
            </BlurView>
          </View>
        ))}
      </View>
    </View>
  );

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
  },
  tab: {
    flex: 1,
    marginHorizontal: 5,
    borderRadius: 20,
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
    overflow: 'hidden',
    position: 'relative',
  },
  blurCard: {
    borderRadius: 20,
    alignItems: 'center',
    width: width * 0.85,
    overflow: 'hidden',
    padding: 20,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  cardSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  changeBackgroundButton: {
    backgroundColor: '#007AFF',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    height: 50,
    maxWidth: '100%',
    paddingHorizontal: 20,
    minWidth: 150,
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
    overflow: 'hidden',
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
    overflow: 'hidden',
  },
  amountButton: {
    marginRight: 10,
    overflow: 'hidden',
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
    justifyContent: 'center',
    padding: 15,
    alignItems: 'center',
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
    borderRadius: 20,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    width: 100,
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
  comparisonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  comparisonItem: {
    width: '48%',
    marginBottom: 15,
    borderRadius: 10,
    overflow: 'hidden',
  },
  comparisonBlur: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    height: 100,
  },
  comparisonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  comparisonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  amountComparisonItem: {
    flex: 1,
    marginHorizontal: 5,
    borderRadius: 10,
    overflow: 'hidden',
  },
  amountComparisonBlur: {
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
    height: 80,
  },
  amountComparisonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
});
