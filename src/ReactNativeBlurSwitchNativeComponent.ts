import { codegenNativeComponent } from 'react-native';
import type { CodegenTypes, ViewProps } from 'react-native';

export interface ValueChangeEvent {
  value: boolean;
}

interface NativeProps extends ViewProps {
  value?: CodegenTypes.WithDefault<boolean, false>;
  blurAmount?: CodegenTypes.WithDefault<CodegenTypes.Double, 10.0>;
  blurRounds?: CodegenTypes.WithDefault<CodegenTypes.Int32, 5>;
  thumbColor?: CodegenTypes.WithDefault<string, '#FFFFFF'>;
  trackColorOff?: CodegenTypes.WithDefault<string, '#E5E5EA'>;
  trackColorOn?: CodegenTypes.WithDefault<string, '#34C759'>;
  disabled?: CodegenTypes.WithDefault<boolean, false>;
  onValueChange?: CodegenTypes.DirectEventHandler<Readonly<ValueChangeEvent>>;
}

export default codegenNativeComponent<NativeProps>('ReactNativeBlurSwitch', {
  excludedPlatforms: ['iOS'],
});
