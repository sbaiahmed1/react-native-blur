import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';
import type { ViewProps } from 'react-native';
import type {
  WithDefault,
  Double,
} from 'react-native/Libraries/Types/CodegenTypes';

export type GlassType = 'clear' | 'regular';

interface NativeProps extends ViewProps {
  /**
   * The type of glass effect to apply
   * Platform: iOS only
   * @default 'clear'
   */
  glassType?: WithDefault<GlassType, 'clear'>;

  /**
   * The tint color of the glass effect
   * Platform: iOS only
   * @default 'clear'
   */
  glassTintColor?: WithDefault<string, 'clear'>;

  /**
   * The opacity of the glass effect (0-1)
   * Platform: iOS only
   * @default 1.0
   */
  glassOpacity?: WithDefault<Double, 1.0>;

  /**
   * Fallback color when reduced transparency is enabled
   * Platform: iOS only
   * @default '#FFFFFF'
   */
  reducedTransparencyFallbackColor?: WithDefault<string, '#FFFFFF'>;

  /**
   * Whether the glass view should be interactive
   * Platform: iOS only
   * @default true
   */
  isInteractive?: WithDefault<boolean, true>;

  /**
   * Whether the glass view should ignore safe area insets
   * Platform: iOS only
   * @default false
   */
  ignoreSafeArea?: WithDefault<boolean, false>;

  /**
   * Whether the glass view should ignore accessibility fallback
   * @default false
   */
  ignoreAccessibilityFallback?: WithDefault<boolean, false>;
}

export default codegenNativeComponent<NativeProps>(
  'ReactNativeLiquidGlassView',
  { excludedPlatforms: ['android'] }
);
