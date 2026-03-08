import { Tabs } from 'expo-router';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarIcon: () => null,
        tabBarIconStyle: { display: 'none' },
        tabBarLabelStyle: { paddingVertical: 12 },
      }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="examples" />
      <Tabs.Screen name="settings" />
      <Tabs.Screen name="more" />
    </Tabs>
  );
}
