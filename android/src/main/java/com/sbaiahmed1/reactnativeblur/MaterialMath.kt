package com.sbaiahmed1.reactnativeblur

import kotlin.math.max
import kotlin.math.sqrt

/** What a BlurView draws for its props: the blur sigma in view px, the tint over it and the backdrop saturation. */
internal data class MaterialDrawSpec(val sigmaPx: Float, val overlayColor: Int, val saturation: Float)

/** Scales a blurType material by blurAmount the way iOS does: blur, tint alpha and extra saturation all follow amount / 100. */
internal object MaterialMath {
  private const val MAX_AMOUNT = 100f
  private const val LUMA_R = 0.2126f
  private const val LUMA_G = 0.7152f
  private const val LUMA_B = 0.0722f
  // The blur a downsampled backdrop node adds by itself, in node px, from edge fits of the engine at known sigmas.
  private const val DOWNSAMPLE_BLUR_NODE_PX = 0.58f
  // Above 0, so hwui draws its smallest Gaussian of half a node px.
  private const val MIN_EFFECT_RADIUS = 0.001f

  /** The fraction of the material an amount draws, as iOS reads it: 0 or less is none, above 100 and NaN are all of it. */
  fun fraction(amount: Float): Float =
    if (amount.isNaN()) 1f else amount.coerceIn(0f, MAX_AMOUNT) / MAX_AMOUNT

  /** The blur sigma in px for a material radius in dp. */
  fun sigmaPx(amount: Float, radiusDp: Float, density: Float): Float = fraction(amount) * radiusDp * density

  /** The material tint with its alpha scaled by the fraction, the color unchanged. */
  fun tint(amount: Float, color: Int): Int {
    val alpha = Math.round((color ushr 24) * fraction(amount))
    return (alpha shl 24) or (color and 0xFFFFFF)
  }

  /** The saturation at this amount, from 1 at amount 0 to the material's at 100. */
  fun saturation(amount: Float, full: Float): Float = 1f + fraction(amount) * (full - 1f)

  /** A 4x5 ColorMatrix that moves each channel away from the Rec. 709 luma by [s], so grays stay gray. */
  fun saturationMatrix(s: Float): FloatArray {
    val r = LUMA_R * (1f - s)
    val g = LUMA_G * (1f - s)
    val b = LUMA_B * (1f - s)
    return floatArrayOf(
      r + s, g, b, 0f, 0f,
      r, g + s, b, 0f, 0f,
      r, g, b + s, 0f, 0f,
      0f, 0f, 0f, 1f, 0f,
    )
  }

  /** The RenderEffect radius on a node of [scale] view px per px that blurs [targetPx] in all, net of the blur the downsample adds, 0 below half a node px. */
  fun nodeEffectRadius(targetPx: Float, scale: Int): Float {
    if (!(targetPx / scale > 0.5f)) return 0f
    val downsampleBlur = if (scale > 1) DOWNSAMPLE_BLUR_NODE_PX * scale else 0f
    val gaussianPx = sqrt(max(0f, targetPx * targetPx - downsampleBlur * downsampleBlur))
    return max(BlurRadius.effectRadius(gaussianPx / scale), MIN_EFFECT_RADIUS)
  }

  /** The QmBlurView amount whose sigma is [sigmaPx], the inverse of [BlurRadius.sigmaPx], from 0 to 100. */
  fun legacyAmount(sigmaPx: Float): Float {
    if (!(sigmaPx > 0f)) return 0f
    if (sigmaPx < BlurRadius.FLOOR_SIGMA) return sigmaPx * BlurRadius.FLOOR_AMOUNT / BlurRadius.FLOOR_SIGMA
    val above = (sigmaPx - BlurRadius.FLOOR_SIGMA) * (MAX_AMOUNT - BlurRadius.FLOOR_AMOUNT) /
      (BlurRadius.MAX_SIGMA - BlurRadius.FLOOR_SIGMA)
    return (BlurRadius.FLOOR_AMOUNT + above).coerceAtMost(MAX_AMOUNT)
  }

  /** The draw spec for the props. A negative radius means no material, as on a raw native component: the blurType overlay and no saturation. */
  fun drawSpec(amount: Float, radiusDp: Float, tint: Int?, saturation: Float, density: Float, blurType: String): MaterialDrawSpec {
    if (!(radiusDp >= 0f)) {
      return MaterialDrawSpec(BlurRadius.sigmaPx(amount), BlurType.fromString(blurType).overlayColor, 1f)
    }
    return MaterialDrawSpec(
      sigmaPx(amount, radiusDp, density),
      if (tint == null) 0 else tint(amount, tint),
      if (saturation < 0f) 1f else saturation(amount, saturation),
    )
  }
}
