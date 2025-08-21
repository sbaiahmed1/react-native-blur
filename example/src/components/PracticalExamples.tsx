import BlurView from '@sbaiahmed1/react-native-blur';
import { View, Text, ImageBackground, Image, StyleSheet } from 'react-native';
import { width } from '../constants';

const PracticalExamples = () => {
  return (
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
            blurType="dark"
            blurAmount={50}
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
            <Text style={styles.modalTitle}>Frosted Glass Modal</Text>
            <Text style={styles.modalText}>
              Blur effects create elegant, modern UI components
            </Text>
            <View style={styles.modalButton}>
              <Text style={styles.modalButtonText}>OK</Text>
            </View>
          </BlurView>
        </View>
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
    flex: 1,
    justifyContent: 'flex-end',
    padding: 15,
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
    paddingVertical: 8,
    paddingHorizontal: 25,
    borderRadius: 20,
  },
  modalButtonText: {
    color: 'white',
    fontWeight: '600',
  },
});

export default PracticalExamples;
