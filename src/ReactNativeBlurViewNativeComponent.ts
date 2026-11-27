import { codegenNativeComponent } from 'react-native';
import type { CodegenTypes, ColorValue, ViewProps } from 'react-native';

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
  downsampleFactor?: CodegenTypes.WithDefault<CodegenTypes.Double, 8.0>;
  reducedTransparencyFallbackColor?: ColorValue;
  // The blurType material at full strength, filled by the wrapper. A negative radius means unset.
  materialTint?: ColorValue;
  materialSaturation?: CodegenTypes.WithDefault<CodegenTypes.Double, -1>;
  materialRadius?: CodegenTypes.WithDefault<CodegenTypes.Double, -1>;
  ignoreSafeArea?: CodegenTypes.WithDefault<boolean, true>;
}

export default codegenNativeComponent<NativeProps>('ReactNativeBlurView');
