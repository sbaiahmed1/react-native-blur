package com.sbaiahmed1.reactnativeblur

import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class MaterialMathTest {

  private val xlightTint = 0xCCF7F7F7.toInt()

  @Test fun fractionHandlesEdgeAmounts() {
    assertEquals(0f, MaterialMath.fraction(0f), 0f)
    assertEquals(0f, MaterialMath.fraction(-5f), 0f)
    assertEquals(0.1f, MaterialMath.fraction(Float.NaN), 0f)
    assertEquals(0.1f, MaterialMath.fraction(Float.POSITIVE_INFINITY), 0f)
    assertEquals(0.1f, MaterialMath.fraction(Float.NEGATIVE_INFINITY), 0f)
    assertEquals(1f, MaterialMath.fraction(250f), 0f)
    assertEquals(0.5f, MaterialMath.fraction(50f), 0f)
  }

  @Test fun sigmaScalesWithAmountAndDensity() {
    assertEquals(38.59f, MaterialMath.sigmaPx(50f, 29.4f, 2.625f), 0.01f)
    assertEquals(0f, MaterialMath.sigmaPx(0f, 29.4f, 2.625f), 0f)
  }

  @Test fun tintScalesTheAlphaOnly() {
    val tint = MaterialMath.tint(50f, xlightTint)
    assertEquals(0x66, tint ushr 24)
    assertEquals(xlightTint and 0xFFFFFF, tint and 0xFFFFFF)
    assertEquals(xlightTint, MaterialMath.tint(100f, xlightTint))
    assertEquals(0, MaterialMath.tint(0f, xlightTint) ushr 24)
  }

  @Test fun saturationRunsFromOneToTheToken() {
    assertEquals(1f, MaterialMath.saturation(0f, 1.8f), 0.0001f)
    assertEquals(1.2f, MaterialMath.saturation(25f, 1.8f), 0.0001f)
    assertEquals(1.8f, MaterialMath.saturation(100f, 1.8f), 0.0001f)
  }

  @Test fun saturationMatrixKeepsGrays() {
    for (s in floatArrayOf(0.5f, 3f)) {
      val m = MaterialMath.saturationMatrix(s)
      assertEquals(20, m.size)
      for (row in 0 until 3) {
        val gray = 0.4f
        val out = (m[row * 5] + m[row * 5 + 1] + m[row * 5 + 2]) * gray + m[row * 5 + 4]
        assertEquals(gray, out, 0.0001f)
      }
      assertEquals(1f, m[18], 0f)
    }
  }

  @Test fun saturationMatrixScalesChroma() {
    val m = MaterialMath.saturationMatrix(2f)
    // Pure red at s 2: luma 0.2126, red moves twice as far from it.
    val red = m[0]
    assertEquals(0.2126f + 2f * (1f - 0.2126f), red, 0.0001f)
  }

  @Test fun legacyAmountInvertsTheSigmaTable() {
    for (amount in floatArrayOf(1f, 16f, 58f, 100f)) {
      assertEquals(amount, MaterialMath.legacyAmount(BlurRadius.sigmaPx(amount)), 0.001f)
    }
    assertEquals(0f, MaterialMath.legacyAmount(0f), 0f)
    assertEquals(100f, MaterialMath.legacyAmount(500f), 0f)
  }

  @Test fun unsetMaterialKeepsTheLegacyLook() {
    assertEquals(0x781A1616, BlurType.fromString("dark").overlayColor)
    assertEquals(0x8CF5F5F5.toInt(), BlurType.fromString("systemMaterial").overlayColor)
    assertEquals(
      MaterialDrawSpec(BlurRadius.sigmaPx(10f), BlurType.fromString("dark").overlayColor, 1f),
      MaterialMath.drawSpec(10f, -1f, null, -1f, 2.625f, "dark")
    )
    assertEquals(
      MaterialDrawSpec(BlurRadius.sigmaPx(100f), BlurType.fromString("systemMaterial").overlayColor, 1f),
      MaterialMath.drawSpec(100f, -1f, xlightTint, 1.8f, 2.625f, "systemMaterial")
    )
  }

  @Test fun setMaterialDrawsTheToken() {
    val spec = MaterialMath.drawSpec(50f, 29.4f, xlightTint, 1.8f, 2.625f, "xlight")
    assertEquals(38.59f, spec.sigmaPx, 0.01f)
    assertEquals(0x66, spec.overlayColor ushr 24)
    assertEquals(xlightTint and 0xFFFFFF, spec.overlayColor and 0xFFFFFF)
    assertEquals(1.4f, spec.saturation, 0.0001f)
  }

  @Test fun nodeRadiusSubtractsTheDownsampleBlur() {
    // 20 px on an 8x node: a Gaussian of sqrt(20^2 - 4.64^2) = 19.454 px, 2.432 node px.
    assertEquals((19.454f / 8f - 0.5f) / 0.57735f, MaterialMath.nodeEffectRadius(20f, 8), 0.002f)
  }

  @Test fun nodeRadiusKeepsTheDrawFloor() {
    assertEquals(0f, MaterialMath.nodeEffectRadius(4f, 8), 0f)
    assertEquals(0f, MaterialMath.nodeEffectRadius(0f, 8), 0f)
    // Just above half a node px the backdrop draws with the smallest Gaussian hwui has.
    assertTrue(MaterialMath.nodeEffectRadius(4.1f, 8) > 0f)
    assertTrue(MaterialMath.nodeEffectRadius(5f, 8) < 0.05f)
  }

  @Test fun nodeRadiusNeverDecreasesOrJumps() {
    var previous = 0f
    for (step in 1..1200) {
      val radius = MaterialMath.nodeEffectRadius(step * 0.05f, 8)
      assertTrue(radius >= previous)
      assertTrue(radius - previous < 0.05f)
      previous = radius
    }
  }

  @Test fun undownsampledNodeKeepsThePlainRadius() {
    assertEquals(BlurRadius.effectRadius(20f), MaterialMath.nodeEffectRadius(20f, 1), 0.0001f)
  }

  @Test fun halfSetMaterialDrawsNoTintAndNoSaturation() {
    val spec = MaterialMath.drawSpec(100f, 19.1f, null, -1f, 2f, "dark")
    assertEquals(38.2f, spec.sigmaPx, 0.001f)
    assertEquals(0, spec.overlayColor)
    assertEquals(1f, spec.saturation, 0f)
  }
}
