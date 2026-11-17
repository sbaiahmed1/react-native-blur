package com.sbaiahmed1.reactnativeblur

import org.junit.Assert.assertEquals
import org.junit.Test

class LeafOrderTest {
  private fun order(vararg visible: Boolean) = LeafOrder.visibleFirst(visible.toList().toBooleanArray(), visible.size).toList()

  @Test fun visibleLeavesComeFirst() = assertEquals(listOf(1, 3, 0, 2), order(false, true, false, true))

  @Test fun nearestFirstHoldsInsideEachGroup() = assertEquals(listOf(2, 3, 4, 0, 1), order(false, false, true, true, true))

  @Test fun allVisibleKeepsTheOrder() = assertEquals(listOf(0, 1, 2), order(true, true, true))

  @Test fun noLeaves() = assertEquals(emptyList<Int>(), order())

  @Test fun headerOverCardsWithBadgesKeepsTheCardsUnderItFull() {
    // A header over twelve cards that each hold a badge. Leaves run nearest first, so the three cards under the header are the farthest.
    val budget = BackdropBudget()
    for (card in 0 until 12) {
      budget.plan(2 * card, IntArray(0), emptyList())
      budget.plan(2 * card + 1, intArrayOf(2 * card), emptyList())
    }
    val leaves = (11 downTo 0).map { intArrayOf(2 * it, 2 * it + 1) }
    val visible = BooleanArray(12) { it >= 9 }
    val planned = LeafOrder.visibleFirst(visible, 12)
    val plan = budget.plan(24, IntArray(0), planned.map { leaves[it] })
    val full = planned.take(plan.fullLeaves).toSet()
    for (leaf in 9 until 12) assertEquals("leaf $leaf", true, leaf in full)
  }
}
