package com.sbaiahmed1.reactnativeblur

import org.junit.Assert.assertEquals
import org.junit.Test

class BackdropSourcesTest {
  @Test fun behindWhenTheNodeIsReadable() = assertEquals(SourceKind.BEHIND, BackdropSources.kind(nodeAccess = true))

  @Test fun softwareWhenItIsNot() = assertEquals(SourceKind.SOFTWARE, BackdropSources.kind(nodeAccess = false))
}
