package com.sbaiahmed1.reactnativeblur

import org.junit.Assert.assertArrayEquals
import org.junit.Test

class OverflowBoundsTest {
  private fun bounds(width: Int, height: Int, left: Int, top: Int, right: Int, bottom: Int): FloatArray =
    FloatArray(4).also { OverflowBounds.write(width, height, left, top, right, bottom, it) }

  @Test fun noOverflowIsTheViewBounds() =
    assertArrayEquals(floatArrayOf(0f, 0f, 100f, 50f), bounds(100, 50, 0, 0, 0, 0), 0f)

  @Test fun overflowGrowsEachEdge() =
    assertArrayEquals(floatArrayOf(-10f, -20f, 130f, 90f), bounds(100, 50, -10, -20, -30, -40), 0f)

  @Test fun zeroSizeWrapperReachesItsChildren() =
    assertArrayEquals(floatArrayOf(0f, 0f, 180f, 60f), bounds(0, 0, 0, 0, -180, -60), 0f)
}
