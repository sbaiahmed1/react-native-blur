package com.sbaiahmed1.reactnativeblur

import java.lang.reflect.InvocationTargetException
import java.lang.reflect.Method

/** Calls one public method by reflection, looked up once. Any failure makes it unavailable for good and is reported once. */
internal class MethodInvoker(
  private val owner: Class<*>,
  private val name: String,
  private val parameterTypes: Array<Class<*>>,
  private val onFailure: (Throwable) -> Unit
) {
  private var resolved: Method? = null
  private var failed = false

  val available: Boolean
    get() {
      if (resolved == null && !failed) lookup()
      return !failed
    }

  /** True when the call ran without throwing. */
  fun invoke(target: Any, vararg args: Any?): Boolean {
    val found = resolved ?: (if (failed) null else lookup()) ?: return false
    return try {
      found.invoke(target, *args)
      true
    } catch (e: Exception) {
      fail(e)
      false
    }
  }

  private fun lookup(): Method? =
    try {
      owner.getMethod(name, *parameterTypes).also { resolved = it }
    } catch (e: Exception) {
      fail(e)
      null
    }

  private fun fail(e: Exception) {
    if (failed) return
    failed = true
    resolved = null
    // Method.invoke wraps what the method threw, and the wrapper has no message.
    onFailure((e as? InvocationTargetException)?.targetException ?: e)
  }
}
