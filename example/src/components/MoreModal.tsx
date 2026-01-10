import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Pressable,
  StyleSheet,
} from 'react-native';
import { BlurView } from '@sbaiahmed1/react-native-blur';

interface MoreModalProps {
  visible: boolean;
  onClose: () => void;
  onNavigate: (screenName: string) => void;
}

const MoreModal: React.FC<MoreModalProps> = ({
  visible,
  onClose,
  onNavigate,
}) => {
  const moreScreens = [
    { name: 'Vibrancy', label: '✨ Vibrancy' },
    { name: 'LiquidGlass', label: '🌊 Liquid' },
    { name: 'Progressive', label: '🎨 Progressive' },
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable>
          <BlurView
            blurType="dark"
            blurAmount={80}
            style={styles.bottomSheet}
            ignoreSafeArea
          >
            <View style={styles.header}>
              <View style={styles.dragIndicator} />
              <Text style={styles.title}>More Screens</Text>
            </View>

            <View style={styles.menuContainer}>
              {moreScreens.map(screen => (
                <TouchableOpacity
                  key={screen.name}
                  style={styles.menuItem}
                  onPress={() => onNavigate(screen.name)}
                  accessibilityRole="button"
                  accessibilityLabel={`Navigate to ${screen.label}`}
                >
                  <Text style={styles.menuItemText}>{screen.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Close menu"
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </BlurView>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    paddingBottom: 40,
    overflow: 'hidden',
  },
  header: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  dragIndicator: {
    width: 40,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  menuContainer: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  menuItem: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    marginBottom: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  closeButton: {
    marginHorizontal: 20,
    marginTop: 12,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
});

export default MoreModal;
