import {
  LiquidGlassView,
  LiquidGlassContainer,
} from '@sbaiahmed1/react-native-blur';
import { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ImageBackground,
  Image,
  StyleSheet,
  Animated,
} from 'react-native';
import { glassColors } from '../constants';

const LiquidGlassExample = ({
  cycleBackground,
}: {
  cycleBackground: () => void;
}) => {
  const [selectedGlassType, setSelectedGlassType] = useState<
    'clear' | 'regular'
  >('clear');
  const [glassTintColor, setGlassTintColor] = useState('#007AFF');
  const [glassOpacity, setGlassOpacity] = useState(0.8);
  const [containerSpacing, setContainerSpacing] = useState(20);
  const translateX = useRef(new Animated.Value(0)).current;

  const animateCirclesCloser = () => {
    Animated.sequence([
      Animated.timing(translateX, {
        toValue: -50,
        duration: 2000,
        useNativeDriver: true,
      }),
      Animated.timing(translateX, {
        toValue: 30,
        duration: 2000,
        useNativeDriver: true,
      }),
    ]).start();
  };

  return (
    <View style={styles.liquidGlassContainer}>
      <Text style={styles.sectionTitle}>Liquid Glass Effects</Text>
      <Text style={styles.liquidGlassSubtitle}>
        ✨ Available on iOS 26+ • Fallback to blur on older versions
      </Text>

      {/* Main Liquid Glass Demo */}
      <View style={styles.liquidGlassDemo}>
        <LiquidGlassView
          ignoreAccessibilityFallback
          glassType={selectedGlassType}
          glassTintColor={glassTintColor}
          glassOpacity={glassOpacity}
          style={[styles.liquidGlassCard, { borderRadius: 20 }]}
          reducedTransparencyFallbackColor="rgba(255, 255, 255, 0.9)"
        >
          <Text style={styles.liquidGlassTitle}>🌊 Liquid Glass</Text>
          <Text style={styles.liquidGlassInfo}>Type: {selectedGlassType}</Text>
          <Text style={styles.liquidGlassInfo}>Tint: {glassTintColor}</Text>
          <Text style={styles.liquidGlassInfo}>
            Opacity: {Math.round(glassOpacity * 100)}%
          </Text>
          <Text style={styles.liquidGlassInfo}>Radius: {20}px</Text>

          <TouchableOpacity
            style={[
              styles.glassButton,
              { backgroundColor: glassTintColor + '40' },
            ]}
            onPress={cycleBackground}
          >
            <Text style={styles.glassButtonText}>Change Background</Text>
          </TouchableOpacity>
        </LiquidGlassView>
      </View>

      {/* Glass Type Selector */}
      <View style={styles.selectorContainer}>
        <LiquidGlassView
          isInteractive={false}
          glassType="clear"
          glassTintColor="#000000"
          glassOpacity={0.3}
          style={styles.selectorHeader}
        >
          <Text style={styles.selectorTitle}>Glass Types</Text>
        </LiquidGlassView>

        <View style={styles.glassTypeSelector}>
          {['clear', 'regular'].map(glassType => (
            <TouchableOpacity
              key={glassType}
              onPress={() =>
                setSelectedGlassType(glassType as 'clear' | 'regular')
              }
              style={styles.glassTypeButton}
            >
              <LiquidGlassView
                glassType={glassType as 'clear' | 'regular'}
                glassTintColor={glassTintColor}
                glassOpacity={0.6}
                style={[
                  styles.glassTypeButtonBlur,
                  selectedGlassType === glassType && styles.selectedGlassType,
                ]}
              >
                <Text style={styles.glassTypeText}>
                  {glassType === 'clear' ? '🔮 Clear' : '💎 Regular'}
                </Text>
                <Text style={styles.glassTypeSubtext}>{glassType}</Text>
              </LiquidGlassView>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Glass Tint Color Selector */}
      <View style={styles.selectorContainer}>
        <LiquidGlassView
          glassType="clear"
          glassTintColor="#000000"
          glassOpacity={0.3}
          style={styles.selectorHeader}
        >
          <Text style={styles.selectorTitle}>Glass Tint Colors</Text>
        </LiquidGlassView>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {glassColors.map(colorItem => (
            <TouchableOpacity
              key={colorItem.name}
              onPress={() => setGlassTintColor(colorItem.color)}
              style={styles.colorButton}
            >
              <LiquidGlassView
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
              </LiquidGlassView>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Glass Opacity Slider */}
      <View style={styles.selectorContainer}>
        <LiquidGlassView
          glassType="clear"
          glassTintColor="#000000"
          glassOpacity={0.3}
          style={styles.selectorHeader}
        >
          <Text style={styles.selectorTitle}>Glass Opacity</Text>
        </LiquidGlassView>

        <View style={styles.opacitySlider}>
          {[0.2, 0.4, 0.6, 0.8, 1.0].map(opacity => (
            <TouchableOpacity
              key={opacity}
              onPress={() => setGlassOpacity(opacity)}
              style={styles.opacityButton}
            >
              <LiquidGlassView
                glassType={selectedGlassType}
                glassTintColor={glassTintColor}
                glassOpacity={opacity}
                style={[
                  styles.opacityButtonBlur,
                  glassOpacity === opacity && styles.selectedOpacity,
                ]}
              >
                <Text numberOfLines={1} style={styles.opacityText}>
                  {Math.round(opacity * 100)}%
                </Text>
              </LiquidGlassView>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Liquid Glass Container with Spacing */}
      <View style={styles.selectorContainer}>
        <LiquidGlassView
          glassType="clear"
          glassTintColor="#000000"
          glassOpacity={0.3}
          style={styles.selectorHeader}
        >
          <Text style={styles.selectorTitle}>
            🌊 Liquid Glass Container (iOS 26+)
          </Text>
        </LiquidGlassView>

        <LiquidGlassContainer
          spacing={containerSpacing}
          style={styles.containerDemo}
        >
          <LiquidGlassView
            ignoreAccessibilityFallback
            glassType="clear"
            glassOpacity={0.0}
            style={styles.glassContainerContent}
          >
            <Text style={styles.selectorTitle}>Circle 1</Text>
          </LiquidGlassView>
          <Animated.View
            style={{
              transform: [{ translateX }],
            }}
          >
            <LiquidGlassView
              ignoreAccessibilityFallback
              glassType="clear"
              glassOpacity={0.0}
              style={styles.glassContainerContent}
            >
              <Text style={styles.selectorTitle}>Circle 2</Text>
            </LiquidGlassView>
          </Animated.View>
        </LiquidGlassContainer>

        {/* Animate Button */}
        <TouchableOpacity
          style={styles.animateButton}
          onPress={animateCirclesCloser}
        >
          <Text style={styles.animateButtonText}>✨ Animate Circles</Text>
        </TouchableOpacity>

        {/* Spacing Selector */}
        <View style={styles.spacingSelector}>
          {[0, 10, 20, 30, 40].map(spacing => (
            <TouchableOpacity
              key={spacing}
              onPress={() => setContainerSpacing(spacing)}
              style={styles.spacingButton}
            >
              <View
                style={[
                  styles.spacingButtonContent,
                  containerSpacing === spacing && styles.selectedSpacing,
                ]}
              >
                <Text style={styles.spacingText}>{spacing}px</Text>
              </View>
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
            <LiquidGlassView
              glassType="regular"
              glassTintColor="#FFFFFF"
              glassOpacity={0}
              style={styles.glassCardOverlay}
            >
              <Text style={styles.glassCardTitle}>Interactive Glass Card</Text>
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
            </LiquidGlassView>
          </ImageBackground>
        </View>

        {/* Glass Modal */}
        <View style={styles.glassModalExample}>
          <Image
            source={{
              uri: 'https://images.unsplash.com/photo-1560703650-ef3e0f254ae0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1770&q=80',
            }}
            style={styles.glassModalBackground}
          />
          <LiquidGlassView
            glassType="regular"
            glassTintColor="#007AFF"
            glassOpacity={0.2}
            style={styles.glassModal}
          >
            <Text style={styles.glassModalTitle}>🌊 Liquid Glass Modal</Text>
            <Text style={styles.glassModalText}>
              Experience the fluid, dynamic nature of liquid glass effects.
            </Text>
            <TouchableOpacity style={styles.glassModalButton}>
              <Text style={styles.glassModalButtonText}>Continue</Text>
            </TouchableOpacity>
          </LiquidGlassView>
        </View>
      </View>

      {/* iOS Version Info */}
      <View style={styles.versionInfoContainer}>
        <LiquidGlassView
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
        </LiquidGlassView>
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
  selectorContainer: {
    marginBottom: 25,
  },
  selectorHeader: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    width: '100%',
    alignItems: 'center',
  },
  selectorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
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
    height: 300,
    overflow: 'hidden',
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

  glassModalExample: {
    marginBottom: 20,
    borderRadius: 20,
    height: 180,
    overflow: 'hidden',
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
  // Liquid Glass Container Styles
  containerDemo: {
    minHeight: 200,
    marginBottom: 15,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  spacingSelector: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  spacingButton: {
    flex: 1,
    marginHorizontal: 2,
  },
  spacingButtonContent: {
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedSpacing: {
    backgroundColor: 'rgba(0, 122, 255, 0.2)',
    borderColor: '#007AFF',
  },
  spacingText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#FFF',
  },
  glassContainerContent: {
    width: 120,
    height: 120,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 60,
  },
  animateButton: {
    backgroundColor: 'rgba(0, 122, 255, 0.8)',
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 15,
    alignItems: 'center',
    marginVertical: 15,
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  animateButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default LiquidGlassExample;
