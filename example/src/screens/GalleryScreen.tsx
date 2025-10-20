import { BlurView, TargetView } from '@sbaiahmed1/react-native-blur';
import React from 'react';
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { DEMO_IMAGES } from '../constants';

const { width } = Dimensions.get('window');

export function GalleryScreen() {
  const [imageIndex] = React.useState(0);

  return (
    <View style={styles.container}>
      <TargetView id="background" style={styles.blurTarget}>
        <Image
          source={{ uri: DEMO_IMAGES[imageIndex] }}
          style={styles.backgroundImage}
          resizeMode="cover"
        />
      </TargetView>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
      >
        <Text style={styles.sectionTitle}>Horizontal Gallery</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalScroll}
        >
          {DEMO_IMAGES.map((img, index) => (
            <View key={index} style={styles.galleryItem}>
              <Image source={{ uri: img }} style={styles.galleryImage} />
              <View style={styles.captionContainer}>
                <BlurView
                  targetId="background"
                  blurType="dark"
                  blurAmount={25}
                  style={StyleSheet.absoluteFill}
                />
                <Text style={styles.captionText}>Image {index + 1}</Text>
              </View>
            </View>
          ))}
        </ScrollView>

        <Text style={styles.sectionTitle}>Grid Layout</Text>
        <View style={styles.grid}>
          {['Camera', 'Photos', 'Videos', 'Files', 'Music', 'Maps'].map(
            (item, index) => (
              <View key={item} style={styles.gridItem}>
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
                <View style={styles.gridContent}>
                  <Text
                    style={[
                      styles.gridIcon,
                      index % 3 === 1 && styles.textLight,
                    ]}
                  >
                    {['📷', '🖼️', '🎥', '📁', '🎵', '🗺️'][index]}
                  </Text>
                  <Text
                    style={[
                      styles.gridText,
                      index % 3 === 1 && styles.textLight,
                    ]}
                  >
                    {item}
                  </Text>
                </View>
              </View>
            )
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  blurTarget: {
    ...StyleSheet.absoluteFillObject,
  },
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    gap: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#F1F1F1',
  },
  horizontalScroll: {
    gap: 12,
    paddingRight: 20,
  },
  galleryItem: {
    width: width * 0.7,
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
  },
  galleryImage: {
    width: '100%',
    height: '100%',
  },
  captionContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 50,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  captionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F1F1F1',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  gridItem: {
    width: (width - 52) / 2,
    height: 120,
    borderRadius: 16,
    overflow: 'hidden',
  },
  gridContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  gridIcon: {
    fontSize: 36,
  },
  gridText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#202020',
  },
  textLight: {
    color: '#F1F1F1',
  },
});
