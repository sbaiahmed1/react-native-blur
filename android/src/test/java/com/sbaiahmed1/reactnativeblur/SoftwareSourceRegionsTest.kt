package com.sbaiahmed1.reactnativeblur

import com.sbaiahmed1.reactnativeblur.CaptureLane.Bounds
import com.sbaiahmed1.reactnativeblur.CaptureLane.Mode.FULL
import com.sbaiahmed1.reactnativeblur.CaptureLane.Mode.HOST
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

class SoftwareSourceRegionsTest {

  private val screen = Bounds(0, 0, 1080, 2424)
  private val bar = Bounds(0, 200, 1080, 160)

  private fun blurLane(mode: CaptureLane.Mode = FULL) = CaptureLane(8, mode, 0L, 0L)
  private fun glassLane() = CaptureLane(3, FULL, 33L, 100L)

  @Test fun fullRegionIsRoot() {
    val lane = blurLane(FULL)
    val region = lane.regionBounds(screen, bar)
    assertEquals(screen, region)
    assertEquals(135 to 303, lane.bitmapSize(region!!))
  }

  @Test fun hostRegionIsHost() {
    val lane = blurLane(HOST)
    val region = lane.regionBounds(screen, bar)
    assertEquals(bar, region)
    assertEquals(135 to 20, lane.bitmapSize(region!!))
  }

  @Test fun windowRootUsesDecorScreenBounds() {
    assertEquals(screen, blurLane(FULL).regionBounds(screen, Bounds(40, 900, 1000, 300)))
  }

  @Test fun zeroRootIsNotCaptured() {
    assertNull(blurLane(FULL).regionBounds(Bounds(0, 0, 0, 0), Bounds(0, 0, 100, 100)))
  }

  @Test fun bitmapCoversAPartialLastRowAndColumn() {
    assertEquals(136 to 293, blurLane().bitmapSize(Bounds(0, 0, 1084, 2340)))
    assertEquals(362 to 780, glassLane().bitmapSize(Bounds(0, 0, 1084, 2340)))
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

  @Test fun fullLaneCapturesTheRootOnce() {
    assertEquals(listOf<String?>(null), blurLane().captureTargets(listOf("header", "card"), emptySet()))
  }

  @Test fun nestedHostCapturesAloneBesideTheRoot() {
    assertEquals(listOf(null, "badge"), blurLane().captureTargets(listOf("card", "badge"), setOf("badge")))
  }

  @Test fun onlyNestedHostsSkipTheRoot() {
    assertEquals(listOf<String?>("glass"), glassLane().captureTargets(listOf("glass"), setOf("glass")))
  }

  @Test fun hostLaneCapturesEachHost() {
    assertEquals(listOf<String?>("a", "b"), blurLane(HOST).captureTargets(listOf("a", "b"), emptySet()))
  }

  @Test fun hostCapturingAloneInAFullLaneGetsItsOwnBounds() {
    assertEquals(bar, blurLane(FULL).regionBounds(screen, bar, alone = true))
    assertEquals(screen, blurLane(FULL).regionBounds(screen, bar, alone = false))
  }

  @Test fun nestedHostReadsItsOwnRegion() {
    assertTrue(blurLane().sharesRoot(nested = false))
    assertFalse(blurLane().sharesRoot(nested = true))
    assertFalse(blurLane(HOST).sharesRoot(nested = false))
  }
}
