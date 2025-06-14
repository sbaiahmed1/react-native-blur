import { AppRegistry, Platform } from 'react-native';
import App from './src/App';
import AppAndroid from './src/App.android';
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () =>
  Platform.OS === 'ios' ? App : AppAndroid
);
