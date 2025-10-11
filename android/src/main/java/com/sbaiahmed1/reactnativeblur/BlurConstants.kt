package com.sbaiahmed1.reactnativeblur

object BlurConstants {
  const val TAG = "ReactNativeBlurView"
  const val MIN_BLUR_RADIUS = 0f
  const val MAX_BLUR_RADIUS = 25f
  const val MIN_BLUR_AMOUNT = 0f
  const val MAX_BLUR_AMOUNT = 100f
  const val DEFAULT_BLUR_AMOUNT = 10f

  fun mapBlurAmountToRadius(amount: Float): Float {
    val clamped = amount.coerceIn(MIN_BLUR_AMOUNT, MAX_BLUR_AMOUNT)
    return (clamped / MAX_BLUR_AMOUNT) * MAX_BLUR_RADIUS
  }
}
