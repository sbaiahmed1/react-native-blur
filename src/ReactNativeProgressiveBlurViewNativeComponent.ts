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

export type ProgressiveBlurDirection =
  | 'blurredTopClearBottom'
  | 'blurredBottomClearTop'
  | 'blurredCenterClearTopAndBottom'
  | 'blurredLeftToClearRight'
  | 'blurredRightToClearLeft'
  | 'blurredTopAndBottomClearCenter';

export interface NativeProps extends ViewProps {
  blurAmount?: CodegenTypes.WithDefault<CodegenTypes.Double, 20.0>;
  blurType?: CodegenTypes.WithDefault<BlurType, 'regular'>;
  blurRounds?: CodegenTypes.WithDefault<CodegenTypes.Int32, 5>;
  direction?: CodegenTypes.WithDefault<
    ProgressiveBlurDirection,
    'blurredTopClearBottom'
  >;
  startOffset?: CodegenTypes.WithDefault<CodegenTypes.Double, 0.0>;
  reducedTransparencyFallbackColor?: ColorValue;
  // The blurType material at full strength, filled by the wrapper. A negative radius means unset.
  materialTint?: ColorValue;
  materialSaturation?: CodegenTypes.WithDefault<CodegenTypes.Double, -1>;
  materialRadius?: CodegenTypes.WithDefault<CodegenTypes.Double, -1>;
}

export default codegenNativeComponent<NativeProps>(
  'ReactNativeProgressiveBlurView'
);
