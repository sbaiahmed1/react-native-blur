import { AppRegistry } from 'react-native';
import { name as appName } from './app.json';
import App from './src/App';

// Check if the app is using Fabric or Paper UI Manager
const uiManager = global?.nativeFabricUIManager ? 'Fabric' : 'Paper';

console.log(`Using ${uiManager}`);
AppRegistry.registerComponent(appName, () => App);
