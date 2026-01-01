import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';
import type { ViewProps } from 'react-native';
import type {
  WithDefault,
  Double,
  DirectEventHandler,
} from 'react-native/Libraries/Types/CodegenTypes';

export interface ValueChangeEvent {
  value: boolean;
}

interface NativeProps extends ViewProps {
  /**
   * The current value of the switch
   * @default false
   */
  value?: WithDefault<boolean, false>;

  /**
   * The intensity of the blur effect (0-100)
   * @default 10.0
   */
  blurAmount?: WithDefault<Double, 10.0>;

  /**
   * The color of the switch thumb
   * Note: Not supported by the Android implementation (no-op).
   * Use the native iOS Switch for platform-specific thumb colors.
   * @default '#FFFFFF'
   */
  thumbColor?: WithDefault<string, '#FFFFFF'>;

  /**
   * The track color when switch is off
   * Note: Not supported by the Android implementation (no-op).
   * Use the native iOS Switch for platform-specific off-state colors.
   * @default '#E5E5EA'
   */
  trackColorOff?: WithDefault<string, '#E5E5EA'>;

  /**
   * The track color when switch is on
   * @default '#34C759'
   */
  trackColorOn?: WithDefault<string, '#34C759'>;

  /**
   * Whether the switch is disabled
   * @default false
   */
  disabled?: WithDefault<boolean, false>;

  /**
   * Callback invoked when the switch value changes
   */
  onValueChange?: DirectEventHandler<Readonly<ValueChangeEvent>>;
}

export default codegenNativeComponent<NativeProps>(
  'ReactNativeBlurSwitchButtonView',
  { excludedPlatforms: ['iOS'] }
);
