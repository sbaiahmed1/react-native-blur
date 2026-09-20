import { codegenNativeComponent } from 'react-native';
import type { CodegenTypes, ColorValue, ViewProps } from 'react-native';

export type GlassType = 'clear' | 'regular';

export interface NativeProps extends ViewProps {
  glassType?: CodegenTypes.WithDefault<GlassType, 'clear'>;
  glassTintColor?: ColorValue;
  glassOpacity?: CodegenTypes.WithDefault<CodegenTypes.Double, 1.0>;
  reducedTransparencyFallbackColor?: ColorValue;
  isInteractive?: CodegenTypes.WithDefault<boolean, true>;
  ignoreSafeArea?: CodegenTypes.WithDefault<boolean, true>;
}

export default codegenNativeComponent<NativeProps>(
  'ReactNativeLiquidGlassView'
);
