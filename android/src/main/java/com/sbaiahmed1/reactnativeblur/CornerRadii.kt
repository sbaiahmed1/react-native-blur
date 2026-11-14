package com.sbaiahmed1.reactnativeblur

/** Resolves React Native border radii in dp into corner radii in px. */
internal object CornerRadii {
  data class Px(val topLeft: Float, val topRight: Float, val bottomRight: Float, val bottomLeft: Float) {
    val isUniform: Boolean
      get() = topLeft == topRight && topRight == bottomRight && bottomRight == bottomLeft
  }

  /** Per-corner values below 0 fall back to the base radius, and an explicit 0 squares that corner. */
  fun resolve(
    baseDp: Float,
    topLeftDp: Float,
    topRightDp: Float,
    bottomRightDp: Float,
    bottomLeftDp: Float,
    density: Float
  ): Px {
    fun corner(dp: Float) = (if (dp >= 0f) dp else baseDp) * density
    return Px(corner(topLeftDp), corner(topRightDp), corner(bottomRightDp), corner(bottomLeftDp))
  }
}
