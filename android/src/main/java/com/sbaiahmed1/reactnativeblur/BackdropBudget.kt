package com.sbaiahmed1.reactnativeblur

import java.util.BitSet

/**
 * Decides how many of the backdrops a host references it may reference in full, so overlapping hosts cost a bounded number
 * of backdrop visits per frame instead of doubling with each host.
 */
internal class BackdropBudget(
  private val maxRedundancy: Int = MAX_REDUNDANCY,
  private val maxVisits: Int = MAX_VISITS
) {
  /** [forcedKept] ancestor backdrops and [fullLeaves] leaves, nearest first, are referenced in full. */
  data class Plan(val forcedKept: Int, val fullLeaves: Int, val visits: Int)

  private val visitsOf = HashMap<Int, Int>()
  private val reachOf = HashMap<Int, BitSet>()
  private val reach = BitSet()
  private val joined = BitSet()
  private val single = IntArray(1)
  private var visits = 0L

  /**
   * Plans [host]'s backdrop: [forced] holds the ancestor hosts it draws, nearest first, and each of [leaves] the ids of one
   * referenced host and the hosts nested in it, nearest first. Once one does not fit, every farther one is left out.
   */
  fun plan(host: Int, forced: IntArray, leaves: List<IntArray>): Plan {
    reach.clear()
    reach.set(host)
    visits = 1
    var forcedKept = 0
    for (ancestor in forced) {
      single[0] = ancestor
      if (!join(single)) break
      forcedKept++
    }
    var fullLeaves = 0
    for (leaf in leaves) {
      if (!join(leaf)) break
      fullLeaves++
    }
    val total = visits.toInt()
    visitsOf[host] = total
    reachOf.getOrPut(host) { BitSet() }.apply {
      clear()
      or(reach)
    }
    return Plan(forcedKept, fullLeaves, total)
  }

  /** Backdrop visits one visit of [host]'s backdrop makes, itself included, or 1 for a host never planned. */
  fun visits(host: Int): Int = visitsOf[host] ?: 1

  fun forget(host: Int) {
    visitsOf.remove(host)
    reachOf.remove(host)
  }

  private fun join(ids: IntArray): Boolean {
    joined.clear()
    joined.or(reach)
    var next = visits
    for (id in ids) {
      next += visits(id)
      val known = reachOf[id]
      if (known == null) joined.set(id) else joined.or(known)
    }
    if (next > maxVisits || next - joined.cardinality() > maxRedundancy) return false
    visits = next
    reach.clear()
    reach.or(joined)
    return true
  }

  companion object {
    /** Repeat visits a backdrop may make: visits past the number of distinct backdrops it reaches. */
    const val MAX_REDUNDANCY = 8

    /** Visits one backdrop may make, a backstop for very long stacks. */
    const val MAX_VISITS = 64
  }
}
