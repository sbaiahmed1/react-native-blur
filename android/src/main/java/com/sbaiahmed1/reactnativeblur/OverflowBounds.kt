package com.sbaiahmed1.reactnativeblur

/** The area a view paints in its own space: its bounds grown by React Native's overflow insets, which are non-positive. */
internal object OverflowBounds {
  fun write(width: Int, height: Int, left: Int, top: Int, right: Int, bottom: Int, out: FloatArray) {
    out[0] = left.toFloat()
    out[1] = top.toFloat()
    out[2] = (width - right).toFloat()
    out[3] = (height - bottom).toFloat()
  }
}
