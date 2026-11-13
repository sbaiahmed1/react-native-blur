import type { ComponentProps } from 'react';
import { Tabs } from 'expo-router';

import { GlassTabBar } from '@/ui/tab-bar';

export const unstable_settings = {
  initialRouteName: 'blur',
};

const HIDDEN = ['index', 'examples', 'settings', 'more'] as const;

type TabBarRender = NonNullable<ComponentProps<typeof Tabs>['tabBar']>;

const renderTabBar: TabBarRender = (props) => <GlassTabBar {...props} />;

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }} tabBar={renderTabBar}>
      <Tabs.Screen name="blur" />
      <Tabs.Screen name="progressive" />
      <Tabs.Screen name="glass" />
      <Tabs.Screen name="benchmark" />
      {HIDDEN.map((name) => (
        <Tabs.Screen key={name} name={name} options={{ href: null }} />
      ))}
    </Tabs>
  );
}
