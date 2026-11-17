package com.sbaiahmed1.reactnativeblur

/** Clips a replayed ViewGroup applies to its children, as its own dispatchDraw does. */
internal object ReplayClip {
  /** Writes the padding box in the scrolled space to [out] and returns true, or false when dispatchDraw would not clip. */
  fun paddingBox(clipToPadding: Boolean, scrollX: Int, scrollY: Int, width: Int, height: Int, left: Int, top: Int, right: Int, bottom: Int, out: FloatArray): Boolean {
    if (!clipToPadding || (left == 0 && top == 0 && right == 0 && bottom == 0)) return false
    out[0] = (scrollX + left).toFloat()
    out[1] = (scrollY + top).toFloat()
    out[2] = (scrollX + width - right).toFloat()
    out[3] = (scrollY + height - bottom).toFloat()
    return true
  }
}
