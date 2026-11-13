import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from '@sbaiahmed1/react-native-blur';

import { FIELDS, FIELD_LABELS, Field, useField } from './field';
import {
  SHEET_GAP as GAP,
  SHEET_INSET as INSET,
  SHEET_PADDING as PADDING,
  sheetLayout,
} from './sheet-layout';
import { useTheme } from './theme';

/** A blurred bottom sheet that picks the backdrop, live behind it. */
export function FieldSheet({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { field, setField } = useField();
  const { sheetWidth, left, tileWidth, tileHeight } = sheetLayout(width);
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={onClose}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Close"
        style={styles.fill}
        onPress={onClose}
      />
      <BlurView
        blurType={t.dark ? 'systemMaterialDark' : 'systemMaterialLight'}
        blurAmount={100}
        reducedTransparencyFallbackColor={t.colors.surface}
        style={[
          styles.sheet,
          { left, width: sheetWidth, paddingBottom: insets.bottom + PADDING },
        ]}
      >
        <View style={styles.header}>
          <Text
            style={[t.font.title, { color: t.colors.text }]}
            accessibilityRole="header"
          >
            Backdrop
          </Text>
          <Pressable accessibilityRole="button" onPress={onClose} hitSlop={12}>
            <Text style={[t.font.headline, { color: t.colors.accent }]}>
              Done
            </Text>
          </Pressable>
        </View>
        <Text style={[t.font.footnote, { color: t.colors.text }]}>
          Drawn behind every screen, so each effect sits over sharp color.
        </Text>
        <View style={styles.tiles}>
          {FIELDS.map((name) => {
            const selected = name === field;
            return (
              <Pressable
                key={name}
                accessibilityRole="button"
                accessibilityLabel={`${FIELD_LABELS[name]} backdrop`}
                accessibilityState={{ selected }}
                onPress={() => setField(name)}
                style={styles.tile}
              >
                <View
                  accessibilityElementsHidden
                  importantForAccessibility="no-hide-descendants"
                  style={[
                    styles.preview,
                    selected && styles.picked,
                    {
                      width: tileWidth,
                      height: tileHeight,
                      backgroundColor: t.colors.bg,
                      borderColor: selected ? t.colors.accent : t.colors.border,
                    },
                  ]}
                >
                  <Field name={name} width={tileWidth} height={tileHeight} />
                </View>
                <Text
                  style={[
                    t.font.footnote,
                    selected && styles.bold,
                    { color: selected ? t.colors.accent : t.colors.text },
                  ]}
                >
                  {FIELD_LABELS[name]}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </BlurView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fill: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 },
  sheet: {
    position: 'absolute',
    bottom: INSET,
    borderRadius: 36,
    padding: PADDING,
    gap: 12,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tiles: { flexDirection: 'row', gap: GAP, marginTop: 4 },
  tile: { alignItems: 'center', gap: 8 },
  preview: {
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  picked: { borderWidth: 3 },
  bold: { fontWeight: '600' },
});
