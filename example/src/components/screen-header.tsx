import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { BlurView } from '@sbaiahmed1/react-native-blur';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
}

export default function ScreenHeader({ title, subtitle }: ScreenHeaderProps) {
  const router = useRouter();

  return (
    <View style={styles.container} pointerEvents="box-none">
      <BlurView
        blurType="dark"
        blurAmount={40}
        style={styles.blur}
        ignoreSafeArea
      >
        <View style={styles.content}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.backArrow}>‹</Text>
            <Text style={styles.backLabel}>Back</Text>
          </TouchableOpacity>

          <View style={styles.titleContainer}>
            <Text style={styles.title} numberOfLines={1}>
              {title}
            </Text>
            {subtitle ? (
              <Text style={styles.subtitle} numberOfLines={1}>
                {subtitle}
              </Text>
            ) : null}
          </View>

          {/* Spacer to balance the back button */}
          <View style={styles.rightSpacer} />
        </View>
      </BlurView>
    </View>
  );
}

const HEADER_HEIGHT = Platform.OS === 'ios' ? 100 : 80;
const TOP_INSET = Platform.OS === 'ios' ? 54 : 32;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  blur: {
    height: HEADER_HEIGHT,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255, 255, 255, 0.15)',
  },
  content: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: HEADER_HEIGHT - TOP_INSET,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 70,
  },
  backArrow: {
    fontSize: 34,
    color: '#FFFFFF',
    lineHeight: 36,
    marginTop: -2,
  },
  backLabel: {
    fontSize: 17,
    color: '#FFFFFF',
    fontWeight: '400',
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 2,
  },
  rightSpacer: {
    minWidth: 70,
  },
});
