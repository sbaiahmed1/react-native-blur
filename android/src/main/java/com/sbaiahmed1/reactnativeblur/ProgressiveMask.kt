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
    "blurredtopandbottomclearcenter", "edges" -> "edges"
    else -> "topToBottom"
  }

  /** [color] at each of [alphas], so a gradient draws the masked overlay without an offscreen layer. */
  fun overlayColors(color: Int, alphas: FloatArray): IntArray {
    val alpha = (color ushr 24) and 0xFF
    return IntArray(alphas.size) { (Math.round(alpha * alphas[it]) shl 24) or (color and 0xFFFFFF) }
  }

  /** Stops per fade of the tint, whose alpha follows the same t^3 curve as the iOS blur mask. */
  const val TINT_STOPS = 9
  private const val CENTER_FADE = 0.2f
  private val TINT_POSITIONS = FloatArray(TINT_STOPS) { it / (TINT_STOPS - 1f) }
  private val TINT_ALPHAS = FloatArray(TINT_STOPS) { TINT_POSITIONS[it] * TINT_POSITIONS[it] * TINT_POSITIONS[it] }
  private val TINT_ALPHAS_OUT = TINT_ALPHAS.reversedArray()

  /** The blurAmount at which the tint reaches full strength, so a view at 0 draws no tint. */
  const val TINT_FULL_AMOUNT = 10f

  /** The material tint when the wrapper sent one, else the legacy color of [blurType], faded in up to [TINT_FULL_AMOUNT]. */
  fun tintColor(materialTint: Int?, blurType: String, amount: Float): Int {
    val color = materialTint ?: BlurType.fromString(blurType).overlayColor
    val scale = if (amount.isNaN()) 1f else (amount / TINT_FULL_AMOUNT).coerceIn(0f, 1f)
    val alpha = Math.round(((color ushr 24) and 0xFF) * scale)
    return (alpha shl 24) or (color and 0xFFFFFF)
  }

  /** The tint ramp on the blur's own line: alpha t^3, where t is 0 at the clear edge and 1 at the plateau. */
  fun tintSpec(direction: String, startOffset: Float, width: Float, height: Float): MaskSpec {
    val line = spec(direction, startOffset, width, height)
    val center = direction == "center"
    if (!center && direction != "edges") {
      if (startOffset >= 1f) return line
      return line.copy(alphas = TINT_ALPHAS, positions = TINT_POSITIONS)
    }
    val inset = if (center) startOffset.coerceIn(0.01f, 0.3f) else startOffset.coerceIn(0f, 0.3f)
    val outer = if (center) 0f else 1f
    val first = FloatArray(TINT_STOPS) { inset + CENTER_FADE * TINT_POSITIONS[it] }
    val second = FloatArray(TINT_STOPS) { 1f - inset - CENTER_FADE + CENTER_FADE * TINT_POSITIONS[it] }
    val alphas = if (center) TINT_ALPHAS + TINT_ALPHAS_OUT else TINT_ALPHAS_OUT + TINT_ALPHAS
    return line.copy(
      alphas = floatArrayOf(outer) + alphas + outer,
      positions = floatArrayOf(0f) + first + second + 1f
    )
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
    if (direction == "edges") {
      val inset = startOffset.coerceIn(0f, 0.3f)
      return MaskSpec(
        0f, 0f, 0f, height,
        floatArrayOf(1f, 1f, 0f, 0f, 1f, 1f),
        floatArrayOf(0f, inset, 0.2f + inset, 0.8f - inset, 1f - inset, 1f)
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
