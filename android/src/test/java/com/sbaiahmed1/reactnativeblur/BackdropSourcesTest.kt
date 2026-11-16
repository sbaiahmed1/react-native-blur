package com.sbaiahmed1.reactnativeblur

import org.junit.Assert.assertEquals
import org.junit.Test

class BackdropSourcesTest {
  @Test fun platformInTheActivityWindow() =
    assertEquals(SourceKind.PLATFORM, BackdropSources.kind(platform = true, activityWindow = true, nodeAccess = { true }))

  @Test fun platformNeedsNoFieldRead() =
    assertEquals(
      SourceKind.PLATFORM,
      BackdropSources.kind(platform = true, activityWindow = true, nodeAccess = { throw AssertionError("the field was read") })
    )

  @Test fun behindUnderAnOpenLayer() =
    assertEquals(
      SourceKind.BEHIND,
      BackdropSources.kind(platform = true, activityWindow = true, nodeAccess = { true }, openLayer = true)
    )

  @Test fun softwareUnderAnOpenLayerWithoutTheField() =
    assertEquals(
      SourceKind.SOFTWARE,
      BackdropSources.kind(platform = true, activityWindow = true, nodeAccess = { false }, openLayer = true)
    )

  @Test fun behindInAnotherWindow() =
    assertEquals(SourceKind.BEHIND, BackdropSources.kind(platform = true, activityWindow = false, nodeAccess = { true }))

  @Test fun behindWhenThePlatformIsOff() =
    assertEquals(SourceKind.BEHIND, BackdropSources.kind(platform = false, activityWindow = true, nodeAccess = { true }))

  @Test fun softwareWhenTheNodeIsNotReadable() =
    assertEquals(SourceKind.SOFTWARE, BackdropSources.kind(platform = false, activityWindow = true, nodeAccess = { false }))

  @Test fun softwareInAnotherWindowWithoutTheField() =
    assertEquals(SourceKind.SOFTWARE, BackdropSources.kind(platform = true, activityWindow = false, nodeAccess = { false }))
}
