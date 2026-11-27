package com.sbaiahmed1.reactnativeblur

/** The props the BlurView manager sets, on the engine view and on the legacy QmBlurView view alike. */
interface BlurViewProps {
  fun setBlurAmount(amount: Float)
  fun setBlurType(type: String)
  fun setRounds(rounds: Int)
  fun setDownsample(factor: Float)
  fun setBorderRadius(radius: Float)
  fun setBorderTopLeftRadius(radius: Float)
  fun setBorderTopRightRadius(radius: Float)
  fun setBorderBottomLeftRadius(radius: Float)
  fun setBorderBottomRightRadius(radius: Float)
  // The blurType material at full strength from the JS wrapper. A negative radius means none was set.
  fun setMaterialTint(color: Int?)
  fun setMaterialSaturation(saturation: Float)
  fun setMaterialRadius(radiusDp: Float)
  fun cleanup()
}

/** The props the ProgressiveBlurView manager sets on either tier. */
interface ProgressiveBlurViewProps : BlurViewProps {
  fun setDirection(direction: String)
  fun setStartOffset(offset: Float)
}
