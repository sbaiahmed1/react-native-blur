import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';
import type { ViewProps } from 'react-native';
import type {
  WithDefault,
  Double,
  Int32,
} from 'react-native/Libraries/Types/CodegenTypes';

export type BlurType =
  | 'xlight'
  | 'light'
  | 'dark'
  | 'extraDark'
  | 'regular'
  | 'prominent'
  | 'systemUltraThinMaterial'
  | 'systemThinMaterial'
  | 'systemMaterial'
  | 'systemThickMaterial'
  | 'systemChromeMaterial'
  | 'systemUltraThinMaterialLight'
  | 'systemThinMaterialLight'
  | 'systemMaterialLight'
  | 'systemThickMaterialLight'
  | 'systemChromeMaterialLight'
  | 'systemUltraThinMaterialDark'
  | 'systemThinMaterialDark'
  | 'systemMaterialDark'
  | 'systemThickMaterialDark'
  | 'systemChromeMaterialDark';

interface NativeProps extends ViewProps {
  blurAmount?: WithDefault<Double, 10.0>;
  blurType?: WithDefault<BlurType, 'xlight'>;
  blurRounds?: WithDefault<Int32, 5>;
  reducedTransparencyFallbackColor?: WithDefault<string, '#FFFFFF'>;
  ignoreSafeArea?: WithDefault<boolean, true>;
}

export default codegenNativeComponent<NativeProps>('ReactNativeBlurView');
