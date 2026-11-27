package com.sbaiahmed1.reactnativeblur

/** The downsampleFactor prop of the QmBlurView views on Android 11 and earlier. */
internal object DownsampleFactor {
  const val DEFAULT = 8f
  private const val MIN = 1f
  private const val MAX = 16f

  /** Clamps a factor to 1-16. NaN reads as the default, since QmBlurView ignores NaN without a warning. */
  fun clamp(factor: Float): Float = if (factor.isNaN()) DEFAULT else factor.coerceIn(MIN, MAX)
}
