import { AppRegistry, Platform } from 'react-native';
import App from './src/App';
import AppAndroid from './src/App.android';
import { name as appName } from './app.json';

// Check if the app is using Fabric or Paper UI Manager
const uiManager = global?.nativeFabricUIManager ? 'Fabric' : 'Paper';

console.log(`Using ${uiManager}`);
AppRegistry.registerComponent(appName, () =>
  Platform.OS === 'ios' ? App : AppAndroid
);
