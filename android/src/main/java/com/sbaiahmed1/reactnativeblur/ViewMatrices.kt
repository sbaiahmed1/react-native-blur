package com.sbaiahmed1.reactnativeblur

import android.graphics.Matrix
import android.view.View

/** View transforms as hwui applies them when it draws. */
internal object ViewMatrices {
  /** [view]'s node transform in its parent: the position, the legacy animation matrix set by the last draw, then the view's own matrix. */
  fun node(view: View, out: Matrix): Matrix {
    out.setTranslate(view.left.toFloat(), view.top.toFloat())
    view.animationMatrix?.let { out.preConcat(it) }
    val own = view.matrix
    if (!own.isIdentity) out.preConcat(own)
    return out
  }

  /** Maps [view]'s px to [ancestor]'s px into [out]. False when [ancestor] is not above [view]. */
  fun toAncestor(view: View, ancestor: View, out: Matrix, step: Matrix): Boolean {
    out.reset()
    var current = view
    while (current !== ancestor) {
      val parent = current.parent as? View ?: return false
      out.postConcat(node(current, step))
      out.postTranslate(-parent.scrollX.toFloat(), -parent.scrollY.toFloat())
      current = parent
    }
    return true
  }
}
