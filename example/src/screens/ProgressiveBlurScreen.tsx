import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  ScrollView,
} from 'react-native';
import { ProgressiveBlurView } from '@sbaiahmed1/react-native-blur';
import { DEMO_IMAGES } from '../constants';

/**
 * Demonstrates various ProgressiveBlurView configurations over a full-screen background image.
 *
 * Includes a blurred header overlay, top-to-bottom and bottom-to-top gradients, samples of different blur intensities and start offsets, practical header/footer overlays, and a locked-content example with an unlock prompt.
 *
 * @returns The React element for the Progressive Blur demo screen.
 */
export default function ProgressiveBlurScreen() {
  return (
    <ImageBackground
      source={{ uri: DEMO_IMAGES[2] }}
      style={styles.background}
      resizeMode="cover"
    >
      {/* Header with Progressive Blur */}
      <View style={styles.headerContainer}>
        <ProgressiveBlurView
          blurType="light"
          blurAmount={40}
          direction="blurredTopClearBottom"
          startOffset={0.3}
          style={styles.headerBlur}
        >
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Progressive Blur</Text>
            <Text style={styles.headerSubtitle}>
              Smooth gradient blur transitions
            </Text>
          </View>
        </ProgressiveBlurView>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionTitle}>Top to Bottom Blur</Text>
        <View style={styles.exampleContainer}>
          <ProgressiveBlurView
            blurType="light"
            blurAmount={30}
            direction="blurredTopClearBottom"
            startOffset={0}
            style={styles.progressiveBlurCard}
          >
            <Text style={styles.cardText}>Blurred at top</Text>
            <Text style={styles.cardText}>Clear at bottom</Text>
          </ProgressiveBlurView>
        </View>

        <Text style={styles.sectionTitle}>Bottom to Top Blur</Text>
        <View style={styles.exampleContainer}>
          <ProgressiveBlurView
            blurType="dark"
            blurAmount={30}
            direction="blurredBottomClearTop"
            startOffset={0}
            style={styles.progressiveBlurCard}
          >
            <Text style={styles.cardTextLight}>Clear at top</Text>
            <Text style={styles.cardTextLight}>Blurred at bottom</Text>
          </ProgressiveBlurView>
        </View>

        <Text style={styles.sectionTitle}>Blur Intensities</Text>
        {[20, 30, 40, 50].map(amount => (
          <View key={amount} style={styles.exampleContainer}>
            <ProgressiveBlurView
              blurType="regular"
              blurAmount={amount}
              direction="blurredTopClearBottom"
              startOffset={0.1}
              style={styles.intensityCard}
            >
              <Text style={styles.intensityText}>Blur Amount: {amount}px</Text>
              <Text style={styles.intensitySubtext}>
                Top to bottom gradient
              </Text>
            </ProgressiveBlurView>
          </View>
        ))}

        <Text style={styles.sectionTitle}>Start Offset Examples</Text>
        <Text style={styles.description}>
          Start offset controls where the blur decay begins (0.0 - 1.0)
        </Text>

        {[0, 0.2, 0.4, 0.6].map(offset => (
          <View key={offset} style={styles.exampleContainer}>
            <ProgressiveBlurView
              blurType="prominent"
              blurAmount={35}
              direction="blurredTopClearBottom"
              startOffset={offset}
              style={styles.offsetCard}
            >
              <Text style={styles.offsetText}>Start Offset: {offset}</Text>
              <Text style={styles.offsetSubtext}>
                {offset === 0
                  ? 'Blur across entire view'
                  : `Clear until ${offset * 100}%, then blur`}
              </Text>
            </ProgressiveBlurView>
          </View>
        ))}

        <Text style={styles.sectionTitle}>Practical Use Cases</Text>

        <View style={styles.exampleContainer}>
          <ProgressiveBlurView
            blurType="light"
            blurAmount={40}
            direction="blurredTopClearBottom"
            startOffset={0.3}
            style={styles.practicalCard}
          >
            <Text style={styles.practicalTitle}>Header Overlay</Text>
            <Text style={styles.practicalDescription}>
              Perfect for navigation headers that need to blur content behind
              them while keeping the bottom visible
            </Text>
          </ProgressiveBlurView>
        </View>

        <View style={styles.exampleContainer}>
          <ProgressiveBlurView
            blurType="dark"
            blurAmount={35}
            direction="blurredBottomClearTop"
            startOffset={0.2}
            style={styles.practicalCard}
          >
            <Text style={[styles.practicalTitle, styles.lightText]}>
              Footer Overlay
            </Text>
            <Text style={[styles.practicalDescription, styles.lightText]}>
              Ideal for bottom sheets and tab bars that fade content above
            </Text>
          </ProgressiveBlurView>
        </View>

        <Text style={styles.sectionTitle}>Locked Content Example</Text>
        <Text style={styles.description}>
          "Purchase to unlock" - blur hides content
        </Text>

        <View style={styles.lockedContentContainer}>
          <View style={styles.textContentContainer}>
            <Text style={styles.lockedText}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
              enim ad minim veniam, quis nostrud exercitation ullamco laboris
              nisi ut aliquip ex ea commodo consequat.{'\n\n'}
              Duis aute irure dolor in reprehenderit in voluptate velit esse
              cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat
              cupidatat non proident, sunt in culpa qui officia deserunt mollit
              anim id est laborum.{'\n\n'}
              Sed ut perspiciatis unde omnis iste natus error sit voluptatem
              accusantium doloremque laudantium, totam rem aperiam, eaque ipsa
              quae ab illo inventore veritatis et quasi architecto beatae vitae
              dicta sunt explicabo.{'\n\n'}
              Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit
              aut fugit, sed quia consequuntur magni dolores eos qui ratione
              voluptatem sequi nesciunt.
            </Text>
          </View>

          {/* Progressive blur overlay from bottom */}
          <ProgressiveBlurView
            blurType="prominent"
            blurAmount={20}
            direction="blurredBottomClearTop"
            startOffset={0.6}
            style={styles.lockedOverlay}
          >
            <View style={styles.unlockPrompt}>
              <Text style={styles.unlockIcon}>🔒</Text>
              <Text style={styles.unlockText}>Unlock to Read More</Text>
              <View style={styles.unlockButton}>
                <Text style={styles.unlockButtonText}>Purchase</Text>
              </View>
            </View>
          </ProgressiveBlurView>
        </View>
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  unsupportedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
  unsupportedText: {
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'center',
    padding: 20,
  },
  headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  headerBlur: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#333333',
    opacity: 0.9,
  },
  scrollContent: {
    paddingTop: 180,
    padding: 20,
    paddingBottom: 120,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 24,
    marginBottom: 12,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  description: {
    fontSize: 14,
    color: '#FFFFFF',
    marginBottom: 16,
    opacity: 0.8,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  exampleContainer: {
    marginBottom: 16,
  },
  progressiveBlurCard: {
    height: 200,
    borderRadius: 16,
    justifyContent: 'space-between',
    padding: 20,
  },
  intensityCard: {
    height: 150,
    borderRadius: 16,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  offsetCard: {
    height: 180,
    borderRadius: 16,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  practicalCard: {
    minHeight: 140,
    borderRadius: 16,
    overflow: 'hidden',
    padding: 24,
    justifyContent: 'center',
  },
  cardText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  cardTextLight: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  intensityText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  intensitySubtext: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  offsetText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  offsetSubtext: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  practicalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 12,
  },
  practicalDescription: {
    fontSize: 14,
    color: '#333333',
    lineHeight: 20,
  },
  lightText: {
    color: '#FFFFFF',
  },
  lockedContentContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
    height: 400,
    position: 'relative',
  },
  textContentContainer: {
    padding: 24,
  },
  lockedText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#000000',
  },
  lockedOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    top: 0,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 40,
  },
  unlockPrompt: {
    alignItems: 'center',
  },
  unlockIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  unlockText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 16,
  },
  unlockButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  unlockButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});