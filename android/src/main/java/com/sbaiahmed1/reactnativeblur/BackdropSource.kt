package com.sbaiahmed1.reactnativeblur

import android.graphics.RenderEffect
import android.graphics.RenderNode
import android.view.View

/** Where a backdrop host's pixels come from. */
internal interface BackdropSource {
  /** Records [host]'s part of the backdrop into [node]. False when nothing is captured yet. */
  fun recordInto(node: RenderNode, host: View): Boolean
  fun addHost(host: BackdropHostView)
  fun removeHost(host: BackdropHostView)
}

/** What a backdrop host does to its pixels. */
internal fun interface BackdropEffect {
  fun create(host: View): RenderEffect
}
