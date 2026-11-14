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

  @Test fun floorMatchesLegacyClamp() {
    assertEquals(20f, BlurRadius.sigmaPx(1f), 0.0001f)
    assertEquals(20f, BlurRadius.sigmaPx(10f), 0.0001f)
    assertEquals(20f, BlurRadius.sigmaPx(16f), 0.0001f)
  }

  @Test fun linearBetweenTheAnchors() {
    assertEquals(42f, BlurRadius.sigmaPx(58f), 0.0001f)
  }

  @Test fun capsAtHundred() {
    assertEquals(64f, BlurRadius.sigmaPx(100f), 0.0001f)
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
    assertTrue(BlurRadius.effectRadius(BlurRadius.sigmaPx(1f) / 8f) > 0f)
  }

  @Test fun localRadiusAtMax() {
    assertEquals((64f / 8f - 0.5f) / 0.57735f, BlurRadius.effectRadius(BlurRadius.sigmaPx(100f) / 8f), 0.001f)
  }
}
