import type { ViewProps } from 'react-native';
import type {
  Double,
  WithDefault,
} from 'react-native/Libraries/Types/CodegenTypes';
import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';

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

export type GlassType = 'clear' | 'regular';

interface NativeProps extends ViewProps {
  glassTintColor?: WithDefault<string, 'clear'>;
  glassOpacity?: WithDefault<Double, 1.0>;
  blurAmount?: WithDefault<Double, 10.0>;
  type?: WithDefault<'blur' | 'liquidGlass', 'blur'>;
  blurType?: WithDefault<BlurType, 'xlight'>;
  glassType?: WithDefault<GlassType, 'clear'>;
  reducedTransparencyFallbackColor?: WithDefault<string, '#FFFFFF'>;
  isInteractive?: WithDefault<boolean, true>;
  ignoreSafeArea?: WithDefault<boolean, false>;
  targetId?: string;
}

export default codegenNativeComponent<NativeProps>('ReactNativeBlurView');
