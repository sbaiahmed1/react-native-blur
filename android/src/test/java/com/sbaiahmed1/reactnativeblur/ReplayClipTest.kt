package com.sbaiahmed1.reactnativeblur

import org.junit.Assert.assertArrayEquals
import org.junit.Assert.assertEquals
import org.junit.Test

class ReplayClipTest {
  private val out = FloatArray(4)

  @Test fun noPaddingMeansNoClip() =
    assertEquals(false, ReplayClip.paddingBox(true, 0, 0, 100, 50, 0, 0, 0, 0, out))

  @Test fun clipToPaddingOffMeansNoClip() =
    assertEquals(false, ReplayClip.paddingBox(false, 0, 0, 100, 50, 4, 4, 4, 4, out))

  // ViewGroup.dispatchDraw clips in the scrolled space: the scroll offset plus the padding.
  @Test fun thePaddingBoxFollowsTheScroll() {
    assertEquals(true, ReplayClip.paddingBox(true, 10, 200, 100, 50, 4, 6, 8, 2, out))
    assertArrayEquals(floatArrayOf(14f, 206f, 102f, 248f), out, 0f)
  }
}
