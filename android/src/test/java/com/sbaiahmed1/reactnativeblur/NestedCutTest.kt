package com.sbaiahmed1.reactnativeblur

import org.junit.Assert.assertEquals
import org.junit.Test

class NestedCutTest {
  private fun ancestor(level: Int, opaque: Boolean = true, containsHost: Boolean = true) = NestedCut.Ancestor(level, opaque, containsHost)

  @Test fun cutsAtTheNearestOpaqueAncestor() =
    assertEquals(5, NestedCut.startLevel(listOf(ancestor(2), ancestor(5)), windowOpaque = true))

  @Test fun skipsAnAncestorThatDoesNotContainTheHost() =
    assertEquals(2, NestedCut.startLevel(listOf(ancestor(2), ancestor(5, containsHost = false)), windowOpaque = true))

  @Test fun skipsNonOpaqueAncestors() =
    assertEquals(2, NestedCut.startLevel(listOf(ancestor(2), ancestor(5, opaque = false)), windowOpaque = true))

  @Test fun noCutInATranslucentWindow() = assertEquals(0, NestedCut.startLevel(listOf(ancestor(5)), windowOpaque = false))

  @Test fun noAncestorsMeansLevelZero() = assertEquals(0, NestedCut.startLevel(emptyList(), windowOpaque = true))

  @Test fun aRecordedBlurIsOpaque() = assertEquals(true, NestedCut.isOpaqueBlur(effectRadius = 2f, recorded = true, platform = false))

  @Test fun aBlurWithNoRadiusOrNoRecordingIsNotOpaque() {
    assertEquals(false, NestedCut.isOpaqueBlur(effectRadius = 0f, recorded = true, platform = false))
    assertEquals(false, NestedCut.isOpaqueBlur(effectRadius = 2f, recorded = false, platform = false))
  }

  // Android's own backdrop records only a transparent fill into the node.
  @Test fun aPlatformBackdropIsNeverOpaque() =
    assertEquals(false, NestedCut.isOpaqueBlur(effectRadius = 2f, recorded = true, platform = true))

  @Test fun noOpaqueAncestorMeansLevelZero() =
    assertEquals(0, NestedCut.startLevel(listOf(ancestor(3, opaque = false), ancestor(6, containsHost = false)), windowOpaque = true))
}
