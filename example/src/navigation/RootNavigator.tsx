import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { BlurDemoScreen } from '../screens/BlurDemoScreen';
import { CardsScreen } from '../screens/CardsScreen';
import { GalleryScreen } from '../screens/GalleryScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { LiquidGlassScreen } from '../screens/LiquidGlassScreen';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#6366f1',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{
            title: 'React Native Blur',
          }}
        />
        <Stack.Screen
          name="BlurDemo"
          component={BlurDemoScreen}
          options={{
            title: 'Blur Effects',
          }}
        />
        <Stack.Screen
          name="LiquidGlass"
          component={LiquidGlassScreen}
          options={{
            title: 'Liquid Glass',
          }}
        />
        <Stack.Screen
          name="Cards"
          component={CardsScreen}
          options={{
            title: 'Blurred Cards',
          }}
        />
        <Stack.Screen
          name="Gallery"
          component={GalleryScreen}
          options={{
            title: 'Gallery',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
