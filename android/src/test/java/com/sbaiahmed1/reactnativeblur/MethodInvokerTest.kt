package com.sbaiahmed1.reactnativeblur

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Assert.fail
import org.junit.Test

class MethodInvokerTest {
  class Target {
    var received: Any? = null
    var calls = 0

    fun setBackdropRenderEffect(value: Any?): Boolean {
      calls++
      received = value
      return true
    }

    @Suppress("UNUSED_PARAMETER")
    fun explode(value: Any?): Boolean {
      calls++
      throw IllegalStateException("forced")
    }
  }

  private fun invoker(name: String, onFailure: (Throwable) -> Unit = {}) =
    MethodInvoker(Target::class.java, name, arrayOf(Any::class.java), onFailure)

  @Test fun invokesAPublicMethod() {
    val target = Target()
    val setter = invoker("setBackdropRenderEffect") { fail("no failure expected") }
    assertTrue(setter.invoke(target, "effect"))
    assertEquals("effect", target.received)
    assertTrue(setter.available)
  }

  @Test fun missingMethodIsUnavailable() {
    val setter = invoker("nope")
    assertFalse(setter.available)
    assertFalse(setter.invoke(Target(), "effect"))
  }

  @Test fun throwingMethodFailsForGood() {
    val target = Target()
    val setter = invoker("explode")
    assertFalse(setter.invoke(target, "effect"))
    assertFalse(setter.invoke(target, "effect"))
    assertEquals(1, target.calls)
    assertFalse(setter.available)
  }

  @Test fun failureReportsWhatTheMethodThrew() {
    var reported: Throwable? = null
    invoker("explode") { reported = it }.invoke(Target(), "effect")
    assertTrue(reported is IllegalStateException)
    assertEquals("forced", reported?.message)
  }

  @Test fun failureReportedOnce() {
    var failures = 0
    val setter = invoker("nope") { failures++ }
    setter.available
    setter.invoke(Target(), "effect")
    assertEquals(1, failures)
  }
}
