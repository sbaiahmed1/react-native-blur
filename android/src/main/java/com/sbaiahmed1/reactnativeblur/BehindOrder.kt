package com.sbaiahmed1.reactnativeblur

/** Which children of a ViewGroup paint before a given child, in hwui's order: dispatch order, then a stable sort by Z. */
internal object BehindOrder {
  /** One child: its position in dispatchDraw, its getZ(), and whether dispatchDraw draws it at all. */
  data class Child(val dispatchPosition: Int, val z: Float, val drawn: Boolean)

  /** The path index of a child that left its parent's list but is still drawn, after every other child. */
  const val DISAPPEARING = -1

  /** Indices into [children] painted before children[pathIndex], in paint order. */
  fun behind(children: List<Child>, pathIndex: Int): List<Int> {
    val path = if (pathIndex == DISAPPEARING) null else children[pathIndex]
    val result = ArrayList<Int>()
    for (index in children.indices) {
      val child = children[index]
      if (index == pathIndex || !child.drawn) continue
      if (path == null || child.z < path.z || (child.z == path.z && child.dispatchPosition < path.dispatchPosition)) result.add(index)
    }
    result.sortWith(compareBy({ children[it].z }, { children[it].dispatchPosition }))
    return result
  }
}
