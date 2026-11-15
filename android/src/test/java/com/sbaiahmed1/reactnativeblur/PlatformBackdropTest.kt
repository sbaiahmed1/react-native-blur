package com.sbaiahmed1.reactnativeblur

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class PlatformBackdropTest {
  @Test fun supportedOn37_2() = assertTrue(PlatformBackdrop.isSupported(sdkInt = 37, fullSdk = 3_700_002))

  @Test fun notOn37_0() = assertFalse(PlatformBackdrop.isSupported(37, 3_700_000))

  @Test fun notOn37_1() = assertFalse(PlatformBackdrop.isSupported(37, 3_700_001))

  @Test fun supportedOnALaterMajor() = assertTrue(PlatformBackdrop.isSupported(38, 3_800_000))

  @Test fun notBelowApi37() = assertFalse(PlatformBackdrop.isSupported(36, 3_700_002))

  @Test fun fullSdkReadsTheField() = assertEquals(3_700_002, PlatformBackdrop.fullSdk(37) { 3_700_002 })

  @Test fun fullSdkIsTheMajorWhenTheFieldIsMissing() =
    assertEquals(3_500_000, PlatformBackdrop.fullSdk(35) { throw NoSuchFieldException("SDK_INT_FULL") })
}
