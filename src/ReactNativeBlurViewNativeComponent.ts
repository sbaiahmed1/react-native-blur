import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';
import type { ViewProps } from 'react-native';
import type {
  WithDefault,
  Double,
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
  | 'systemChromeMaterial';

interface NativeProps extends ViewProps {
  blurAmount?: WithDefault<Double, 10.0>;
  blurType?: WithDefault<BlurType, 'xlight'>;
  reducedTransparencyFallbackColor?: WithDefault<string, '#FFFFFF'>;
  ignoreSafeArea?: WithDefault<boolean, false>;
}

export default codegenNativeComponent<NativeProps>('ReactNativeBlurView');
