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
  blurType?: WithDefault<BlurType, 'light'>;
  blurAmount?: WithDefault<Double, 10>;
  reducedTransparencyFallbackColor?: string;
}

export default codegenNativeComponent<NativeProps>('ReactNativeBlurView');
