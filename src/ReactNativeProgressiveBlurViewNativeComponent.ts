import { codegenNativeComponent } from 'react-native';
import type { CodegenTypes, ViewProps } from 'react-native';

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
  blurAmount?: CodegenTypes.WithDefault<CodegenTypes.Double, 20.0>;
  blurType?: CodegenTypes.WithDefault<BlurType, 'regular'>;
  blurRounds?: CodegenTypes.WithDefault<CodegenTypes.Int32, 5>;
  direction?: CodegenTypes.WithDefault<
    ProgressiveBlurDirection,
    'blurredTopClearBottom'
  >;
  startOffset?: CodegenTypes.WithDefault<CodegenTypes.Double, 0.0>;
  reducedTransparencyFallbackColor?: CodegenTypes.WithDefault<
    string,
    '#FFFFFF'
  >;
}

export default codegenNativeComponent<NativeProps>(
  'ReactNativeProgressiveBlurView'
);
