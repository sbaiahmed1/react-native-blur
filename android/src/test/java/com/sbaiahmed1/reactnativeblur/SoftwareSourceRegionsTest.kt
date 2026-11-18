package com.sbaiahmed1.reactnativeblur

import com.sbaiahmed1.reactnativeblur.CaptureLane.Bounds
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

class SoftwareSourceRegionsTest {

  private val screen = Bounds(0, 0, 1080, 2424)
  private val bar = Bounds(0, 200, 1080, 160)

  private fun blurLane() = CaptureLane(8, 0L, 0L)
  private fun glassLane() = CaptureLane(3, 33L, 100L)

  @Test fun fullRegionIsRoot() {
    val lane = blurLane()
    val region = lane.regionBounds(screen, bar)
    assertEquals(screen, region)
    assertEquals(135 to 303, lane.bitmapSize(region!!))
  }

  @Test fun windowRootUsesDecorScreenBounds() {
    assertEquals(screen, blurLane().regionBounds(screen, Bounds(40, 900, 1000, 300)))
  }

  @Test fun zeroRootIsNotCaptured() {
    assertNull(blurLane().regionBounds(Bounds(0, 0, 0, 0), Bounds(0, 0, 100, 100)))
  }

  @Test fun bitmapCoversAPartialLastRowAndColumn() {
    assertEquals(136 to 293, blurLane().bitmapSize(Bounds(0, 0, 1084, 2340)))
    assertEquals(362 to 780, glassLane().bitmapSize(Bounds(0, 0, 1084, 2340)))
  }

  @Test fun transformedHostBoundsRoundOutward() {
    assertEquals(Bounds(10, 20, 101, 51), Bounds.enclosing(10.4f, 20.6f, 110.2f, 70.1f))
  }

  @Test fun scaledHostBoundsCoverTheScaledSize() {
    assertEquals(Bounds(-50, 0, 200, 100), Bounds.enclosing(-50f, 0f, 150f, 100f))
  }

  @Test fun regionNeverZero() {
    assertEquals(1 to 1, blurLane().bitmapSize(Bounds(0, 0, 5, 5)))
  }

  @Test fun blurLaneDueEveryFrame() {
    val lane = blurLane()
    assertTrue(lane.isDue(0, false))
    lane.onCaptureResult(0, true)
    assertTrue(lane.isDue(1, false))
  }

  @Test fun glassLaneUsesMotionAndIdleCadence() {
    val lane = glassLane()
    lane.onCaptureResult(0, true)
    assertFalse(lane.isDue(20, true))
    assertTrue(lane.isDue(34, true))
    assertFalse(lane.isDue(50, false))
    assertTrue(lane.isDue(101, false))
  }

  @Test fun progressiveAtTheGlassScaleCapturesEveryFrame() {
    val lane = SoftwareSource.laneFor(LaneKey(BackdropScale.PROGRESSIVE, throttled = false))
    lane.onCaptureResult(0, true)
    assertTrue(lane.isDue(1, false))
    assertTrue(lane.isDue(1, true))
  }

  @Test fun glassKeepsItsCadenceAtTheSameScale() {
    val lane = SoftwareSource.laneFor(LaneKey(BackdropScale.GLASS, throttled = true))
    lane.onCaptureResult(0, true)
    assertFalse(lane.isDue(20, true))
    assertFalse(lane.isDue(50, false))
    assertTrue(lane.isDue(101, false))
  }

  @Test fun glassAndProgressiveAtOneScaleGetTwoLanes() {
    assertTrue(LaneKey(BackdropScale.GLASS, throttled = true) != LaneKey(BackdropScale.PROGRESSIVE, throttled = false))
  }

  @Test fun remainingMsCountsToTheNextDueTime() {
    val lane = glassLane()
    lane.onCaptureResult(0, true)
    assertEquals(13L, lane.remainingMs(20, true))
    assertEquals(50L, lane.remainingMs(50, false))
    assertEquals(0L, lane.remainingMs(120, false))
  }

  @Test fun failureBackoffRetriesAfter500ms() {
    val lane = glassLane()
    lane.onCaptureResult(0, false)
    assertFalse(lane.isDue(499, true))
    assertTrue(lane.isDue(500, true))
  }

  @Test fun successClearsBackoff() {
    val lane = glassLane()
    lane.onCaptureResult(0, false)
    lane.onCaptureResult(500, true)
    assertTrue(lane.isDue(534, true))
  }

  @Test fun failedCaptureAsksForARetryFrame() {
    val lane = blurLane()
    lane.onCaptureResult(100, false)
    assertEquals(500L, lane.retryDelayMs(100))
    assertEquals(200L, lane.retryDelayMs(400))
  }

  @Test fun noRetryFrameWithoutAFailure() {
    val lane = blurLane()
    assertNull(lane.retryDelayMs(0))
    lane.onCaptureResult(0, false)
    lane.onCaptureResult(500, true)
    assertNull(lane.retryDelayMs(500))
  }

  @Test fun fullLaneCapturesTheRootOnce() {
    assertEquals(listOf<String?>(null), blurLane().captureTargets(listOf("header", "card"), emptySet()))
  }

  @Test fun nestedHostCapturesAloneBesideTheRoot() {
    assertEquals(listOf(null, "badge"), blurLane().captureTargets(listOf("card", "badge"), setOf("badge")))
  }

  @Test fun onlyNestedHostsSkipTheRoot() {
    assertEquals(listOf<String?>("glass"), glassLane().captureTargets(listOf("glass"), setOf("glass")))
  }

  @Test fun hostCapturingAloneInAFullLaneGetsItsOwnBounds() {
    assertEquals(bar, blurLane().regionBounds(screen, bar, alone = true))
    assertEquals(screen, blurLane().regionBounds(screen, bar, alone = false))
  }

  @Test fun nestedHostReadsItsOwnRegion() {
    assertTrue(blurLane().sharesRoot(nested = false))
    assertFalse(blurLane().sharesRoot(nested = true))
  }
}
