package com.sbaiahmed1.reactnativeblur

/** One blur of a progressive band stack: an effect radius and its mask, both in node px. */
internal data class Band(val radius: Float, val mask: MaskSpec)

/** Splits a progressive blur into bands whose radius follows the iOS curve, max * t^3 across the fade. */
internal object ProgressiveBands {
  const val COUNT = 5
  private const val CENTER_FADE = 0.2f

  /** Where band [k] is fully drawn: t is 0 at the clear edge and 1 where the plateau starts. */
  fun opaqueFrom(k: Int): Float = Math.pow(2.0, -k / 3.0).toFloat()

  /** Fades a band in over the half node pixel of sigma after a blur starts to show. */
  fun weight(nodeSigma: Float): Float = ((nodeSigma - 0.5f) / 0.5f).coerceIn(0f, 1f)

  /** The bands for a view of [width] x [height] view px on a node [scale] view px per px, strongest first. */
  fun bands(amount: Float, direction: String, startOffset: Float, width: Float, height: Float, scale: Int): List<Band> {
    val sigma = BlurRadius.sigmaPx(amount)
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
        center -> centerStops(k, startOffset, w)
        edges -> edgesStops(k, startOffset, w)
        else -> edgeStops(k, w)
      }
      val mask = MaskSpec(line.x0 / scale, line.y0 / scale, line.x1 / scale, line.y1 / scale, stops.second, stops.first)
      out += Band(BlurRadius.effectRadius(nodeSigma), mask)
    }
    return out
  }

  private fun edgeStops(k: Int, w: Float): Pair<FloatArray, FloatArray> {
    val from = opaqueFrom(k + 1)
    val full = opaqueFrom(k)
    if (k == 0) return floatArrayOf(0f, from, 1f) to floatArrayOf(0f, 0f, w)
    return floatArrayOf(0f, from, full, 1f) to floatArrayOf(0f, 0f, w, w)
  }

  // Both fades mirror each other around the middle, which the clamp at 0.3 keeps them from crossing.
  private fun centerStops(k: Int, startOffset: Float, w: Float): Pair<FloatArray, FloatArray> {
    val inset = startOffset.coerceIn(0.01f, 0.3f)
    val from = (inset + CENTER_FADE * opaqueFrom(k + 1)).coerceAtMost(0.5f)
    val full = (inset + CENTER_FADE * opaqueFrom(k)).coerceAtMost(0.5f)
    return floatArrayOf(0f, from, full, 1f - full, 1f - from, 1f) to floatArrayOf(0f, 0f, w, w, 0f, 0f)
  }

  // The center stops mirrored: each band is full from both edges inward and fades out toward the middle.
  private fun edgesStops(k: Int, startOffset: Float, w: Float): Pair<FloatArray, FloatArray> {
    val inset = startOffset.coerceIn(0f, 0.3f)
    val full = (inset + CENTER_FADE * (1f - opaqueFrom(k))).coerceAtMost(0.5f)
    val clear = (inset + CENTER_FADE * (1f - opaqueFrom(k + 1))).coerceAtMost(0.5f)
    return floatArrayOf(0f, full, clear, 1f - clear, 1f - full, 1f) to floatArrayOf(w, w, 0f, 0f, w, w)
  }
}
