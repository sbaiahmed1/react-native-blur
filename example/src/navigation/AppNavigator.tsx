import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/HomeScreen';
import ExamplesScreen from '../screens/ExamplesScreen';
import LiquidGlassScreen from '../screens/LiquidGlassScreen';
import ProgressiveBlurScreen from '../screens/ProgressiveBlurScreen';
import VibrancyScreen from '../screens/VibrancyScreen';
import SettingsScreen from '../screens/SettingsScreen';
import BlurTabBar from './BlurTabBar';

const Tab = createBottomTabNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        tabBar={props => <BlurTabBar {...props} />}
        screenOptions={{
          headerShown: false,
        }}
      >
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            tabBarLabel: '🏠 Home',
          }}
        />
        <Tab.Screen
          name="Examples"
          component={ExamplesScreen}
          options={{
            tabBarLabel: '✨ Examples',
          }}
        />
        <Tab.Screen
          name="Vibrancy"
          component={VibrancyScreen}
          options={{
            tabBarLabel: '✨ Vibrancy',
          }}
        />
        <Tab.Screen
          name="LiquidGlass"
          component={LiquidGlassScreen}
          options={{
            tabBarLabel: '🌊 Liquid',
          }}
        />
        <Tab.Screen
          name="Progressive"
          component={ProgressiveBlurScreen}
          options={{
            tabBarLabel: '🎨 Progressive',
          }}
        />
        <Tab.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            tabBarLabel: '⚙️ Settings',
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
