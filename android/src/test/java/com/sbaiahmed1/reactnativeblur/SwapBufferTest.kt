package com.sbaiahmed1.reactnativeblur

import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotSame
import org.junit.Assert.assertNull
import org.junit.Assert.assertSame
import org.junit.Test

class SwapBufferTest {
  private class Buffer(val width: Int, val height: Int)

  private var created = 0
  private val buffers = SwapBuffer({ w, h -> created++; Buffer(w, h) }) { it.width to it.height }

  @Test fun nothingIsPublishedBeforeTheFirstDraw() {
    buffers.spare(10, 20)
    assertNull(buffers.published)
  }

  @Test fun publishShowsTheDrawnBuffer() {
    val drawn = buffers.spare(10, 20)
    buffers.publish()
    assertSame(drawn, buffers.published)
  }

  @Test fun aFailedDrawKeepsThePublishedBuffer() {
    val first = buffers.spare(10, 20)
    buffers.publish()
    val second = buffers.spare(10, 20)
    assertNotSame(first, second)
    assertSame(first, buffers.published)
  }

  @Test fun theTwoBuffersAlternate() {
    val first = buffers.spare(10, 20)
    buffers.publish()
    val second = buffers.spare(10, 20)
    buffers.publish()
    assertSame(first, buffers.spare(10, 20))
    assertSame(second, buffers.published)
    assertEquals(2, created)
  }

  @Test fun aNewSizeGetsANewSpare() {
    val first = buffers.spare(10, 20)
    val resized = buffers.spare(30, 20)
    assertNotSame(first, resized)
    assertEquals(30, resized.width)
  }
}
