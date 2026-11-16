package com.sbaiahmed1.reactnativeblur

import android.util.Log
import android.view.ViewGroup
import java.lang.reflect.Method

/**
 * Whether a ViewGroup draws its children in custom order. dispatchDraw only asks getChildDrawingOrder when this is on,
 * but the public getChildDrawingOrder calls an override either way, and the flag itself is only readable through the
 * protected isChildrenDrawingOrderEnabled.
 */
internal object ChildDrawingOrder {
  private var method: Method? = null
  private var failed = false

  /** True when [group] uses custom order, and also when that cannot be read, so the override is still consulted. */
  fun isEnabled(group: ViewGroup): Boolean {
    val found = method ?: (if (failed) null else lookup()) ?: return true
    return try {
      found.invoke(group) as Boolean
    } catch (e: Exception) {
      fail(e)
      true
    }
  }

  private fun lookup(): Method? =
    try {
      ViewGroup::class.java.getDeclaredMethod("isChildrenDrawingOrderEnabled").also {
        it.isAccessible = true
        method = it
      }
    } catch (e: Exception) {
      fail(e)
      null
    }

  private fun fail(e: Exception) {
    if (failed) return
    failed = true
    method = null
    Log.w("RNBackdrop", "ViewGroup.isChildrenDrawingOrderEnabled is not readable (${e.javaClass.simpleName}: ${e.message})")
  }
}
