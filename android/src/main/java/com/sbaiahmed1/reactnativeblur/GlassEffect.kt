package com.sbaiahmed1.reactnativeblur

import android.graphics.Color

object GlassEffect {
  fun computeOverlay(glassTintColor: Int, glassOpacity: Float): Int {
    val alpha = (glassOpacity.coerceIn(0f, 1f) * 255).toInt()
    return Color.argb(
      alpha,
      Color.red(glassTintColor),
      Color.green(glassTintColor),
      Color.blue(glassTintColor)
    )
  }
}
