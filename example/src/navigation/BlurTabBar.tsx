import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { BlurView } from '@sbaiahmed1/react-native-blur';

export default function BlurTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  return (
    <View style={styles.tabBarContainer}>
      <BlurView blurType="dark" blurAmount={80} style={styles.blurContainer}>
        <View style={styles.tabBar}>
          {state.routes.map((route, index) => {
            const descriptor = descriptors[route.key];
            if (!descriptor) return null;

            const { options } = descriptor;
            const label =
              options.tabBarLabel !== undefined
                ? options.tabBarLabel
                : options.title !== undefined
                  ? options.title
                  : route.name;

            const isFocused = state.index === index;

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            const onLongPress = () => {
              navigation.emit({
                type: 'tabLongPress',
                target: route.key,
              });
            };

            return (
              <TouchableOpacity
                key={route.key}
                accessibilityRole="button"
                accessibilityState={isFocused ? { selected: true } : {}}
                accessibilityLabel={options.tabBarAccessibilityLabel}
                onPress={onPress}
                onLongPress={onLongPress}
                style={[styles.tab, isFocused && styles.activeTab]}
              >
                <View style={[styles.tabContent]}>
                  <Text
                    numberOfLines={1}
                    style={[styles.tabText, isFocused && styles.activeTabText]}
                  >
                    {typeof label === 'string' ? label : route.name}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    borderRadius: 24,
    overflow: 'hidden',
  },
  blurContainer: {
    overflow: 'hidden',
    height: 60,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  tabBar: {
    flexDirection: 'row',
    height: 60,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  tab: {
    width: '15%',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
    flexWrap: 'wrap',
  },
  activeTab: {
    width: '30%',
  },
  tabContent: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.6)',
  },
  activeTabText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
