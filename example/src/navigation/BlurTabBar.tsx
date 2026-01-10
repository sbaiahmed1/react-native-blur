import { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { BlurView } from '@sbaiahmed1/react-native-blur';
import MoreModal from '../components/MoreModal';

const VISIBLE_SCREENS = ['Home', 'Examples', 'Settings'];
const HIDDEN_SCREENS = ['Vibrancy', 'LiquidGlass', 'Progressive'];

export default function BlurTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const [moreModalVisible, setMoreModalVisible] = useState(false);

  const visibleRoutes = state.routes.filter(route =>
    VISIBLE_SCREENS.includes(route.name)
  );
  const currentRouteName = state?.routes?.[state?.index]?.name || '';
  const isMoreActive = HIDDEN_SCREENS.includes(currentRouteName);

  return (
    <>
      <View style={styles.tabBarContainer}>
        <BlurView blurType="dark" blurAmount={80} style={styles.blurContainer}>
          <View style={styles.tabBar}>
            {visibleRoutes.map(route => {
              const descriptor = descriptors[route.key];
              if (!descriptor) return null;

              const { options } = descriptor;
              const label =
                options.tabBarLabel !== undefined
                  ? options.tabBarLabel
                  : options.title !== undefined
                    ? options.title
                    : route.name;

              const isFocused = currentRouteName === route.name;

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
                      style={[
                        styles.tabText,
                        isFocused && styles.activeTabText,
                      ]}
                    >
                      {typeof label === 'string' ? label : route.name}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}

            <TouchableOpacity
              accessibilityRole="button"
              accessibilityState={isMoreActive ? { selected: true } : {}}
              accessibilityLabel="More screens"
              onPress={() => setMoreModalVisible(true)}
              style={[styles.tab, isMoreActive && styles.activeTab]}
            >
              <View style={[styles.tabContent]}>
                <Text
                  numberOfLines={1}
                  style={[styles.tabText, isMoreActive && styles.activeTabText]}
                >
                  ➕ More
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </BlurView>
      </View>

      <MoreModal
        visible={moreModalVisible}
        onClose={() => setMoreModalVisible(false)}
        onNavigate={screen => {
          navigation.navigate(screen);
          setMoreModalVisible(false);
        }}
      />
    </>
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
    // paddingHorizontal: 12,
  },
  tab: {
    width: '23%',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
    flexWrap: 'wrap',
  },
  activeTab: {
    // width: '25%',
  },
  tabContent: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
    paddingVertical: 8,
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
