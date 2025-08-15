import { useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { BlurView } from '@sbaiahmed1/react-native-blur';
import { DEMO_IMAGES } from './constants';
import LiquidGlassExample from './components/LiquidGlassExample';
import MainExample from './components/MainExample';
import PracticalExamples from './components/PracticalExamples';
import ComparisonExamples from './components/ComparaisonExample';

export default function App() {
  const [backgroundIndex, setBackgroundIndex] = useState(0);
  const [showSection, setShowSection] = useState('demo');

  const cycleBackground = () => {
    setBackgroundIndex((prev) => (prev + 1) % DEMO_IMAGES.length);
  };

  const renderSection = () => {
    switch (showSection) {
      case 'demo':
        return <MainExample cycleBackground={cycleBackground} />;
      case 'practical':
        return <PracticalExamples />;
      case 'comparison':
        return <ComparisonExamples />;
      case 'liquidGlass':
        return <LiquidGlassExample cycleBackground={cycleBackground} />;
      default:
        return <MainExample cycleBackground={cycleBackground} />;
    }
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
});
