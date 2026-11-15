package com.sbaiahmed1.reactnativeblur

import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class TrailingDeadlineTest {
  @Test fun firstRequestPosts() = assertTrue(TrailingDeadline().request(nowMs = 10, delayMs = 90))

  @Test fun earlierRequestReplacesTheLaterOne() {
    val deadline = TrailingDeadline()
    deadline.request(nowMs = 10, delayMs = 90)
    assertTrue(deadline.request(nowMs = 32, delayMs = 1))
  }

  @Test fun laterRequestKeepsThePendingOne() {
    val deadline = TrailingDeadline()
    deadline.request(nowMs = 0, delayMs = 33)
    assertFalse(deadline.request(nowMs = 10, delayMs = 90))
  }

  @Test fun requestAfterTheCallbackRanPosts() {
    val deadline = TrailingDeadline()
    deadline.request(nowMs = 0, delayMs = 33)
    deadline.clear()
    assertTrue(deadline.request(nowMs = 40, delayMs = 90))
  }
}
