import { useState, type ReactNode } from 'react';
import {
  Text,
  StyleSheet,
  ImageBackground,
  Modal,
  Platform,
  ScrollView,
  Pressable,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { FullWindowOverlay } from 'react-native-screens';
import { BlurView } from '@sbaiahmed1/react-native-blur';
import { DEMO_IMAGES } from '@/constants/blur';

// FullWindowOverlay is iOS-only (react-native-screens renders an unstyled View
// elsewhere), so other platforms get the same full-window layer from a
// transparent Modal covering the system bars.
function ModalOverlay({
  children,
  onRequestClose,
}: {
  children: ReactNode;
  onRequestClose: () => void;
}) {
  if (Platform.OS === 'ios') {
    return <FullWindowOverlay>{children}</FullWindowOverlay>;
  }
  return (
    <Modal
      visible
      transparent
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={onRequestClose}
    >
      {children}
    </Modal>
  );
}

export default function HomeScreen() {
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

  return (
    <ImageBackground
      source={{ uri: DEMO_IMAGES[0] }}
      style={styles.background}
      resizeMode="cover"
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.header}>Welcome to React Native Blur</Text>

        <BlurView
          overlayColor={'#22ffff20'}
          blurType="regular"
          blurAmount={50}
          style={styles.card}
        >
          <Text style={styles.cardTitle}>🎨 Beautiful Blur Effects</Text>
          <Text style={styles.cardText}>
            Experience stunning blur effects powered by QmBlurView library.
            High-performance native blur with automatic memory management.
          </Text>
        </BlurView>

        <BlurView blurType="dark" blurAmount={60} style={styles.card}>
          <Text style={styles.cardTitle}>⚡ Native Performance</Text>
          <Text style={styles.cardText}>
            Uses native blur algorithms with underlying JNI calls for optimal
            performance. Works seamlessly on both iOS and Android.
          </Text>
        </BlurView>

        <BlurView blurType="prominent" blurAmount={70} style={styles.card}>
          <Text style={styles.cardTitle}>🚀 Easy to Use</Text>
          <Text style={styles.cardText}>
            Simple API with no complex setup required. Just import and use!
          </Text>
        </BlurView>

        <BlurView blurType="prominent" blurAmount={70} style={styles.card}>
          <Text style={styles.cardTitle}>🚀 Can be used in a modal</Text>
          <Pressable
            style={styles.cardButton}
            onPress={() => setIsModalVisible(true)}
          >
            <Text style={styles.cardText}>
              Simple API with no complex setup required. Just import and use!
            </Text>
          </Pressable>
        </BlurView>
      </ScrollView>

      {isModalVisible && (
        <ModalOverlay onRequestClose={() => setIsModalVisible(false)}>
          <TouchableWithoutFeedback onPress={() => setIsModalVisible(false)}>
            <BlurView
              ignoreSafeArea
              blurType={'dark'}
              style={StyleSheet.absoluteFill}
            />
          </TouchableWithoutFeedback>

          <View style={styles.modalContent} pointerEvents="none">
            <View style={styles.modalCard}>
              <Text>Hello this is a centred text in a modal</Text>
            </View>
          </View>
        </ModalOverlay>
      )}
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
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 40,
    marginBottom: 30,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
  card: {
    padding: 20,
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  cardText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 24,
  },
  cardButton: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  modalContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCard: {
    backgroundColor: 'white',
    padding: 50,
    borderRadius: 10,
  },
});
