package com.sbaiahmed1.reactnativeblur

/** Which children of a ViewGroup paint before a given child, in hwui's order: dispatch order, then a stable sort by Z. */
internal object BehindOrder {
  /** One child: its position in dispatchDraw, its getZ(), and whether dispatchDraw draws it at all. */
  data class Child(val dispatchPosition: Int, val z: Float, val drawn: Boolean)

  /** The path index of a child that left its parent's list but is still drawn, after every other child. */
  const val DISAPPEARING = -1

  /** Fills positions[childIndex] with the child's position in dispatchDraw, or index order when [orderOf] throws or is not a permutation. */
  inline fun fillDispatchPositions(positions: IntArray, count: Int, orderOf: (Int) -> Int) {
    positions.fill(-1, 0, count)
    try {
      for (position in 0 until count) {
        val index = orderOf(position)
        // androidx ViewPager throws here when no page transformer set an order.
        if (index !in 0 until count || positions[index] != -1) throw IllegalStateException("not a permutation")
        positions[index] = position
      }
    } catch (e: RuntimeException) {
      for (index in 0 until count) positions[index] = index
    }
  }

  /**
   * Indices into [children] painted before children[pathIndex], in paint order. A [DISAPPEARING] path child is drawn after
   * every live child but still inside the Z sort, so [disappearingZ], its getZ(), decides against an elevated sibling.
   */
  fun behind(children: List<Child>, pathIndex: Int, disappearingZ: Float = 0f): List<Int> {
    val path = if (pathIndex == DISAPPEARING) null else children[pathIndex]
    val result = ArrayList<Int>()
    for (index in children.indices) {
      val child = children[index]
      if (index == pathIndex || !child.drawn) continue
      val paintsBefore = if (path == null) {
        child.z <= disappearingZ
      } else {
        child.z < path.z || (child.z == path.z && child.dispatchPosition < path.dispatchPosition)
      }
      if (paintsBefore) result.add(index)
    }
    result.sortWith(compareBy({ children[it].z }, { children[it].dispatchPosition }))
    return result
  }
}
