package com.sbaiahmed1.reactnativeblur

/** Orders hosts the way hwui paints them, so a host records after every host it can reference. */
internal object HostPaintOrder {
  /** One level of a host's path: the parent and the path child's place among its children. */
  class Step(val parent: Any, val order: BehindOrder.Child)

  /** Compares two paths from the root's child down to a host on values only, so the order is total. An ancestor comes first. */
  fun compare(a: List<Step>, b: List<Step>): Int {
    val shared = minOf(a.size, b.size)
    for (index in 0 until shared) {
      val left = a[index]
      val right = b[index]
      val byParent = System.identityHashCode(left.parent).compareTo(System.identityHashCode(right.parent))
      if (byParent != 0) return byParent
      val byOrder = BehindOrder.compare(left.order, right.order)
      if (byOrder != 0) return byOrder
    }
    return a.size.compareTo(b.size)
  }
}
