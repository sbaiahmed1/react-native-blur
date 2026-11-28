import { TurboModuleRegistry, type TurboModule } from 'react-native';

export interface Spec extends TurboModule {
  getConstants(): { isLiquidGlassAvailable: boolean };
}

// Null on Android and web, where the library has no native module.
export default TurboModuleRegistry.get<Spec>('ReactNativeBlur');
