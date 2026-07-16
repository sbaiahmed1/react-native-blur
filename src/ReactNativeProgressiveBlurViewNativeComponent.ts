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

export type ProgressiveBlurDirection =
  | 'blurredTopClearBottom'
  | 'blurredBottomClearTop'
  | 'blurredCenterClearTopAndBottom';

export interface NativeProps extends ViewProps {
  blurAmount?: WithDefault<Double, 20.0>;
  blurType?: WithDefault<BlurType, 'regular'>;
  blurRounds?: WithDefault<Int32, 5>;
  direction?: WithDefault<ProgressiveBlurDirection, 'blurredTopClearBottom'>;
  startOffset?: WithDefault<Double, 0.0>;
  reducedTransparencyFallbackColor?: WithDefault<string, '#FFFFFF'>;
}

export default codegenNativeComponent<NativeProps>(
  'ReactNativeProgressiveBlurView'
);
