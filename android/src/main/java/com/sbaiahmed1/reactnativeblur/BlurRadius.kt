package com.sbaiahmed1.reactnativeblur

/** Maps blurAmount to a Gaussian blur that matches QmBlurView at downsample 8 and 5 rounds. */
internal object BlurRadius {
  // QmBlurView clamps its downsampled radius at 2, which is amount 16 at downsample 8. Below it the sigma ramps to 0.
  const val FLOOR_AMOUNT = 16f
  // Sigma in px at the floor and at amount 100, calibrated against QmBlurView screenshots of the behind source.
  const val FLOOR_SIGMA = 20f
  const val MAX_SIGMA = 40f
  const val DEFAULT_AMOUNT = 10f
  private const val MAX_AMOUNT = 100f

  /** Sigma in px, linear from 0 at amount 0 to the floor, then linear to amount 100. An amount of 0 or less gives no blur. */
  fun sigmaPx(amount: Float): Float {
    val value = if (amount.isNaN() || amount.isInfinite()) DEFAULT_AMOUNT else amount
    if (value <= 0f) return 0f
    if (value < FLOOR_AMOUNT) return FLOOR_SIGMA * value / FLOOR_AMOUNT
    val clamped = value.coerceAtMost(MAX_AMOUNT)
    return FLOOR_SIGMA + (clamped - FLOOR_AMOUNT) * (MAX_SIGMA - FLOOR_SIGMA) / (MAX_AMOUNT - FLOOR_AMOUNT)
  }

  /** The effect radius for [amount] on a node whose px are [scale] view px wide. */
  fun radius(amount: Float, scale: Int): Float = effectRadius(sigmaPx(amount) / scale)

  /** The RenderEffect.createBlurEffect radius for a sigma, hwui converts with sigma = 0.57735 * radius + 0.5. */
  fun effectRadius(sigmaPx: Float): Float = if (sigmaPx <= 0.5f) 0f else (sigmaPx - 0.5f) / 0.57735f
}
