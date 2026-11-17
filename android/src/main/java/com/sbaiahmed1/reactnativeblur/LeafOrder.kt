package com.sbaiahmed1.reactnativeblur

/** The order a backdrop plans its leaves in: the ones it can show first, nearest first in each group. */
internal object LeafOrder {
  /** Indices of the first [count] leaves, the [visible] ones first, each group in its original order. */
  fun visibleFirst(visible: BooleanArray, count: Int): IntArray {
    val order = IntArray(count)
    var next = 0
    for (index in 0 until count) if (visible[index]) order[next++] = index
    for (index in 0 until count) if (!visible[index]) order[next++] = index
    return order
  }
}
