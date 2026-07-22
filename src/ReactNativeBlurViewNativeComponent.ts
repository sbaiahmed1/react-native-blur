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

export interface NativeProps extends ViewProps {
  blurAmount?: CodegenTypes.WithDefault<CodegenTypes.Double, 10.0>;
  blurType?: CodegenTypes.WithDefault<BlurType, 'xlight'>;
  blurRounds?: CodegenTypes.WithDefault<CodegenTypes.Int32, 5>;
  reducedTransparencyFallbackColor?: CodegenTypes.WithDefault<
    string,
    '#FFFFFF'
  >;
  ignoreSafeArea?: CodegenTypes.WithDefault<boolean, true>;
}

export default codegenNativeComponent<NativeProps>('ReactNativeBlurView');
