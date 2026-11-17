package com.sbaiahmed1.reactnativeblur

import com.sbaiahmed1.reactnativeblur.AnimationDeferral.Decision.CAPTURE
import com.sbaiahmed1.reactnativeblur.AnimationDeferral.Decision.CAPTURE_FAIL_SAFE
import com.sbaiahmed1.reactnativeblur.AnimationDeferral.Decision.SKIP
import org.junit.Assert.assertEquals
import org.junit.Test

class AnimationDeferralTest {

  // Runs pending new frames at 0, 35, ..., 1015 and returns the 30th decision, the one that trips.
  private fun AnimationDeferral.tripFromZero(): AnimationDeferral.Decision {
    for (frame in 0 until 29) assertEquals(SKIP, onFrame(frame * 35L, true))
    return onFrame(29 * 35L, true)
  }

  @Test fun capturesWhenNoAnimation() {
    assertEquals(CAPTURE, AnimationDeferral().onFrame(0, false))
  }

  @Test fun skipsWhileAnimationPending() {
    val deferral = AnimationDeferral()
    assertEquals(SKIP, deferral.onFrame(0, true))
    assertEquals(SKIP, deferral.onFrame(16, true))
  }

  @Test fun settlesThreeFramesAfterClear() {
    val deferral = AnimationDeferral()
    deferral.onFrame(0, true)
    assertEquals(SKIP, deferral.onFrame(16, false))
    assertEquals(SKIP, deferral.onFrame(32, false))
    assertEquals(SKIP, deferral.onFrame(48, false))
    assertEquals(CAPTURE, deferral.onFrame(64, false))
  }

  @Test fun failSafeNeedsTimeAndFrames() {
    assertEquals(CAPTURE_FAIL_SAFE, AnimationDeferral().tripFromZero())
  }

  @Test fun stallDoesNotTripFailSafe() {
    val deferral = AnimationDeferral()
    for (time in longArrayOf(0, 400, 1200, 1300)) {
      assertEquals(SKIP, deferral.onFrame(time, true))
    }
  }

  @Test fun fastFramesDoNotTripFailSafeEarly() {
    val deferral = AnimationDeferral()
    for (time in 0L..992L step 16) assertEquals(SKIP, deferral.onFrame(time, true))
    assertEquals(CAPTURE_FAIL_SAFE, deferral.onFrame(1008, true))
  }

  @Test fun trippedRunCapturesUntilClear() {
    val deferral = AnimationDeferral()
    deferral.tripFromZero()
    assertEquals(CAPTURE, deferral.onFrame(1050, true))
    assertEquals(CAPTURE, deferral.onFrame(1085, true))
    assertEquals(SKIP, deferral.onFrame(1100, false))
    assertEquals(SKIP, deferral.onFrame(1116, false))
    assertEquals(SKIP, deferral.onFrame(1132, false))
    assertEquals(CAPTURE, deferral.onFrame(1148, false))
  }

  @Test fun gapStartsNewRun() {
    val deferral = AnimationDeferral()
    deferral.tripFromZero()
    assertEquals(SKIP, deferral.onFrame(1015 + 1001, true))
  }

  @Test fun rearmForgetsFailSafeKeepsSettle() {
    val tripped = AnimationDeferral()
    tripped.tripFromZero()
    tripped.rearm()
    assertEquals(SKIP, tripped.onFrame(1050, true))

    val settling = AnimationDeferral()
    settling.onFrame(0, true)
    settling.rearm()
    assertEquals(SKIP, settling.onFrame(16, false))
  }

  @Test fun pendingWithoutNewFrameSkipsAndDoesNotCount() {
    val deferral = AnimationDeferral()
    assertEquals(CAPTURE, deferral.onFrame(0, false))
    assertEquals(SKIP, deferral.onFrame(1, true, newFrame = false))
    for (frame in 1..29) assertEquals(SKIP, deferral.onFrame(frame * 35L, true))
    repeat(50) { assertEquals(SKIP, deferral.onFrame(1015, true, newFrame = false)) }
    assertEquals(CAPTURE_FAIL_SAFE, deferral.onFrame(1050, true))
  }

  @Test fun settleCountsOnlyNewFrames() {
    val deferral = AnimationDeferral()
    deferral.onFrame(0, true)
    assertEquals(SKIP, deferral.onFrame(16, false, newFrame = false))
    assertEquals(SKIP, deferral.onFrame(17, false, newFrame = false))
    assertEquals(SKIP, deferral.onFrame(32, false))
    assertEquals(SKIP, deferral.onFrame(48, false))
    assertEquals(SKIP, deferral.onFrame(64, false))
    assertEquals(CAPTURE, deferral.onFrame(80, false))
  }
}
