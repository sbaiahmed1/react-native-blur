import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';
import type { ViewProps } from 'react-native';
import type {
  WithDefault,
  Double,
} from 'react-native/Libraries/Types/CodegenTypes';

export type GlassType = 'clear' | 'regular';

export interface NativeProps extends ViewProps {
  glassType?: WithDefault<GlassType, 'clear'>;
  glassTintColor?: WithDefault<string, 'clear'>;
  glassOpacity?: WithDefault<Double, 1.0>;
  reducedTransparencyFallbackColor?: WithDefault<string, '#FFFFFF'>;
  isInteractive?: WithDefault<boolean, true>;
  ignoreSafeArea?: WithDefault<boolean, true>;
}

export default codegenNativeComponent<NativeProps>(
  'ReactNativeLiquidGlassView',
  { excludedPlatforms: ['android'] }
);
