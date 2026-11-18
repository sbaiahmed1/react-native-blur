package com.sbaiahmed1.reactnativeblur

import org.junit.Assert.assertArrayEquals
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class ProgressiveBandsTest {

  private fun bands(amount: Float, direction: String = "topToBottom", offset: Float = 0f, scale: Int = 2) =
    ProgressiveBands.bands(amount, direction, offset, 1080f, 2400f, scale)

  private fun assertLine(spec: MaskSpec, x0: Float, y0: Float, x1: Float, y1: Float) {
    assertEquals(x0, spec.x0, 0.001f)
    assertEquals(y0, spec.y0, 0.001f)
    assertEquals(x1, spec.x1, 0.001f)
    assertEquals(y1, spec.y1, 0.001f)
  }

  private fun assertRadii(expected: FloatArray, actual: List<Band>) {
    assertArrayEquals(expected, actual.map { it.radius }.toFloatArray(), 0.001f)
  }

  private fun weightOf(band: Band): Float = band.mask.alphas.max()

  @Test fun opaqueFromFollowsTheCube() {
    val expected = floatArrayOf(1f, 0.7937f, 0.6300f, 0.5f, 0.3969f, 0.3150f)
    assertArrayEquals(expected, FloatArray(6) { ProgressiveBands.opaqueFrom(it) }, 0.001f)
  }

  @Test fun weightRampsOverHalfANodePixel() {
    assertEquals(0f, ProgressiveBands.weight(0.5f), 0.0001f)
    assertEquals(0.5f, ProgressiveBands.weight(0.75f), 0.0001f)
    assertEquals(1f, ProgressiveBands.weight(1f), 0.0001f)
    assertEquals(1f, ProgressiveBands.weight(3f), 0.0001f)
  }

  @Test fun bandsAtScaleTwo() {
    val ten = bands(10f)
    assertRadii(floatArrayOf(9.959f, 4.547f, 1.840f, 0.487f), ten)
    assertEquals(0.5625f, weightOf(ten.last()), 0.001f)

    val twenty = bands(20f)
    assertRadii(floatArrayOf(17.279f, 8.207f, 3.670f, 1.402f, 0.268f), twenty)
    assertEquals(0.3095f, weightOf(twenty.last()), 0.001f)

    val hundred = bands(100f)
    assertRadii(floatArrayOf(33.775f, 16.454f, 7.794f, 3.464f, 1.299f), hundred)
    hundred.forEach { assertEquals(1f, weightOf(it), 0.0001f) }
  }

  @Test fun bandsAtScaleEight() {
    assertRadii(floatArrayOf(3.670f, 1.402f, 0.268f), bands(20f, scale = 8))
  }

  @Test fun platformScaleDrawsEveryBand() {
    assertEquals(5, bands(20f, scale = 1).size)
  }

  @Test fun noBandBelowTheFloor() {
    assertTrue(bands(0f).isEmpty())
    assertTrue(bands(0.5f).isEmpty())
    assertRadii(bands(BlurRadius.DEFAULT_AMOUNT).map { it.radius }.toFloatArray(), bands(Float.NaN))
  }

  @Test fun edgeBandStops() {
    val hundred = bands(100f)
    assertLine(hundred[1].mask, 0f, 1200f, 0f, 0f)
    assertArrayEquals(floatArrayOf(0f, 0.6300f, 0.7937f, 1f), hundred[1].mask.positions, 0.001f)
    assertArrayEquals(floatArrayOf(0f, 0f, 1f, 1f), hundred[1].mask.alphas, 0.0001f)
    assertArrayEquals(floatArrayOf(0f, 0.7937f, 1f), hundred[0].mask.positions, 0.001f)
    assertArrayEquals(floatArrayOf(0f, 0f, 1f), hundred[0].mask.alphas, 0.0001f)
  }

  @Test fun maskLineIsInNodePixels() {
    assertLine(bands(100f, scale = 1)[1].mask, 0f, 2400f, 0f, 0f)
    assertLine(bands(100f, scale = 8)[1].mask, 0f, 300f, 0f, 0f)
  }

  @Test fun offsetMovesThePlateau() {
    val band = bands(100f, offset = 0.3f)[1]
    assertLine(band.mask, 0f, 1200f, 0f, 0.3f * 2400f / 2)
    assertArrayEquals(floatArrayOf(0f, 0.6300f, 0.7937f, 1f), band.mask.positions, 0.001f)
  }

  @Test fun fullOffsetIsOneSolidBand() {
    val twenty = bands(20f, offset = 1f)
    assertEquals(1, twenty.size)
    assertEquals(17.279f, twenty[0].radius, 0.001f)
    assertArrayEquals(floatArrayOf(1f, 1f), twenty[0].mask.alphas, 0.0001f)
    assertArrayEquals(floatArrayOf(0.5f, 0.5f), bands(1.2f, offset = 1f)[0].mask.alphas, 0.001f)
  }

  @Test fun centerStops() {
    val band = bands(100f, direction = "center")[1]
    assertLine(band.mask, 0f, 0f, 0f, 1200f)
    val expected = floatArrayOf(0f, 0.01f + 0.2f * 0.63f, 0.01f + 0.2f * 0.7937f, 0.79f + 0.2f * 0.2063f, 0.79f + 0.2f * 0.37f, 1f)
    assertArrayEquals(expected, band.mask.positions, 0.001f)
    assertArrayEquals(floatArrayOf(0f, 0f, 1f, 1f, 0f, 0f), band.mask.alphas, 0.0001f)
  }

  @Test fun centerAtTheClampKeepsStopsOrdered() {
    for (offset in floatArrayOf(0.3f, 0.9f)) {
      for (band in bands(100f, direction = "center", offset = offset)) {
        val p = band.mask.positions
        for (i in 1 until p.size) assertTrue("offset $offset: ${p.toList()}", p[i] >= p[i - 1])
      }
    }
  }

  @Test fun leftAndRightRunAlongX() {
    assertLine(bands(100f, direction = "leftToRight")[1].mask, 540f, 0f, 0f, 0f)
    assertLine(bands(100f, direction = "rightToLeft")[1].mask, 0f, 0f, 540f, 0f)
  }

  @Test fun tinyViewKeepsFiniteStops() {
    val tiny = ProgressiveBands.bands(20f, "topToBottom", 0f, 1080f, 21f, 2)
    assertEquals(5, tiny.size)
    for (band in tiny) {
      val m = band.mask
      for (v in floatArrayOf(band.radius, m.x0, m.y0, m.x1, m.y1) + m.positions + m.alphas) assertTrue(v.isFinite())
    }
  }

  @Test fun weightsAreContinuousInAmount() {
    for (scale in intArrayOf(1, 2, 8)) {
      var previous = FloatArray(ProgressiveBands.COUNT)
      var step = 0
      while (step <= 20_000) {
        val amount = step * 0.005f
        val weights = FloatArray(ProgressiveBands.COUNT)
        bands(amount, scale = scale).forEachIndexed { k, band -> weights[k] = weightOf(band) }
        for (k in weights.indices) {
          assertTrue("scale $scale amount $amount band $k", Math.abs(weights[k] - previous[k]) < 0.02f)
        }
        previous = weights
        step++
      }
    }
  }
}
