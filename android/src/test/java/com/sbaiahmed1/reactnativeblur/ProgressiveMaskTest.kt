package com.sbaiahmed1.reactnativeblur

import org.junit.Assert.assertArrayEquals
import org.junit.Assert.assertEquals
import org.junit.Test

class ProgressiveMaskTest {

  private val rampPositions = floatArrayOf(0f, 0.15f, 0.3f, 0.45f, 0.6f, 0.75f, 1f)
  private val rampAlphas = floatArrayOf(0f, 0.08f, 0.3f, 0.52f, 0.75f, 0.9f, 1f)

  private fun assertLine(spec: MaskSpec, x0: Float, y0: Float, x1: Float, y1: Float) {
    assertEquals(x0, spec.x0, 0.001f)
    assertEquals(y0, spec.y0, 0.001f)
    assertEquals(x1, spec.x1, 0.001f)
    assertEquals(y1, spec.y1, 0.001f)
  }

  @Test fun normalizesAliases() {
    assertEquals("bottomToTop", ProgressiveMask.normalizeDirection("blurredBottomClearTop"))
    assertEquals("bottomToTop", ProgressiveMask.normalizeDirection("bottom"))
    assertEquals("topToBottom", ProgressiveMask.normalizeDirection("blurredTopClearBottom"))
    assertEquals("center", ProgressiveMask.normalizeDirection("center"))
    assertEquals("leftToRight", ProgressiveMask.normalizeDirection("blurredLeftToClearRight"))
    assertEquals("rightToLeft", ProgressiveMask.normalizeDirection("right"))
    assertEquals("edges", ProgressiveMask.normalizeDirection("blurredTopAndBottomClearCenter"))
    assertEquals("edges", ProgressiveMask.normalizeDirection("edges"))
    assertEquals("topToBottom", ProgressiveMask.normalizeDirection("x"))
  }

  @Test fun topToBottomAtZero() {
    val spec = ProgressiveMask.spec("topToBottom", 0f, 100f, 400f)
    assertLine(spec, 0f, 400f, 0f, 0f)
    assertArrayEquals(rampPositions, spec.positions, 0.0001f)
    assertArrayEquals(rampAlphas, spec.alphas, 0.0001f)
  }

  @Test fun bottomToTopHalfOffset() {
    assertLine(ProgressiveMask.spec("bottomToTop", 0.5f, 100f, 400f), 0f, 0f, 0f, 200f)
  }

  @Test fun leftAndRight() {
    assertLine(ProgressiveMask.spec("leftToRight", 0.25f, 200f, 100f), 200f, 0f, 50f, 0f)
    assertLine(ProgressiveMask.spec("rightToLeft", 0.25f, 200f, 100f), 0f, 0f, 150f, 0f)
  }

  @Test fun fullOffsetIsSolid() {
    val spec = ProgressiveMask.spec("topToBottom", 1f, 100f, 400f)
    assertArrayEquals(floatArrayOf(1f, 1f), spec.alphas, 0f)
    assertArrayEquals(floatArrayOf(0f, 1f), spec.positions, 0f)
  }

  @Test fun centerStops() {
    val spec = ProgressiveMask.spec("center", 0.1f, 100f, 400f)
    assertLine(spec, 0f, 0f, 0f, 400f)
    assertArrayEquals(floatArrayOf(0f, 0.1f, 0.3f, 0.7f, 0.9f, 1f), spec.positions, 0.0001f)
    assertArrayEquals(floatArrayOf(0f, 0f, 1f, 1f, 0f, 0f), spec.alphas, 0f)
  }

  @Test fun edgesStops() {
    val spec = ProgressiveMask.spec("edges", 0.1f, 100f, 400f)
    assertLine(spec, 0f, 0f, 0f, 400f)
    assertArrayEquals(floatArrayOf(0f, 0.1f, 0.3f, 0.7f, 0.9f, 1f), spec.positions, 0.0001f)
    assertArrayEquals(floatArrayOf(1f, 1f, 0f, 0f, 1f, 1f), spec.alphas, 0f)
    assertArrayEquals(floatArrayOf(0f, 0.3f, 0.5f, 0.5f, 0.7f, 1f), ProgressiveMask.spec("edges", 1f, 100f, 400f).positions, 0.0001f)
    assertArrayEquals(floatArrayOf(0f, 0f, 0.2f, 0.8f, 1f, 1f), ProgressiveMask.spec("edges", 0f, 100f, 400f).positions, 0.0001f)
  }

  private fun cube(t: Float) = t * t * t

  @Test fun tintStopsFollowTheCube() {
    val spec = ProgressiveMask.tintSpec("topToBottom", 0f, 100f, 400f)
    assertLine(spec, 0f, 400f, 0f, 0f)
    assertEquals(9, ProgressiveMask.TINT_STOPS)
    assertArrayEquals(FloatArray(9) { it / 8f }, spec.positions, 0.0001f)
    assertArrayEquals(FloatArray(9) { cube(it / 8f) }, spec.alphas, 0.0001f)
    assertEquals(0.125f, spec.alphas[4], 0.0001f)
  }

  @Test fun tintRunsOnTheBlurLine() {
    assertLine(ProgressiveMask.tintSpec("bottomToTop", 0.5f, 100f, 400f), 0f, 0f, 0f, 200f)
    assertLine(ProgressiveMask.tintSpec("leftToRight", 0.25f, 200f, 100f), 200f, 0f, 50f, 0f)
    assertLine(ProgressiveMask.tintSpec("rightToLeft", 0.25f, 200f, 100f), 0f, 0f, 150f, 0f)
  }

  @Test fun tintIsSolidAtFullOffset() {
    val spec = ProgressiveMask.tintSpec("topToBottom", 1f, 100f, 400f)
    assertArrayEquals(floatArrayOf(1f, 1f), spec.alphas, 0f)
    assertArrayEquals(floatArrayOf(0f, 1f), spec.positions, 0f)
  }

  @Test fun centerTintEasesIntoThePlateauFromBothEdges() {
    val spec = ProgressiveMask.tintSpec("center", 0.1f, 100f, 400f)
    assertLine(spec, 0f, 0f, 0f, 400f)
    val positions = floatArrayOf(0f) + FloatArray(9) { 0.1f + 0.2f * it / 8f } + FloatArray(9) { 0.7f + 0.2f * it / 8f } + 1f
    val alphas = floatArrayOf(0f) + FloatArray(9) { cube(it / 8f) } + FloatArray(9) { cube(1f - it / 8f) } + 0f
    assertArrayEquals(positions, spec.positions, 0.0001f)
    assertArrayEquals(alphas, spec.alphas, 0.0001f)
    assertEquals(0.125f, spec.alphas[5], 0.0001f)
  }

  @Test fun edgesTintEasesOutOfBothPlateaus() {
    val spec = ProgressiveMask.tintSpec("edges", 0.1f, 100f, 400f)
    val positions = floatArrayOf(0f) + FloatArray(9) { 0.1f + 0.2f * it / 8f } + FloatArray(9) { 0.7f + 0.2f * it / 8f } + 1f
    val alphas = floatArrayOf(1f) + FloatArray(9) { cube(1f - it / 8f) } + FloatArray(9) { cube(it / 8f) } + 1f
    assertArrayEquals(positions, spec.positions, 0.0001f)
    assertArrayEquals(alphas, spec.alphas, 0.0001f)
  }

  @Test fun tintPrefersTheMaterial() {
    assertEquals(0x4DFFFFFF, ProgressiveMask.tintColor(0x4DFFFFFF, "dark"))
    assertEquals(BlurType.fromString("dark").overlayColor, ProgressiveMask.tintColor(null, "dark"))
  }

  @Test fun overlayColorsScaleTheAlphaByte() {
    val colors = ProgressiveMask.overlayColors(0x23FFFFFF, floatArrayOf(0f, 0.5f, 1f))
    assertArrayEquals(intArrayOf(0x00FFFFFF, 0x12FFFFFF, 0x23FFFFFF), colors)
  }

}
