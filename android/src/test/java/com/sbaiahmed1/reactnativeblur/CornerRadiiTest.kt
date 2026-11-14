package com.sbaiahmed1.reactnativeblur

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class CornerRadiiTest {

  @Test fun unsetCornersUseBase() {
    val radii = CornerRadii.resolve(10f, -1f, -1f, -1f, -1f, 2f)
    assertEquals(CornerRadii.Px(20f, 20f, 20f, 20f), radii)
    assertTrue(radii.isUniform)
  }

  @Test fun explicitZeroSquaresCorner() {
    val radii = CornerRadii.resolve(10f, 0f, -1f, -1f, -1f, 2f)
    assertEquals(0f, radii.topLeft, 0f)
    assertFalse(radii.isUniform)
  }

  @Test fun perCornerOverridesBase() {
    assertEquals(CornerRadii.Px(12f, 24f, 36f, 48f), CornerRadii.resolve(0f, 4f, 8f, 12f, 16f, 3f))
  }
}
