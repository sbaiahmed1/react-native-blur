import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';
import type { ViewProps } from 'react-native';
import type {
  WithDefault,
  Double,
  DirectEventHandler,
  Int32,
} from 'react-native/Libraries/Types/CodegenTypes';

export interface ValueChangeEvent {
  value: boolean;
}

interface NativeProps extends ViewProps {
  value?: WithDefault<boolean, false>;
  blurAmount?: WithDefault<Double, 10.0>;
  blurRounds?: WithDefault<Int32, 5>;
  thumbColor?: WithDefault<string, '#FFFFFF'>;
  trackColorOff?: WithDefault<string, '#E5E5EA'>;
  trackColorOn?: WithDefault<string, '#34C759'>;
  disabled?: WithDefault<boolean, false>;
  onValueChange?: DirectEventHandler<Readonly<ValueChangeEvent>>;
}

export default codegenNativeComponent<NativeProps>('ReactNativeBlurSwitch', {
  excludedPlatforms: ['iOS'],
});
