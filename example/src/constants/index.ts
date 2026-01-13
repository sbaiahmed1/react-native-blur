import { Dimensions } from 'react-native';
import { type BlurType } from '@sbaiahmed1/react-native-blur';

export const { width } = Dimensions.get('window');

export const BLUR_TYPES: BlurType[] = [
  'light',
  'dark',
  'xlight',
  'extraDark',
  'regular',
  'prominent',
  'systemUltraThinMaterial',
  'systemThinMaterial',
  'systemMaterial',
  'systemThickMaterial',
  'systemChromeMaterial',
  'systemUltraThinMaterialLight',
  'systemThinMaterialLight',
  'systemMaterialLight',
  'systemThickMaterialLight',
  'systemChromeMaterialLight',
  'systemUltraThinMaterialDark',
  'systemThinMaterialDark',
  'systemMaterialDark',
  'systemThickMaterialDark',
  'systemChromeMaterialDark',
];

export const DEMO_IMAGES = [
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80',
  'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?ixlib=rb-4.0.3&auto=format&fit=crop&w=1788&q=80',
  'https://images.unsplash.com/photo-1560703650-ef3e0f254ae0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1770&q=80',
];

export const glassColors = [
  { name: 'Blue', color: '#007AFF', emoji: '💙' },
  { name: 'Purple', color: '#AF52DE', emoji: '💜' },
  { name: 'Green', color: '#34C759', emoji: '💚' },
  { name: 'Orange', color: '#FF9500', emoji: '🧡' },
  { name: 'Red', color: '#FF3B30', emoji: '❤️' },
  { name: 'Pink', color: '#FF2D92', emoji: '💗' },
  { name: 'Teal', color: '#5AC8FA', emoji: '💎' },
  { name: 'Clear', color: 'clear', emoji: '🔮' },
];

export const BLUR_VIEW_SWITCHES = glassColors
  .filter(item => item.color !== 'clear')
  .map((item, index) => ({
    id: index + 1,
    label: item.name,
    color: item.color,
    blurAmount: 15 + index * 2,
    disabled: index === 0 || index === 1,
  }));
