import { codegenNativeComponent } from 'react-native';
import type { CodegenTypes, ViewProps } from 'react-native';

export interface NativeProps extends ViewProps {
  spacing?: CodegenTypes.WithDefault<CodegenTypes.Double, 0>;
}

export default codegenNativeComponent<NativeProps>(
  'ReactNativeLiquidGlassContainer',
  { excludedPlatforms: ['android'] }
);
