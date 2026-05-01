import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';
import type { ViewProps } from 'react-native';
import type { Double } from 'react-native/Libraries/Types/CodegenTypes';

interface NativeProps extends ViewProps {
  spacing?: Double;
}

export default codegenNativeComponent<NativeProps>(
  'ReactNativeLiquidGlassContainer',
  { excludedPlatforms: ['android'] }
);
