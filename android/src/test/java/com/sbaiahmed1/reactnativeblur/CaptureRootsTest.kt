package com.sbaiahmed1.reactnativeblur

import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Test

class CaptureRootsTest {
  @Test fun modalWindowComesBeforeAScreen() =
    assertEquals(SoftwareRoot.WINDOW, CaptureRoots.softwareRoot(otherWindow = true, ancestorRoot = true, activity = true))

  @Test fun screenInTheActivityWindow() =
    assertEquals(SoftwareRoot.ANCESTOR, CaptureRoots.softwareRoot(otherWindow = false, ancestorRoot = true, activity = true))

  @Test fun activityWithoutAScreenOrReactRoot() =
    assertEquals(SoftwareRoot.ACTIVITY, CaptureRoots.softwareRoot(otherWindow = false, ancestorRoot = false, activity = true))

  @Test fun nothingWithoutAnActivity() =
    assertNull(CaptureRoots.softwareRoot(otherWindow = false, ancestorRoot = false, activity = false))
}
