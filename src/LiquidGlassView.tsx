import React from 'react';
import { Platform } from 'react-native';
import type { ViewStyle, StyleProp } from 'react-native';
import ReactNativeLiquidGlassView, {
  type GlassType,
} from './ReactNativeLiquidGlassViewNativeComponent';
import BlurView from './BlurView';

export interface LiquidGlassViewProps {
  /**
   * @description The type of glass effect to apply
   *
   * @default 'clear'
   *
   * @platform iOS 26+
   */
  glassType?: GlassType;

  /**
   * @description The tint color of the glass effect. Accepts hex color strings
   * like '#FFFFFF' or color names
   *
   * @default 'clear'
   *
   * @platform iOS 26+
   */
  glassTintColor?: string;

  /**
   * @description The opacity of the glass effect (0-1)
   *
   * @default 1.0
   *
   * @platform iOS 26+
   */
  glassOpacity?: number;

  /**
   * @description Fallback color when reduced transparency is enabled or on
   * older iOS versions
   *
   * @default '#FFFFFF'
   *
   * @platform iOS
   */
  reducedTransparencyFallbackColor?: string;

  /**
   * @description Whether the glass view should be interactive
   *
   * @default true
   *
   * @platform iOS
   */
  isInteractive?: boolean;

  /**
   * @description Whether the glass view should ignore safe area insets
   *
   * @default false
   *
   * @platform iOS
   */
  ignoreSafeArea?: boolean;

  /**
   * @description Style object for the liquid glass view
   *
   * @default undefined
   */
  style?: StyleProp<ViewStyle>;

  /**
   * Child components to render inside the liquid glass view
   *
   * @default undefined
   */
  children?: React.ReactNode;
}

/** Blur strength used for the non-iOS-26 glass fallback. */
const FALLBACK_BLUR_AMOUNT = 70;

/**
 * Upper bound on the tint alpha for the fallback. Liquid glass reads as a
 * subtle tint over blurred content, so a fully opaque tint would look like a
 * solid coloured panel. glassOpacity is scaled into [0, this].
 */
const MAX_FALLBACK_TINT_ALPHA = 0.35;

/**
 * Builds the overlay colour for the fallback blur. Returns undefined (no tint)
 * for a clear/transparent/missing tint, and scales a hex tint down to a subtle,
 * capped alpha so the fallback approximates glass rather than a solid fill.
 * Non-hex colours (named colours, rgb/rgba) are passed through unchanged.
 */
function getFallbackOverlayColor(
  tint: string | undefined,
  opacity: number
): string | undefined {
  if (!tint) return undefined;
  const normalized = tint.trim().toLowerCase();
  if (
    normalized === '' ||
    normalized === 'clear' ||
    normalized === 'transparent'
  ) {
    return undefined;
  }

  // Normalize all hex forms React Native accepts (#rgb, #rgba, #rrggbb,
  // #rrggbbaa) to a 6-digit base plus a 0-1 alpha carried by the tint itself.
  const hexBody = /^#([0-9a-f]{3,8})$/.exec(normalized)?.[1];
  let rgb: string | undefined;
  let tintAlpha = 1;
  if (hexBody) {
    if (hexBody.length === 3 || hexBody.length === 4) {
      const [r, g, b, a] = hexBody.split('');
      rgb = `${r}${r}${g}${g}${b}${b}`;
      if (a !== undefined) tintAlpha = parseInt(`${a}${a}`, 16) / 255;
    } else if (hexBody.length === 6 || hexBody.length === 8) {
      rgb = hexBody.slice(0, 6);
      if (hexBody.length === 8)
        tintAlpha = parseInt(hexBody.slice(6), 16) / 255;
    }
  }

  if (rgb) {
    const clamped = Math.max(0, Math.min(1, opacity));
    const alpha = Math.round(
      clamped * MAX_FALLBACK_TINT_ALPHA * tintAlpha * 255
    )
      .toString(16)
      .padStart(2, '0');
    return `#${rgb}${alpha}`;
  }

  // Named colour or rgb()/rgba() — cannot safely re-alpha, pass through as-is.
  return tint;
}

/**
 * A Liquid Glass view component that provides iOS 26+ glass effects.
 *
 * This component uses the new UIKit glass effect API available on iOS 26+.
 * On older iOS versions or when reduced transparency is enabled, it falls back
 * to a solid color background.
 *
 * **Platform Support:**
 * - iOS 26+: Native glass effect with full functionality
 * - iOS < 26 or Android: Fallback to reducedTransparencyFallbackColor
 *
 * This component automatically handles the proper positioning pattern where the glass
 * effect is positioned absolutely behind the content, ensuring interactive elements
 * work correctly.
 *
 * @example
 * ```tsx
 * import { LiquidGlassView } from '@sbaiahmed1/react-native-blur';
 *
 * <LiquidGlassView
 *   glassType="clear"
 *   glassTintColor="#007AFF"
 *   glassOpacity={0.8}
 *   style={{ flex: 1 }}
 * >
 *   <Text>Content on top of liquid glass</Text>
 *   <Button title="Interactive Button" onPress={() => {}} />
 * </LiquidGlassView>
 * ```
 *
 * @platform ios
 */
export const LiquidGlassView: React.FC<LiquidGlassViewProps> = ({
  glassType = 'clear',
  glassTintColor = 'clear',
  glassOpacity = 1.0,
  reducedTransparencyFallbackColor = '#FFFFFF',
  isInteractive = true,
  ignoreSafeArea = true,
  style,
  children,
  ...props
}) => {
  const isIos = Platform.OS === 'ios';

  // On Android and iOS < 26 the native glass API is unavailable, so we fall
  // back to a strong, lightly-tinted blur that approximates liquid glass.
  if (!isIos || (isIos && Number.parseInt(String(Platform.Version), 10) < 26)) {
    return (
      <BlurView
        // "regular" is a subtle (~14% white) overlay. The default "xlight" is
        // ~55% opaque and would make the fallback look like a solid panel.
        blurType="regular"
        blurAmount={FALLBACK_BLUR_AMOUNT}
        overlayColor={getFallbackOverlayColor(glassTintColor, glassOpacity)}
        reducedTransparencyFallbackColor={reducedTransparencyFallbackColor}
        ignoreSafeArea={ignoreSafeArea}
        style={style}
      >
        {children}
      </BlurView>
    );
  }

  // If children exist, use the absolute positioning pattern
  return (
    <ReactNativeLiquidGlassView
      glassType={glassType}
      glassTintColor={glassTintColor}
      glassOpacity={glassOpacity}
      reducedTransparencyFallbackColor={reducedTransparencyFallbackColor}
      isInteractive={isInteractive}
      ignoreSafeArea={ignoreSafeArea}
      style={style}
      {...props}
    >
      {children}
    </ReactNativeLiquidGlassView>
  );
};

export default LiquidGlassView;
