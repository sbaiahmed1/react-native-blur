import { useState, type ReactNode } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { FullWindowOverlay } from 'react-native-screens';
import { BlurView } from '@sbaiahmed1/react-native-blur';

import { MaterialCard, Section } from '@/ui/screen';
import { useTheme } from '@/ui/theme';

function Overlay({
  children,
  onClose,
}: {
  children: ReactNode;
  onClose: () => void;
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
      animationType="fade"
      onRequestClose={onClose}
    >
      {children}
    </Modal>
  );
}

/** A dialog over a full screen blur, opened from the page like a real confirmation. */
export function ModalSection() {
  const t = useTheme();
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  return (
    <Section title="Dialog over blur">
      <MaterialCard>
        <Text style={[t.font.label, { color: t.colors.text }]}>
          A full screen BlurView behind a dialog keeps the page in view while it
          asks for attention.
        </Text>
        <Pressable
          accessibilityRole="button"
          onPress={() => setOpen(true)}
          style={[styles.button, { backgroundColor: t.colors.text }]}
        >
          <Text style={[t.font.headline, { color: t.colors.bg }]}>
            Show dialog
          </Text>
        </Pressable>
      </MaterialCard>
      {open ? (
        <Overlay onClose={close}>
          <BlurView
            blurType={t.dark ? 'systemMaterialDark' : 'systemMaterialLight'}
            blurAmount={30}
            reducedTransparencyFallbackColor={t.colors.grouped}
            style={styles.fill}
          >
            <Pressable
              accessibilityLabel="Close the dialog"
              style={styles.fill}
              onPress={close}
            />
            <View
              style={[styles.dialog, { backgroundColor: t.colors.surface }]}
              accessibilityViewIsModal
            >
              <Text style={[t.font.title, { color: t.colors.text }]}>
                Delete photo?
              </Text>
              <Text style={[t.font.label, { color: t.colors.textMuted }]}>
                This photo is removed from all your devices. You can restore it
                from Recently Deleted for 30 days.
              </Text>
              <View style={styles.actions}>
                <Pressable
                  accessibilityRole="button"
                  onPress={close}
                  style={[styles.action, { backgroundColor: t.colors.chip }]}
                >
                  <Text style={[t.font.headline, { color: t.colors.text }]}>
                    Cancel
                  </Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  onPress={close}
                  style={[styles.action, styles.destructive]}
                >
                  <Text style={[t.font.headline, styles.destructiveText]}>
                    Delete
                  </Text>
                </Pressable>
              </View>
            </View>
          </BlurView>
        </Overlay>
      ) : null}
    </Section>
  );
}

const styles = StyleSheet.create({
  fill: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 },
  button: {
    minHeight: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dialog: {
    position: 'absolute',
    left: 24,
    right: 24,
    top: '32%',
    borderRadius: 24,
    padding: 20,
    gap: 12,
  },
  actions: { flexDirection: 'row', gap: 12, marginTop: 8 },
  action: {
    flex: 1,
    minHeight: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  destructive: { backgroundColor: '#FF3B30' },
  destructiveText: { color: '#FFFFFF' },
});
