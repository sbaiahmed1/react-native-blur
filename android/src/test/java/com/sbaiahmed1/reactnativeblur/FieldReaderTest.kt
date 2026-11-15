package com.sbaiahmed1.reactnativeblur

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Assert.fail
import org.junit.Test

class FieldReaderTest {
  @Suppress("unused")
  private class Holder { private val secret: String = "node" }

  @Suppress("unused")
  private class IntHolder { private val secret: Int = 7 }

  @Test fun readsAPrivateField() {
    val reader = FieldReader(Holder::class.java, "secret", String::class.java) { fail("no failure expected") }
    assertEquals("node", reader.read(Holder()))
    assertTrue(reader.available)
  }

  @Test fun missingFieldIsUnavailable() {
    val reader = FieldReader(Holder::class.java, "mRenderNode", String::class.java) {}
    assertNull(reader.read(Holder()))
    assertFalse(reader.available)
  }

  @Test fun wrongTypeIsUnavailable() {
    val reader = FieldReader(IntHolder::class.java, "secret", String::class.java) {}
    assertNull(reader.read(IntHolder()))
    assertFalse(reader.available)
  }

  @Test fun failureReportedOnce() {
    var failures = 0
    val reader = FieldReader(Holder::class.java, "nope", String::class.java) { failures++ }
    reader.read(Holder())
    reader.read(Holder())
    assertEquals(1, failures)
  }
}
