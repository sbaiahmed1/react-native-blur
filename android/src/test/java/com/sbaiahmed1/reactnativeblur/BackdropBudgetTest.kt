package com.sbaiahmed1.reactnativeblur

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class BackdropBudgetTest {
  private class Layout(val order: List<Int>, val forced: Map<Int, IntArray>, val leaves: Map<Int, List<IntArray>>)

  private fun unbounded() = BackdropBudget(Int.MAX_VALUE, Int.MAX_VALUE, Int.MAX_VALUE)

  private fun run(layout: Layout, budget: BackdropBudget = BackdropBudget()): Pair<Int, Map<Int, BackdropBudget.Plan>> {
    val plans = LinkedHashMap<Int, BackdropBudget.Plan>()
    for (host in layout.order) {
      plans[host] = budget.plan(host, layout.forced[host] ?: IntArray(0), layout.leaves[host] ?: emptyList())
    }
    return plans.values.sumOf { it.visits } to plans
  }

  private fun complete(k: Int) = Layout((0 until k).toList(), emptyMap(), (0 until k).associateWith { i -> (i - 1 downTo 0).map { intArrayOf(it) } })

  private fun stacked(k: Int) =
    Layout((0 until k).toList(), emptyMap(), (0 until k).associateWith { i -> (i - 1 downTo maxOf(0, i - 5)).map { intArrayOf(it) } })

  private fun header(n: Int) = Layout((0..n).toList(), emptyMap(), mapOf(n to (n - 1 downTo 0).map { intArrayOf(it) }))

  private fun badges(k: Int): Layout {
    val order = ArrayList<Int>()
    val forced = HashMap<Int, IntArray>()
    val leaves = HashMap<Int, List<IntArray>>()
    for (i in 0 until k) {
      order += listOf(2 * i, 2 * i + 1)
      forced[2 * i + 1] = intArrayOf(2 * i)
      leaves[2 * i] = (i - 1 downTo 0).map { intArrayOf(2 * it, 2 * it + 1) }
    }
    return Layout(order, forced, leaves)
  }

  private fun nested(n: Int) = Layout((0 until n).toList(), (1 until n).associateWith { intArrayOf(it - 1) }, emptyMap())

  @Test fun stacksOfOneToFourStayFull() {
    for ((k, expected) in listOf(1 to 1, 2 to 3, 3 to 7, 4 to 15)) {
      val layout = complete(k)
      val (total, plans) = run(layout)
      assertEquals("complete $k", expected, total)
      for ((host, plan) in plans) assertEquals(layout.leaves[host]!!.size, plan.fullLeaves)
    }
  }

  @Test fun stackedVisits() {
    assertEquals(108, run(stacked(10)).first)
    assertEquals(147, run(stacked(12)).first)
    assertEquals(974, run(stacked(10), unbounded()).first)
    assertEquals(3774, run(stacked(12), unbounded()).first)
  }

  @Test fun completeStaysQuadratic() {
    assertEquals(42, run(complete(6)).first)
    assertEquals(147, run(complete(12)).first)
    assertEquals(343, run(complete(20)).first)
    assertEquals(1648, run(complete(50)).first)
    for (k in 1..50) assertTrue("complete $k", run(complete(k)).first <= k * (k + 8))
  }

  @Test fun directlyBehindHostIsNeverFlat() {
    for (k in 1..50) {
      for (layout in listOf(complete(k), stacked(k))) {
        for ((host, plan) in run(layout).second) {
          if (layout.leaves[host]!!.isNotEmpty()) assertTrue("k $k host $host", plan.fullLeaves >= 1)
        }
      }
    }
  }

  @Test fun visitsNeverPassTheCap() {
    for (plan in run(complete(80)).second.values) assertTrue(plan.visits <= 64)
  }

  @Test fun headerOverIndependentHostsStaysFull() {
    val (total, plans) = run(header(49))
    assertEquals(99, total)
    assertEquals(49, plans[49]!!.fullLeaves)
  }

  @Test fun sideBySideStaysFull() {
    val budget = BackdropBudget()
    budget.plan(0, IntArray(0), emptyList())
    budget.plan(1, IntArray(0), emptyList())
    val plan = budget.plan(2, IntArray(0), listOf(intArrayOf(1), intArrayOf(0)))
    assertEquals(2, plan.fullLeaves)
    assertEquals(3, plan.visits)
  }

  @Test fun badgesGrowQuadratically() {
    assertEquals(39, run(badges(3)).first)
    assertEquals(78, run(badges(6)).first)
    assertEquals(120, run(badges(10)).first)
    assertEquals(39, run(badges(3), unbounded()).first)
    assertEquals(1092, run(badges(6), unbounded()).first)
    assertEquals(88572, run(badges(10), unbounded()).first)
  }

  @Test fun nestedChainOfNearestAncestors() {
    val (total, plans) = run(nested(12))
    assertEquals(78, total)
    for (host in 1 until 12) assertEquals(1, plans[host]!!.forcedKept)
  }

  @Test fun prefixRule() {
    val budget = BackdropBudget()
    val shared = (10 until 19).map { intArrayOf(it) }
    for (id in 10 until 19) budget.plan(id, IntArray(0), emptyList())
    // Two hosts over the same nine hosts: the second adds nine repeat visits.
    budget.plan(1, IntArray(0), shared)
    budget.plan(2, IntArray(0), shared)
    budget.plan(3, IntArray(0), emptyList())
    val plan = budget.plan(0, IntArray(0), listOf(intArrayOf(1), intArrayOf(2), intArrayOf(3)))
    assertEquals(1, plan.fullLeaves)
  }

  @Test fun forcedPastTheCapIsDropped() {
    val budget = BackdropBudget()
    for (id in 100 until 1123) budget.plan(id, IntArray(0), emptyList())
    val leaves = (1122 downTo 100).map { intArrayOf(it) }
    budget.plan(1, IntArray(0), leaves)
    budget.pay(1, leaves.drop(63))
    budget.plan(2, IntArray(0), emptyList())
    assertEquals(1024, budget.visits(1))
    assertEquals(0, budget.plan(0, intArrayOf(1, 2), emptyList()).forcedKept)
  }

  @Test fun forcedAncestorsOnlyStopAtTheCap() {
    // Every ancestor referenced: host 4's walk repeats 11 visits, which only the visit cap may stop.
    val layout = Layout((0 until 5).toList(), (1 until 5).associateWith { i -> (i - 1 downTo 0).toList().toIntArray() }, emptyMap())
    assertEquals(4, run(layout).second[4]!!.forcedKept)
  }

  @Test fun aBlurNestedInAPaidHeaderKeepsTheHeader() {
    val budget = BackdropBudget()
    val leaves = headerOverCardsWithBadges(budget, cards = 20, header = 40)
    budget.pay(40, leaves.drop(8))
    val plan = budget.plan(41, intArrayOf(40), emptyList())
    assertEquals(1, plan.forcedKept)
    assertEquals(62, plan.visits)
  }

  @Test fun unknownHostCountsOne() = assertEquals(2, BackdropBudget().plan(0, IntArray(0), listOf(intArrayOf(99))).visits)

  @Test fun forgetResetsAHost() {
    val budget = BackdropBudget()
    budget.plan(1, IntArray(0), emptyList())
    budget.plan(2, IntArray(0), listOf(intArrayOf(1)))
    assertEquals(2, budget.visits(2))
    budget.forget(2)
    assertEquals(1, budget.visits(2))
  }

  private fun headerOverCardsWithBadges(budget: BackdropBudget, cards: Int, header: Int): List<IntArray> {
    for (card in 0 until cards) {
      budget.plan(2 * card, IntArray(0), emptyList())
      budget.plan(2 * card + 1, intArrayOf(2 * card), emptyList())
    }
    budget.plan(header, IntArray(0), (cards - 1 downTo 0).map { intArrayOf(2 * it, 2 * it + 1) })
    return (cards - 1 downTo 0).map { intArrayOf(2 * it, 2 * it + 1) }
  }

  @Test fun payingForTheRestOfAListMatchesTheFullWalk() {
    val budget = BackdropBudget()
    val leaves = headerOverCardsWithBadges(budget, cards = 20, header = 40)
    assertEquals(25, budget.visits(40))
    assertTrue(budget.pay(40, leaves.drop(8)))
    assertEquals(61, budget.visits(40))
  }

  @Test fun payingPastTheCapChangesNothing() {
    val budget = BackdropBudget()
    val leaves = headerOverCardsWithBadges(budget, cards = 400, header = 800)
    assertFalse(budget.pay(800, leaves.drop(8)))
    assertEquals(25, budget.visits(800))
  }

  @Test fun aPaidHostCostsItsFullWalkToTheHostsAboveIt() {
    val budget = BackdropBudget()
    val leaves = headerOverCardsWithBadges(budget, cards = 20, header = 40)
    budget.pay(40, leaves.drop(8))
    assertEquals(0, budget.plan(41, IntArray(0), listOf(intArrayOf(40))).fullLeaves)
  }

  @Test fun samePlanTwice() {
    val budget = BackdropBudget()
    run(stacked(12), budget)
    val leaves = (11 downTo 7).map { intArrayOf(it) }
    assertEquals(budget.plan(12, IntArray(0), leaves), budget.plan(12, IntArray(0), leaves))
  }
}
