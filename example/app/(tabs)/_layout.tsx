import type { ComponentProps } from 'react';
import { Tabs } from 'expo-router';

import { GlassTabBar } from '@/ui/tab-bar';

export const unstable_settings = {
  initialRouteName: 'blur',
};

type TabBarRender = NonNullable<ComponentProps<typeof Tabs>['tabBar']>;

const renderTabBar: TabBarRender = (props) => <GlassTabBar {...props} />;

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }} tabBar={renderTabBar}>
      <Tabs.Screen name="blur" />
      <Tabs.Screen name="progressive" />
      <Tabs.Screen name="glass" />
      <Tabs.Screen name="benchmark" />
      {/* The root path redirects to /blur. */}
      <Tabs.Screen name="index" options={{ href: null }} />
    </Tabs>
  );
}
