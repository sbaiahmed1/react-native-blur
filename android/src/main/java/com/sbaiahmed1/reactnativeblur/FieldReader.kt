package com.sbaiahmed1.reactnativeblur

import android.graphics.RenderNode
import android.os.Build
import android.util.Log
import android.view.View
import androidx.annotation.RequiresApi
import java.lang.reflect.Field

/** Reads one non-public field by reflection, looked up once. Any failure makes it unavailable for good and is reported once. */
internal class FieldReader<T>(
  private val owner: Class<*>,
  private val name: String,
  private val type: Class<T>,
  private val onFailure: (Throwable) -> Unit
) {
  private var resolved: Field? = null
  private var failed = false

  val available: Boolean
    get() {
      if (resolved == null && !failed) lookup()
      return !failed
    }

  fun read(target: Any): T? {
    val found = resolved ?: (if (failed) null else lookup()) ?: return null
    return try {
      type.cast(found.get(target))
    } catch (e: Exception) {
      fail(e)
      null
    }
  }

  private fun lookup(): Field? =
    try {
      val found = owner.getDeclaredField(name)
      require(type.isAssignableFrom(found.type)) { "$name is ${found.type.name}, not ${type.name}" }
      found.isAccessible = true
      resolved = found
      found
    } catch (e: Exception) {
      fail(e)
      null
    }

  private fun fail(e: Exception) {
    if (failed) return
    failed = true
    resolved = null
    onFailure(e)
  }
}

/** A view's own RenderNode, which no public API returns on API 31-37. */
@RequiresApi(Build.VERSION_CODES.Q)
internal object RenderNodeAccess {
  private val reader = FieldReader(View::class.java, "mRenderNode", RenderNode::class.java) { e ->
    Log.w("RNBackdrop", "View.mRenderNode is not readable (${e.javaClass.simpleName}: ${e.message}), blur views use the software capture")
  }

  val available: Boolean
    get() = reader.available

  fun nodeOf(view: View): RenderNode? = reader.read(view)
}
