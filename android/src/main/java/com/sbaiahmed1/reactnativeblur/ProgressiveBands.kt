package com.sbaiahmed1.reactnativeblur

/** One blur of a progressive band stack: an effect radius and its mask, both in node px. */
internal data class Band(val radius: Float, val mask: MaskSpec)

/** Splits a progressive blur into bands whose sigma follows the iOS curve, DP_PER_AMOUNT x amount x t^3. */
internal object ProgressiveBands {
  const val COUNT = 9
  /** iOS takes blurAmount as a radius of about 2 pt of Gaussian sigma per unit at the plateau. */
  const val DP_PER_AMOUNT = 2f
  /** The plateau sigma stops growing here (amount 48), and only the onset moves past it. */
  const val CAP_DP = 96f
  private const val CENTER_FADE = 0.2f

  /** Where band [k] is fully drawn: t is 0 at the clear edge and 1 where the plateau starts. */
  fun opaqueFrom(k: Int, reach: Float): Float = reach * Math.pow(2.0, -k / 3.0).toFloat()

  /** Fades a band in over the half node pixel of sigma after a blur starts to show. */
  fun weight(nodeSigma: Float): Float = ((nodeSigma - 0.5f) / 0.5f).coerceIn(0f, 1f)

  /** Where the iOS curve reaches the capped plateau sigma, 1 while the plateau is not capped. */
  fun reach(amount: Float): Float {
    val target = DP_PER_AMOUNT * sanitized(amount)
    if (target <= CAP_DP) return 1f
    return Math.cbrt((CAP_DP / target).toDouble()).toFloat()
  }

  /** The plateau sigma in view px, 0 for an amount of 0 or less. */
  fun plateauSigmaPx(amount: Float, density: Float): Float {
    val value = sanitized(amount)
    if (value <= 0f) return 0f
    return minOf(DP_PER_AMOUNT * value, CAP_DP) * density
  }

  /** The bands for a view of [width] x [height] view px on a node [scale] view px per px, strongest first. */
  fun bands(
    amount: Float,
    direction: String,
    startOffset: Float,
    width: Float,
    height: Float,
    scale: Int,
    density: Float
  ): List<Band> {
    val sigma = plateauSigmaPx(amount, density)
    val reach = reach(amount)
    val line = ProgressiveMask.spec(direction, startOffset, width, height)
    val center = direction == "center"
    val edges = direction == "edges"
    val solid = !center && !edges && startOffset >= 1f
    val out = ArrayList<Band>(COUNT)
    for (k in 0 until if (solid) 1 else COUNT) {
      val nodeSigma = sigma / (1 shl k) / scale
      val w = weight(nodeSigma)
      if (w <= 0f) break
      val stops = when {
        solid -> floatArrayOf(0f, 1f) to floatArrayOf(w, w)
        center -> centerStops(k, startOffset, w, reach)
        edges -> edgesStops(k, startOffset, w, reach)
        else -> edgeStops(k, w, reach)
      }
      val mask = MaskSpec(line.x0 / scale, line.y0 / scale, line.x1 / scale, line.y1 / scale, stops.second, stops.first)
      out += Band(BlurRadius.effectRadius(nodeSigma), mask)
    }
    return out
  }

  private fun sanitized(amount: Float): Float =
    if (amount.isNaN() || amount.isInfinite()) BlurRadius.DEFAULT_AMOUNT else amount

  private fun edgeStops(k: Int, w: Float, reach: Float): Pair<FloatArray, FloatArray> =
    floatArrayOf(0f, opaqueFrom(k + 1, reach), opaqueFrom(k, reach), 1f) to floatArrayOf(0f, 0f, w, w)

  // Both fades mirror each other around the middle, which the clamp at 0.3 keeps them from crossing.
  private fun centerStops(k: Int, startOffset: Float, w: Float, reach: Float): Pair<FloatArray, FloatArray> {
    val inset = startOffset.coerceIn(0.01f, 0.3f)
    val from = (inset + CENTER_FADE * opaqueFrom(k + 1, reach)).coerceAtMost(0.5f)
    val full = (inset + CENTER_FADE * opaqueFrom(k, reach)).coerceAtMost(0.5f)
    return floatArrayOf(0f, from, full, 1f - full, 1f - from, 1f) to floatArrayOf(0f, 0f, w, w, 0f, 0f)
  }

  // The center stops mirrored: each band is full from both edges inward and fades out toward the middle.
  private fun edgesStops(k: Int, startOffset: Float, w: Float, reach: Float): Pair<FloatArray, FloatArray> {
    val inset = startOffset.coerceIn(0f, 0.3f)
    val full = (inset + CENTER_FADE * (1f - opaqueFrom(k, reach))).coerceAtMost(0.5f)
    val clear = (inset + CENTER_FADE * (1f - opaqueFrom(k + 1, reach))).coerceAtMost(0.5f)
    return floatArrayOf(0f, full, clear, 1f - clear, 1f - full, 1f) to floatArrayOf(w, w, 0f, 0f, w, w)
  }
}
