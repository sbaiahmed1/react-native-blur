package com.sbaiahmed1.reactnativeblur

import android.graphics.RenderEffect
import android.graphics.RenderNode
import android.os.Build
import android.view.View
import androidx.annotation.RequiresApi

/** Where a backdrop host's pixels come from. */
internal interface BackdropSource {
  fun addHost(host: BackdropHostView)
  fun removeHost(host: BackdropHostView)

  /** Changes whenever [host]'s node must be re-recorded. Null while the source has nothing for [host]. */
  fun contentKey(host: BackdropHostView): Any?

  /** Records [host]'s backdrop into [node]. False when nothing can be drawn yet. */
  @RequiresApi(Build.VERSION_CODES.Q)
  fun recordInto(node: RenderNode, host: BackdropHostView): Boolean
}

/** What a backdrop host does to its pixels. */
internal fun interface BackdropEffect {
  fun create(host: View): RenderEffect
}
