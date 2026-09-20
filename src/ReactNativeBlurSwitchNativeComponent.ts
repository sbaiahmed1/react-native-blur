import { codegenNativeComponent } from 'react-native';
import type { CodegenTypes, ColorValue, ViewProps } from 'react-native';

export interface ValueChangeEvent {
  value: boolean;
}

interface NativeProps extends ViewProps {
  value?: CodegenTypes.WithDefault<boolean, false>;
  blurAmount?: CodegenTypes.WithDefault<CodegenTypes.Double, 10.0>;
  blurRounds?: CodegenTypes.WithDefault<CodegenTypes.Int32, 5>;
  thumbColor?: ColorValue;
  trackColorOff?: ColorValue;
  trackColorOn?: ColorValue;
  disabled?: CodegenTypes.WithDefault<boolean, false>;
  onValueChange?: CodegenTypes.DirectEventHandler<Readonly<ValueChangeEvent>>;
}

export default codegenNativeComponent<NativeProps>('ReactNativeBlurSwitch', {
  excludedPlatforms: ['iOS'],
});
