package com.sbaiahmed1.reactnativeblur

import org.junit.Assert.assertEquals
import org.junit.Test

class DownsampleFactorTest {

  @Test fun nanFallsBackToTheDefault() {
    assertEquals(8f, DownsampleFactor.clamp(Float.NaN), 0f)
  }

  @Test fun clampsToOneThroughSixteen() {
    assertEquals(1f, DownsampleFactor.clamp(0f), 0f)
    assertEquals(1f, DownsampleFactor.clamp(-3f), 0f)
    assertEquals(1f, DownsampleFactor.clamp(Float.NEGATIVE_INFINITY), 0f)
    assertEquals(16f, DownsampleFactor.clamp(40f), 0f)
    assertEquals(16f, DownsampleFactor.clamp(Float.POSITIVE_INFINITY), 0f)
  }

  @Test fun keepsAFactorInRange() {
    assertEquals(1f, DownsampleFactor.clamp(1f), 0f)
    assertEquals(2.5f, DownsampleFactor.clamp(2.5f), 0f)
    assertEquals(16f, DownsampleFactor.clamp(16f), 0f)
  }
}
