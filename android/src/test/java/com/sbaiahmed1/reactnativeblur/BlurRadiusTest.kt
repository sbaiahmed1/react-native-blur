package com.sbaiahmed1.reactnativeblur

import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class BlurRadiusTest {

  @Test fun zeroAndNegativeGiveNoBlur() {
    assertEquals(0f, BlurRadius.sigmaPx(0f), 0f)
    assertEquals(0f, BlurRadius.sigmaPx(-5f), 0f)
  }

  @Test fun nanUsesDefault() {
    assertEquals(BlurRadius.sigmaPx(10f), BlurRadius.sigmaPx(Float.NaN), 0f)
  }

  @Test fun rampsFromZeroToTheFloor() {
    assertEquals(1.25f, BlurRadius.sigmaPx(1f), 0.0001f)
    assertEquals(10f, BlurRadius.sigmaPx(8f), 0.0001f)
    assertEquals(12.5f, BlurRadius.sigmaPx(10f), 0.0001f)
    assertEquals(20f, BlurRadius.sigmaPx(16f), 0.0001f)
  }

  @Test fun animatingThroughZeroHasNoJump() {
    assertTrue(BlurRadius.sigmaPx(0.01f) < 0.1f)
    for (step in 0 until 1600) {
      val amount = step / 100f
      assertTrue(BlurRadius.sigmaPx(amount + 0.01f) - BlurRadius.sigmaPx(amount) < 0.1f)
    }
  }

  @Test fun linearBetweenTheAnchors() {
    assertEquals(30f, BlurRadius.sigmaPx(58f), 0.0001f)
  }

  @Test fun capsAtHundred() {
    assertEquals(40f, BlurRadius.sigmaPx(100f), 0.0001f)
    assertEquals(BlurRadius.sigmaPx(100f), BlurRadius.sigmaPx(150f), 0f)
  }

  @Test fun monotonic() {
    for (amount in 0 until 100) {
      assertTrue(BlurRadius.sigmaPx(amount.toFloat()) <= BlurRadius.sigmaPx(amount + 1f))
    }
  }

  @Test fun effectRadiusInvertsSkia() {
    assertEquals(30f, BlurRadius.effectRadius(0.57735f * 30f + 0.5f), 0.001f)
    assertEquals(0f, BlurRadius.effectRadius(0.5f), 0f)
  }

  @Test fun localRadiusAtFloorIsPositive() {
    assertTrue(BlurRadius.effectRadius(BlurRadius.sigmaPx(BlurRadius.FLOOR_AMOUNT) / 8f) > 0f)
  }

  @Test fun localRadiusAtMax() {
    assertEquals((40f / 8f - 0.5f) / 0.57735f, BlurRadius.effectRadius(BlurRadius.sigmaPx(100f) / 8f), 0.001f)
  }

  @Test fun platformRadiusUsesTheFullSigma() =
    assertEquals(BlurRadius.effectRadius(40f), BlurRadius.radius(100f, scale = 1), 1e-4f)

  @Test fun capturedRadiusDividesByTheScale() =
    assertEquals(BlurRadius.effectRadius(5f), BlurRadius.radius(100f, scale = 8), 1e-4f)
}
