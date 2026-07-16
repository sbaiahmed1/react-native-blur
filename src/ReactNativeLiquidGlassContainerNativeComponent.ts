import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';
import type { ViewProps } from 'react-native';
import type {
  Double,
  WithDefault,
} from 'react-native/Libraries/Types/CodegenTypes';

interface NativeProps extends ViewProps {
  spacing?: WithDefault<Double, 0>;
}

export default codegenNativeComponent<NativeProps>(
  'ReactNativeLiquidGlassContainer',
  { excludedPlatforms: ['android'] }
);
