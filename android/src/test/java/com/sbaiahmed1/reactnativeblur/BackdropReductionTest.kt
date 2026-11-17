package com.sbaiahmed1.reactnativeblur

import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class BackdropReductionTest {
  @Test fun blurRecordsAtFullSizeAndHalvesThreeTimes() = assertEquals(3, BackdropReduction.hops(BackdropScale.BLUR))

  @Test fun glassRecordsAtFullSizeAndHalvesOnce() = assertEquals(1, BackdropReduction.hops(BackdropScale.GLASS))

  @Test fun fullScaleIsNotHalved() = assertEquals(0, BackdropReduction.hops(1))

  @Test fun halfScaleHalvesOnce() = assertEquals(1, BackdropReduction.hops(2))

  @Test fun nonPowerOfTwoScaleIsNotHalved() = assertEquals(0, BackdropReduction.hops(6))

  @Test fun higherPowersOfTwoHalveMoreTimes() {
    assertEquals(2, BackdropReduction.hops(4))
    assertEquals(4, BackdropReduction.hops(16))
  }

  @Test fun nodeSizeRoundsUpAndNeverReachesZero() {
    assertEquals(135, BackdropReduction.nodeSize(1080, 8))
    assertEquals(136, BackdropReduction.nodeSize(1081, 8))
    assertEquals(1, BackdropReduction.nodeSize(0, 8))
  }

  @Test fun nodeSizeMatchesTheFloatCeilingItReplaced() {
    for (downsample in listOf(BackdropScale.GLASS, BackdropScale.BLUR)) {
      for (px in 0..4096) {
        val expected = kotlin.math.ceil(px / downsample.toFloat()).toInt().coerceAtLeast(1)
        assertEquals("px $px at $downsample", expected, BackdropReduction.nodeSize(px, downsample))
      }
    }
  }

  @Test fun powerOfTwoScalesRecordAtFullSize() {
    for (downsample in listOf(2, 4, 8, 16)) {
      assertEquals(1, BackdropReduction.recordScale(downsample))
      assertEquals(downsample, BackdropReduction.recordScale(downsample) shl BackdropReduction.hops(downsample))
    }
  }

  @Test fun unhalvedScaleRecordsAtItself() = assertEquals(3, BackdropReduction.recordScale(3))

  @Test fun firstLevelCoversTheNodeAtTheRecordScale() {
    val hops = BackdropReduction.hops(8)
    for (width in listOf(1, 7, 8, 9, 1080, 1081, 1087)) {
      val node = BackdropReduction.nodeSize(width, 8)
      val first = BackdropReduction.levelSize(node, hops, 0)
      assertEquals("width $width", node * 8, first * BackdropReduction.recordScale(8))
      assertTrue("width $width first level $first", first * BackdropReduction.recordScale(8) >= width)
    }
  }
}
