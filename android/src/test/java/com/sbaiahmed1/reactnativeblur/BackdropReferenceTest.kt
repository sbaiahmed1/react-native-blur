package com.sbaiahmed1.reactnativeblur

import org.junit.Assert.assertEquals
import org.junit.Test

class BackdropReferenceTest {
  @Test fun aViewHoldingNoHostGoesByNode() = assertEquals(BackdropReference.NODE, BackdropReference.of(fullLeaves = 0, leafCount = 0))

  @Test fun aViewWhoseLeavesAreAllFullGoesByNode() = assertEquals(BackdropReference.NODE, BackdropReference.of(fullLeaves = 3, leafCount = 3))

  @Test fun aViewWithNoFullLeafIsFlat() = assertEquals(BackdropReference.FLAT, BackdropReference.of(fullLeaves = 0, leafCount = 2))

  @Test fun aViewWithSomeFullLeavesIsReplayed() = assertEquals(BackdropReference.REPLAY, BackdropReference.of(fullLeaves = 1, leafCount = 4))
}
