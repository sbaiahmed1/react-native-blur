import {
  type BlurType,
  BlurView,
  TargetView,
} from '@sbaiahmed1/react-native-blur';
import { useState } from 'react';
import {
  Button,
  Dimensions,
  Image,
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { DEMO_IMAGES } from './constants';

// Sample blur types
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
] as const;

const { width } = Dimensions.get('window');

type DemoTab = 'controls' | 'cards' | 'overlays' | 'gallery';

export default function App() {
  const [blurType, setBlurType] = useState<BlurType>('light');
  const [blurRadius, setBlurRadius] = useState(10);
  const [imageIndex, setImageIndex] = useState(0);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<DemoTab>('controls');

  const isDark = blurType.includes('dark');

  const incrementRadius = () => {
    if (blurRadius < 100) setBlurRadius(blurRadius + 5);
  };

  const decrementRadius = () => {
    if (blurRadius > 0) setBlurRadius(blurRadius - 5);
  };

  const cycleImage = () => {
    setImageIndex((prev) => (prev + 1) % DEMO_IMAGES.length);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* Main Content with BlurTarget */}
      <TargetView id="background" style={styles.blurTarget}>
        <View style={styles.backgroundContainer}>
          <Image
            source={{ uri: DEMO_IMAGES[imageIndex] }}
            style={styles.backgroundImage}
            resizeMode="cover"
          />
        </View>
      </TargetView>

      <ScrollView
        style={[styles.content, isDark && styles.contentDark]}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity style={styles.imageButton} onPress={cycleImage}>
          <Text style={[styles.buttonText, isDark && styles.buttonTextDark]}>
            Change Background Image
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.modalButton}
          onPress={() => setIsModalVisible(true)}
        >
          <Text style={[styles.buttonText, isDark && styles.buttonTextDark]}>
            Open Modal with Blur
          </Text>
        </TouchableOpacity>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'controls' && styles.tabActive]}
            onPress={() => setActiveTab('controls')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'controls' && styles.tabTextActive,
              ]}
            >
              Controls
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'cards' && styles.tabActive]}
            onPress={() => setActiveTab('cards')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'cards' && styles.tabTextActive,
              ]}
            >
              Cards
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'overlays' && styles.tabActive]}
            onPress={() => setActiveTab('overlays')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'overlays' && styles.tabTextActive,
              ]}
            >
              Overlays
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'gallery' && styles.tabActive]}
            onPress={() => setActiveTab('gallery')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'gallery' && styles.tabTextActive,
              ]}
            >
              Gallery
            </Text>
          </TouchableOpacity>
        </View>

        {/* Controls Tab */}
        {activeTab === 'controls' && (
          <>
            {/* Blur Radius Control */}
            <View style={styles.section}>
              <Text
                style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}
              >
                Blur Radius
              </Text>
              <View style={styles.radiusControl}>
                <Button
                  title="+"
                  onPress={incrementRadius}
                  disabled={blurRadius >= 100}
                />
                <Text
                  style={[styles.radiusText, isDark && styles.radiusTextDark]}
                >
                  {blurRadius}
                </Text>
                <Button
                  title="-"
                  onPress={decrementRadius}
                  disabled={blurRadius <= 0}
                />
              </View>
            </View>

            {/* Blur Type Selector */}
            <View style={styles.section}>
              <Text
                style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}
              >
                Blur Type
              </Text>
              {BLUR_TYPES.map((type) => (
                <TouchableOpacity
                  key={type}
                  style={styles.typeItem}
                  onPress={() => setBlurType(type)}
                >
                  <Text
                    style={[styles.typeText, isDark && styles.typeTextDark]}
                  >
                    {type}
                  </Text>
                  <View
                    style={[
                      styles.radio,
                      isDark && styles.radioDark,
                      blurType === type && styles.radioSelected,
                    ]}
                  />
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {/* Cards Tab */}
        {activeTab === 'cards' && (
          <>
            <View style={styles.section}>
              <Text
                style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}
              >
                Blurred Cards
              </Text>
              <Text
                style={[styles.description, isDark && styles.descriptionDark]}
              >
                Cards with different blur types as backgrounds
              </Text>

              {['light', 'dark', 'extraDark', 'prominent'].map((type) => (
                <View key={type} style={styles.blurredCardContainer}>
                  <BlurView
                    targetId="background"
                    blurType={type as BlurType}
                    blurAmount={20}
                    style={styles.blurredCardBlur}
                  />
                  <View style={styles.blurredCardContent}>
                    <Text
                      style={[
                        styles.blurredCardTitle,
                        (type.includes('dark') || type === 'prominent') &&
                          styles.textLight,
                      ]}
                    >
                      {type.toUpperCase()} Card
                    </Text>
                    <Text
                      style={[
                        styles.blurredCardText,
                        (type.includes('dark') || type === 'prominent') &&
                          styles.textLight,
                      ]}
                    >
                      This card uses "{type}" blur type with radius 20
                    </Text>
                  </View>
                </View>
              ))}
            </View>

            <View style={styles.section}>
              <Text
                style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}
              >
                Variable Blur Intensity
              </Text>
              {[5, 15, 30, 50].map((amount) => (
                <View key={amount} style={styles.blurredCardContainer}>
                  <BlurView
                    targetId="background"
                    blurType="light"
                    blurAmount={amount}
                    style={styles.blurredCardBlur}
                  />
                  <View style={styles.blurredCardContent}>
                    <Text style={styles.blurredCardTitle}>
                      Blur Amount: {amount}
                    </Text>
                    <Text style={styles.blurredCardText}>
                      Same blur type, different intensity
                    </Text>
                  </View>
                </View>
              ))}
            </View>

            <View style={styles.section}>
              <Text
                style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}
              >
                Liquid Glass Effect (iOS)
              </Text>
              <Text
                style={[styles.description, isDark && styles.descriptionDark]}
              >
                Advanced glass morphism with tint colors and opacity
              </Text>

              {[
                { color: '#FF6B6B', opacity: 0.3, label: 'Red Glass' },
                { color: '#4ECDC4', opacity: 0.4, label: 'Cyan Glass' },
                { color: '#FFE66D', opacity: 0.35, label: 'Yellow Glass' },
                { color: '#A8E6CF', opacity: 0.45, label: 'Green Glass' },
                {
                  color: 'transparent',
                  opacity: 0.0,
                  label: 'Transparent Glass',
                },
              ].map((glass) => (
                <View key={glass.label} style={styles.blurredCardContainer}>
                  <BlurView
                    targetId="background"
                    type="liquidGlass"
                    glassTintColor={glass.color}
                    glassOpacity={glass.opacity}
                    blurAmount={25}
                    style={styles.blurredCardBlur}
                  />
                  <View style={styles.blurredCardContent}>
                    <Text style={styles.blurredCardTitle}>{glass.label}</Text>
                    <Text style={styles.blurredCardText}>
                      Tint: {glass.color} | Opacity: {glass.opacity}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </>
        )}

        {/* Overlays Tab */}
        {activeTab === 'overlays' && (
          <>
            <View style={styles.section}>
              <Text
                style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}
              >
                Bottom Sheet Overlay
              </Text>
              <View style={styles.bottomSheetDemo}>
                <View style={styles.bottomSheetContainer}>
                  <BlurView
                    targetId="background"
                    blurType="systemThickMaterial"
                    blurAmount={30}
                    style={styles.bottomSheetBlur}
                  />
                  <View style={styles.bottomSheetContent}>
                    <View style={styles.bottomSheetHandle} />
                    <Text style={styles.bottomSheetTitle}>Bottom Sheet</Text>
                    <Text style={styles.bottomSheetText}>
                      Drag to interact (demo only)
                    </Text>
                    <TouchableOpacity style={styles.bottomSheetButton}>
                      <Text style={styles.buttonText}>Action Button</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.section}>
              <Text
                style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}
              >
                Notification Banners
              </Text>
              {['Success', 'Warning', 'Error', 'Info'].map((type, index) => (
                <View key={type} style={styles.notificationContainer}>
                  <BlurView
                    targetId="background"
                    blurType={index % 2 === 0 ? 'light' : 'dark'}
                    blurAmount={25}
                    style={styles.notificationBlur}
                  />
                  <View style={styles.notificationContent}>
                    <Text
                      style={[
                        styles.notificationType,
                        index % 2 === 1 && styles.textLight,
                      ]}
                    >
                      {type}
                    </Text>
                    <Text
                      style={[
                        styles.notificationText,
                        index % 2 === 1 && styles.textLight,
                      ]}
                    >
                      This is a {type.toLowerCase()} notification with blur
                    </Text>
                  </View>
                </View>
              ))}
            </View>

            <View style={styles.section}>
              <Text
                style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}
              >
                Frosted Glass Panels
              </Text>
              <View style={styles.panelsContainer}>
                <View style={styles.glassPanel}>
                  <BlurView
                    targetId="background"
                    blurType="systemThinMaterial"
                    blurAmount={15}
                    style={StyleSheet.absoluteFill}
                  />
                  <View style={styles.glassPanelContent}>
                    <Text style={styles.glassPanelTitle}>Thin</Text>
                    <Text style={styles.glassPanelText}>Material</Text>
                  </View>
                </View>
                <View style={styles.glassPanel}>
                  <BlurView
                    targetId="background"
                    blurType="systemMaterial"
                    blurAmount={20}
                    style={StyleSheet.absoluteFill}
                  />
                  <View style={styles.glassPanelContent}>
                    <Text style={styles.glassPanelTitle}>Regular</Text>
                    <Text style={styles.glassPanelText}>Material</Text>
                  </View>
                </View>
                <View style={styles.glassPanel}>
                  <BlurView
                    targetId="background"
                    blurType="systemThickMaterial"
                    blurAmount={25}
                    style={StyleSheet.absoluteFill}
                  />
                  <View style={styles.glassPanelContent}>
                    <Text style={styles.glassPanelTitle}>Thick</Text>
                    <Text style={styles.glassPanelText}>Material</Text>
                  </View>
                </View>
              </View>
            </View>
          </>
        )}

        {/* Gallery Tab */}
        {activeTab === 'gallery' && (
          <>
            <View style={styles.section}>
              <Text
                style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}
              >
                Image Gallery with Blur
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.galleryScroll}
              >
                {DEMO_IMAGES.map((img, index) => (
                  <View key={index} style={styles.galleryItem}>
                    <Image source={{ uri: img }} style={styles.galleryImage} />
                    <View style={styles.galleryCaptionContainer}>
                      <BlurView
                        targetId="background"
                        blurType="dark"
                        blurAmount={20}
                        style={StyleSheet.absoluteFill}
                      />
                      <View style={styles.galleryCaption}>
                        <Text style={styles.galleryCaptionText}>
                          Image {index + 1}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))}
              </ScrollView>
            </View>

            <View style={styles.section}>
              <Text
                style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}
              >
                Feature Grid
              </Text>
              <View style={styles.featureGrid}>
                {['Camera', 'Photos', 'Videos', 'Files', 'Music', 'Maps'].map(
                  (feature, index) => (
                    <View key={feature} style={styles.featureItem}>
                      <BlurView
                        targetId="background"
                        blurType={
                          index % 3 === 0
                            ? 'light'
                            : index % 3 === 1
                              ? 'dark'
                              : 'prominent'
                        }
                        blurAmount={20}
                        style={StyleSheet.absoluteFill}
                      />
                      <View style={styles.featureContent}>
                        <Text
                          style={[
                            styles.featureIcon,
                            index % 3 === 1 && styles.textLight,
                          ]}
                        >
                          {['📷', '🖼️', '🎥', '📁', '🎵', '🗺️'][index]}
                        </Text>
                        <Text
                          style={[
                            styles.featureText,
                            index % 3 === 1 && styles.textLight,
                          ]}
                        >
                          {feature}
                        </Text>
                      </View>
                    </View>
                  )
                )}
              </View>
            </View>

            <View style={styles.section}>
              <Text
                style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}
              >
                Blurred Buttons
              </Text>
              <View style={styles.blurredButtonsContainer}>
                <TouchableOpacity style={styles.blurredButton}>
                  <BlurView
                    targetId="background"
                    blurType="xlight"
                    blurAmount={15}
                    style={StyleSheet.absoluteFill}
                  />
                  <Text style={styles.blurredButtonText}>Primary</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.blurredButton}>
                  <BlurView
                    targetId="background"
                    blurType="light"
                    blurAmount={20}
                    style={StyleSheet.absoluteFill}
                  />
                  <Text style={styles.blurredButtonText}>Secondary</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.blurredButton}>
                  <BlurView
                    targetId="background"
                    blurType="dark"
                    blurAmount={25}
                    style={StyleSheet.absoluteFill}
                  />
                  <Text style={[styles.blurredButtonText, styles.textLight]}>
                    Dark
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.section}>
              <Text
                style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}
              >
                Liquid Glass Buttons (iOS)
              </Text>
              <View style={styles.blurredButtonsContainer}>
                <TouchableOpacity style={styles.blurredButton}>
                  <BlurView
                    targetId="background"
                    type="liquidGlass"
                    glassTintColor="#FF006E"
                    glassOpacity={0.4}
                    blurAmount={20}
                    style={StyleSheet.absoluteFill}
                  />
                  <Text style={[styles.blurredButtonText, styles.textLight]}>
                    Pink Glass
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.blurredButton}>
                  <BlurView
                    targetId="background"
                    type="liquidGlass"
                    glassTintColor="#8338EC"
                    glassOpacity={0.35}
                    blurAmount={20}
                    style={StyleSheet.absoluteFill}
                  />
                  <Text style={[styles.blurredButtonText, styles.textLight]}>
                    Purple Glass
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.blurredButton}>
                  <BlurView
                    targetId="background"
                    type="liquidGlass"
                    glassTintColor="#3A86FF"
                    glassOpacity={0.4}
                    blurAmount={20}
                    style={StyleSheet.absoluteFill}
                  />
                  <Text style={[styles.blurredButtonText, styles.textLight]}>
                    Blue Glass
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}

        {/* Spacer at bottom */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Header with BlurView - positioned absolutely */}
      <View style={styles.header}>
        <BlurView
          ignoreSafeArea={true}
          targetId="background"
          blurType={blurType}
          blurAmount={blurRadius}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.headerContent}>
          <Text style={[styles.headerTitle, isDark && styles.headerTitleDark]}>
            React Native Blur
          </Text>
          <Text
            style={[styles.headerSubtitle, isDark && styles.headerSubtitleDark]}
          >
            Type: {blurType} | Radius: {blurRadius}
          </Text>
        </View>
      </View>

      {/* Modal with Blur Backdrop */}
      <Modal
        visible={isModalVisible}
        transparent
        statusBarTranslucent
        animationType="fade"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <BlurView
            targetId="background"
            blurType="dark"
            blurAmount={50}
            ignoreSafeArea
            style={styles.modalBackdrop}
          >
            <TouchableOpacity
              style={styles.modalBackdropTouchable}
              activeOpacity={1}
              onPress={() => setIsModalVisible(false)}
            />
          </BlurView>

          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Blurred Modal</Text>
            <Text style={styles.modalText}>
              This modal has a blurred backdrop! The background is being blurred
              using the same TargetView.
            </Text>
            <Text style={styles.modalText}>
              You can see the blurred content behind this modal.
            </Text>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setIsModalVisible(false)}
            >
              <Text style={styles.buttonText}>Close Modal</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    width: '100%',
    height: 120,
    zIndex: 10,
  },
  headerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#202020',
  },
  headerTitleDark: {
    color: '#F1F1F1',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#202020',
    marginTop: 4,
  },
  headerSubtitleDark: {
    color: '#F1F1F1',
  },
  blurTarget: {
    ...StyleSheet.absoluteFillObject,
  },
  backgroundContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#6366f1',
  },
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  contentDark: {
    backgroundColor: 'transparent',
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 140,
    paddingBottom: 60,
    gap: 20,
  },
  imageButton: {
    backgroundColor: '#3a57b7',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButton: {
    backgroundColor: '#059669',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonTextDark: {
    color: '#FFFFFF',
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#202020',
  },
  sectionTitleDark: {
    color: '#F1F1F1',
  },
  radiusControl: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    justifyContent: 'center',
  },
  radiusText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#202020',
    minWidth: 40,
    textAlign: 'center',
  },
  radiusTextDark: {
    color: '#F1F1F1',
  },
  typeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  typeText: {
    fontSize: 16,
    color: '#202020',
  },
  typeTextDark: {
    color: '#F1F1F1',
  },
  radio: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#000000',
    borderRadius: 10,
    backgroundColor: 'transparent',
  },
  radioDark: {
    borderColor: '#FFFFFF',
  },
  radioSelected: {
    borderWidth: 6,
  },
  card: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#00000020',
    borderRadius: 8,
  },
  cardDark: {
    backgroundColor: '#00000020',
    borderColor: '#FFFFFF20',
  },
  cardText: {
    fontSize: 14,
    color: '#202020',
  },
  cardTextDark: {
    color: '#F1F1F1',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalBackdropTouchable: {
    flex: 1,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 32,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#202020',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 16,
    color: '#202020',
    marginBottom: 12,
    lineHeight: 24,
  },
  modalCloseButton: {
    backgroundColor: '#dc2626',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  tabContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: '#FFFFFF40',
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#00000020',
  },
  tabActive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#3a57b7',
    borderWidth: 2,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#202020',
  },
  tabTextActive: {
    color: '#3a57b7',
  },
  description: {
    fontSize: 14,
    color: '#202020',
    opacity: 0.7,
    marginBottom: 8,
  },
  descriptionDark: {
    color: '#F1F1F1',
  },
  blurredCardContainer: {
    height: 100,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
  },
  blurredCardBlur: {
    ...StyleSheet.absoluteFillObject,
  },
  blurredCardContent: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  blurredCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#202020',
    marginBottom: 4,
  },
  blurredCardText: {
    fontSize: 14,
    color: '#202020',
    opacity: 0.8,
  },
  textLight: {
    color: '#F1F1F1',
  },
  bottomSheetDemo: {
    height: 250,
    backgroundColor: '#00000010',
    borderRadius: 12,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  bottomSheetContainer: {
    height: 200,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  bottomSheetBlur: {
    ...StyleSheet.absoluteFillObject,
  },
  bottomSheetContent: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
  },
  bottomSheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#00000040',
    borderRadius: 2,
    marginBottom: 16,
  },
  bottomSheetTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#202020',
    marginBottom: 8,
  },
  bottomSheetText: {
    fontSize: 14,
    color: '#202020',
    opacity: 0.7,
    marginBottom: 16,
  },
  bottomSheetButton: {
    backgroundColor: '#3a57b7',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  notificationContainer: {
    height: 80,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
  },
  notificationBlur: {
    ...StyleSheet.absoluteFillObject,
  },
  notificationContent: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  notificationType: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#202020',
    marginBottom: 4,
  },
  notificationText: {
    fontSize: 14,
    color: '#202020',
    opacity: 0.8,
  },
  panelsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  glassPanel: {
    flex: 1,
    height: 120,
    borderRadius: 12,
    overflow: 'hidden',
  },
  glassPanelContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  glassPanelTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#202020',
    marginBottom: 4,
  },
  glassPanelText: {
    fontSize: 12,
    color: '#202020',
    opacity: 0.7,
  },
  galleryScroll: {
    gap: 12,
    paddingRight: 20,
  },
  galleryItem: {
    width: width * 0.7,
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
  },
  galleryImage: {
    width: '100%',
    height: '100%',
  },
  galleryCaptionContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 50,
  },
  galleryCaption: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  galleryCaptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  featureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  featureItem: {
    width: (width - 64) / 2,
    height: 100,
    borderRadius: 12,
    overflow: 'hidden',
  },
  featureContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  featureIcon: {
    fontSize: 32,
  },
  featureText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#202020',
  },
  blurredButtonsContainer: {
    gap: 12,
  },
  blurredButton: {
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  blurredButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#202020',
  },
  bottomSpacer: {
    height: 40,
  },
});
