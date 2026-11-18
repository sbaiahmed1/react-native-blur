package com.sbaiahmed1.reactnativeblur

import org.junit.Assert.assertArrayEquals
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class ProgressiveBandsTest {

  private fun bands(
    amount: Float,
    direction: String = "topToBottom",
    offset: Float = 0f,
    scale: Int = 2,
    density: Float = 2.625f
  ) = ProgressiveBands.bands(amount, direction, offset, 1080f, 2400f, scale, density)

  private fun assertLine(spec: MaskSpec, x0: Float, y0: Float, x1: Float, y1: Float) {
    assertEquals(x0, spec.x0, 0.001f)
    assertEquals(y0, spec.y0, 0.001f)
    assertEquals(x1, spec.x1, 0.001f)
    assertEquals(y1, spec.y1, 0.001f)
  }

  private fun assertRadii(expected: FloatArray, actual: List<Band>) {
    assertArrayEquals(expected, actual.map { it.radius }.toFloatArray(), 0.001f)
  }

  private fun assertOrderedUnitStops(label: String, list: List<Band>) {
    for (band in list) {
      val p = band.mask.positions
      for (i in p.indices) {
        assertTrue("$label: ${p.toList()}", p[i].isFinite() && p[i] >= 0f && p[i] <= 1f)
        if (i > 0) assertTrue("$label: ${p.toList()}", p[i] >= p[i - 1])
      }
    }
  }

  private fun weightOf(band: Band): Float = band.mask.alphas.max()

  @Test fun opaqueFromFollowsTheCube() {
    val expected = floatArrayOf(1f, 0.7937f, 0.6300f, 0.5f, 0.3969f, 0.3150f)
    assertArrayEquals(expected, FloatArray(6) { ProgressiveBands.opaqueFrom(it, 1f) }, 0.001f)
    assertEquals(0.4f, ProgressiveBands.opaqueFrom(3, 0.8f), 0.001f)
  }

  @Test fun reachIsOneUntilTheCap() {
    assertEquals(1f, ProgressiveBands.reach(10f), 0.0001f)
    assertEquals(1f, ProgressiveBands.reach(48f), 0.0001f)
    assertEquals(0.78297f, ProgressiveBands.reach(100f), 0.0001f)
  }

  @Test fun plateauSigmaFollowsIOS() {
    assertEquals(52.5f, ProgressiveBands.plateauSigmaPx(10f, 2.625f), 0.001f)
    assertEquals(105f, ProgressiveBands.plateauSigmaPx(20f, 2.625f), 0.001f)
    assertEquals(252f, ProgressiveBands.plateauSigmaPx(100f, 2.625f), 0.001f)
    assertEquals(0f, ProgressiveBands.plateauSigmaPx(0f, 2.625f), 0.001f)
    assertEquals(0f, ProgressiveBands.plateauSigmaPx(-5f, 2.625f), 0.001f)
    assertEquals(52.5f, ProgressiveBands.plateauSigmaPx(Float.NaN, 2.625f), 0.001f)
    assertEquals(52.5f, ProgressiveBands.plateauSigmaPx(Float.POSITIVE_INFINITY, 2.625f), 0.001f)
  }

  @Test fun weightRampsOverHalfANodePixel() {
    assertEquals(0f, ProgressiveBands.weight(0.5f), 0.0001f)
    assertEquals(0.5f, ProgressiveBands.weight(0.75f), 0.0001f)
    assertEquals(1f, ProgressiveBands.weight(1f), 0.0001f)
    assertEquals(1f, ProgressiveBands.weight(3f), 0.0001f)
  }

  @Test fun bandsAtScaleTwo() {
    val ten = bands(10f)
    assertRadii(floatArrayOf(44.600f, 21.867f, 10.501f, 4.817f, 1.976f, 0.555f), ten)
    assertEquals(0.641f, weightOf(ten.last()), 0.001f)

    assertRadii(floatArrayOf(90.067f, 44.600f, 21.867f, 10.501f, 4.817f, 1.976f, 0.555f), bands(20f))

    val hundred = bands(100f)
    assertRadii(floatArrayOf(217.372f, 108.253f, 53.694f, 26.414f, 12.774f, 5.954f, 2.544f, 0.839f), hundred)
    assertEquals(0.969f, weightOf(hundred.last()), 0.001f)
  }

  @Test fun bandsAtScaleEight() {
    assertRadii(floatArrayOf(21.867f, 10.501f, 4.817f, 1.976f, 0.555f), bands(20f, scale = 8))
  }

  @Test fun bandCountFollowsDensity() {
    val counts = floatArrayOf(1f, 2.625f, 3.5f, 4f).map { bands(100f, density = it).size }
    assertEquals(listOf(7, 8, 9, 9), counts)
    assertEquals(ProgressiveBands.COUNT, bands(100f, scale = 1, density = 4f).size)
  }

  @Test fun noBandBelowTheFloor() {
    assertTrue(bands(0f).isEmpty())
    assertTrue(bands(0.19f).isEmpty())
    assertRadii(bands(BlurRadius.DEFAULT_AMOUNT).map { it.radius }.toFloatArray(), bands(Float.NaN))
    for (density in floatArrayOf(1f, 2.625f, 3.5f, 4f)) {
      for (scale in intArrayOf(1, 2, 8)) {
        var amount = 0f
        while (amount <= 100f) {
          for (band in bands(amount, scale = scale, density = density)) {
            assertTrue("density $density scale $scale amount $amount", band.radius > 0f)
          }
          amount += 0.25f
        }
      }
    }
  }

  @Test fun edgeBandStops() {
    val twenty = bands(20f)
    assertLine(twenty[1].mask, 0f, 1200f, 0f, 0f)
    assertArrayEquals(floatArrayOf(0f, 0.6300f, 0.7937f, 1f), twenty[1].mask.positions, 0.001f)
    assertArrayEquals(floatArrayOf(0f, 0f, 1f, 1f), twenty[1].mask.alphas, 0.0001f)
    assertArrayEquals(floatArrayOf(0f, 0.7937f, 1f, 1f), twenty[0].mask.positions, 0.001f)
    assertArrayEquals(floatArrayOf(0f, 0f, 1f, 1f), twenty[0].mask.alphas, 0.0001f)
  }

  @Test fun cappedBandsReachFullStrengthBeforeThePlateau() {
    val hundred = bands(100f)
    assertArrayEquals(floatArrayOf(0f, 0.6214f, 0.7830f, 1f), hundred[0].mask.positions, 0.001f)
    assertArrayEquals(floatArrayOf(0f, 0f, 1f, 1f), hundred[0].mask.alphas, 0.0001f)
    assertArrayEquals(floatArrayOf(0f, 0.4932f, 0.6214f, 1f), hundred[1].mask.positions, 0.001f)
  }

  @Test fun maskLineIsInNodePixels() {
    assertLine(bands(100f, scale = 1)[1].mask, 0f, 2400f, 0f, 0f)
    assertLine(bands(100f, scale = 8)[1].mask, 0f, 300f, 0f, 0f)
  }

  @Test fun offsetMovesThePlateau() {
    val band = bands(20f, offset = 0.3f)[1]
    assertLine(band.mask, 0f, 1200f, 0f, 0.3f * 2400f / 2)
    assertArrayEquals(floatArrayOf(0f, 0.6300f, 0.7937f, 1f), band.mask.positions, 0.001f)
  }

  @Test fun fullOffsetIsOneCappedBand() {
    val hundred = bands(100f, offset = 1f)
    assertEquals(1, hundred.size)
    assertEquals(217.372f, hundred[0].radius, 0.001f)
    assertArrayEquals(floatArrayOf(1f, 1f), hundred[0].mask.alphas, 0.0001f)
    assertArrayEquals(floatArrayOf(0.5f, 0.5f), bands(0.2857f, offset = 1f)[0].mask.alphas, 0.001f)
  }

  @Test fun centerStopsUseTheReach() {
    val band = bands(100f, direction = "center", offset = 0.1f)[0]
    assertLine(band.mask, 0f, 0f, 0f, 1200f)
    assertArrayEquals(floatArrayOf(0f, 0.2243f, 0.2566f, 0.7434f, 0.7757f, 1f), band.mask.positions, 0.001f)
    assertArrayEquals(floatArrayOf(0f, 0f, 1f, 1f, 0f, 0f), band.mask.alphas, 0.0001f)
    for (offset in floatArrayOf(0.3f, 0.9f)) {
      assertOrderedUnitStops("center offset $offset", bands(100f, direction = "center", offset = offset))
    }
  }

  @Test fun hugeAmountKeepsStopsOrdered() {
    for (density in floatArrayOf(1f, 4f)) {
      for (direction in arrayOf("topToBottom", "center")) {
        val huge = bands(1e6f, direction = direction, density = density)
        assertTrue(huge.size <= ProgressiveBands.COUNT)
        assertOrderedUnitStops("$direction density $density", huge)
      }
    }
  }

  @Test fun stopsAreContinuousAcrossTheCap() {
    for (direction in arrayOf("topToBottom", "center")) {
      val below = bands(47.99f, direction = direction)
      val above = bands(48.01f, direction = direction)
      assertEquals(below.size, above.size)
      for (k in below.indices) {
        assertArrayEquals("$direction band $k", below[k].mask.positions, above[k].mask.positions, 0.001f)
      }
    }
  }

  @Test fun edgesStopsUseTheReach() {
    val capped = bands(100f, direction = "edges", offset = 0.1f)
    assertArrayEquals(floatArrayOf(0f, 0.14341f, 0.17571f, 0.82429f, 0.85659f, 1f), capped[0].mask.positions, 0.001f)
  }

  @Test fun edgesStops() {
    val edges = bands(20f, direction = "edges", offset = 0.1f)
    assertLine(edges[0].mask, 0f, 0f, 0f, 1200f)
    assertArrayEquals(floatArrayOf(0f, 0.1f, 0.14126f, 0.85874f, 0.9f, 1f), edges[0].mask.positions, 0.001f)
    assertArrayEquals(floatArrayOf(1f, 1f, 0f, 0f, 1f, 1f), edges[0].mask.alphas, 0.0001f)
    assertArrayEquals(floatArrayOf(0f, 0.14126f, 0.174f, 0.826f, 0.85874f, 1f), edges[1].mask.positions, 0.001f)
    for (offset in floatArrayOf(0f, 0.3f, 1f)) {
      val list = bands(100f, direction = "edges", offset = offset)
      assertTrue("offset $offset is not solid", list.size > 1)
      for (band in list) {
        val p = band.mask.positions
        for (i in 1 until p.size) assertTrue("offset $offset: ${p.toList()}", p[i] >= p[i - 1] && p[i] <= 1f)
      }
    }
  }

  @Test fun leftAndRightRunAlongX() {
    assertLine(bands(100f, direction = "leftToRight")[1].mask, 540f, 0f, 0f, 0f)
    assertLine(bands(100f, direction = "rightToLeft")[1].mask, 0f, 0f, 540f, 0f)
  }

  @Test fun tinyViewKeepsFiniteStops() {
    val tiny = ProgressiveBands.bands(20f, "topToBottom", 0f, 1080f, 21f, 2, 2.625f)
    assertEquals(7, tiny.size)
    for (band in tiny) {
      val m = band.mask
      for (v in floatArrayOf(band.radius, m.x0, m.y0, m.x1, m.y1) + m.positions + m.alphas) assertTrue(v.isFinite())
    }
  }

  @Test fun weightsAreContinuousInAmount() {
    for (density in floatArrayOf(1f, 2.625f, 4f)) {
      for (scale in intArrayOf(1, 2, 8)) {
        var previous = FloatArray(ProgressiveBands.COUNT)
        var step = 0
        while (step <= 60_000) {
          val amount = step * 0.001f
          val weights = FloatArray(ProgressiveBands.COUNT)
          bands(amount, scale = scale, density = density).forEachIndexed { k, band -> weights[k] = weightOf(band) }
          for (k in weights.indices) {
            assertTrue("density $density scale $scale amount $amount band $k", Math.abs(weights[k] - previous[k]) < 0.02f)
          }
          previous = weights
          step++
        }
      }
    }
  }
}
