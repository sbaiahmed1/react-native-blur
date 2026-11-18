package com.sbaiahmed1.reactnativeblur

/** Gradient line and stops of a progressive blur mask, in view px with alphas 0 to 1. */
internal data class MaskSpec(
  val x0: Float,
  val y0: Float,
  val x1: Float,
  val y1: Float,
  val alphas: FloatArray,
  val positions: FloatArray
)

/** The legacy ProgressiveBlurView mask geometry, without Android types. */
internal object ProgressiveMask {
  // Rises above linear early and saturates at 3/4 of the ramp, so startOffset stays visible (#119).
  private val RAMP_POSITIONS = floatArrayOf(0f, 0.15f, 0.3f, 0.45f, 0.6f, 0.75f, 1f)
  private val RAMP_ALPHAS = floatArrayOf(0f, 0.08f, 0.3f, 0.52f, 0.75f, 0.9f, 1f)

  fun normalizeDirection(raw: String): String = when (raw.lowercase()) {
    "blurredbottomcleartop", "bottomtotop", "bottom" -> "bottomToTop"
    "blurredtopclearbottom", "toptobottom", "top" -> "topToBottom"
    "blurredcentercleartopandbottom", "center" -> "center"
    "blurredlefttoclearright", "lefttoright", "left" -> "leftToRight"
    "blurredrighttoclearleft", "righttoleft", "right" -> "rightToLeft"
    else -> "topToBottom"
  }

  /** [color] at each of [alphas], so a gradient draws the masked overlay without an offscreen layer. */
  fun overlayColors(color: Int, alphas: FloatArray): IntArray {
    val alpha = (color ushr 24) and 0xFF
    return IntArray(alphas.size) { (Math.round(alpha * alphas[it]) shl 24) or (color and 0xFFFFFF) }
  }

  fun spec(direction: String, startOffset: Float, width: Float, height: Float): MaskSpec {
    if (direction == "center") {
      val startEdge = startOffset.coerceIn(0.01f, 0.3f)
      return MaskSpec(
        0f, 0f, 0f, height,
        floatArrayOf(0f, 0f, 1f, 1f, 0f, 0f),
        floatArrayOf(0f, startEdge, 0.2f + startEdge, 0.8f - startEdge, 1f - startEdge, 1f)
      )
    }
    if (startOffset >= 1f) return MaskSpec(0f, 0f, 0f, height, floatArrayOf(1f, 1f), floatArrayOf(0f, 1f))
    return when (direction) {
      "bottomToTop" -> MaskSpec(0f, 0f, 0f, height - height * startOffset, RAMP_ALPHAS, RAMP_POSITIONS)
      "topToBottom" -> MaskSpec(0f, height, 0f, height * startOffset, RAMP_ALPHAS, RAMP_POSITIONS)
      "leftToRight" -> MaskSpec(width, 0f, width * startOffset, 0f, RAMP_ALPHAS, RAMP_POSITIONS)
      "rightToLeft" -> MaskSpec(0f, 0f, width - width * startOffset, 0f, RAMP_ALPHAS, RAMP_POSITIONS)
      else -> MaskSpec(0f, 0f, 0f, height, RAMP_ALPHAS, RAMP_POSITIONS)
    }
  }
}
