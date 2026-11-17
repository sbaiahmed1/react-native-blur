package com.sbaiahmed1.reactnativeblur

import org.junit.Assert.assertTrue
import org.junit.Test

class HostPaintOrderTest {
  private val root = Any()

  private fun step(parent: Any, position: Int, z: Float = 0f) = HostPaintOrder.Step(parent, BehindOrder.Child(position, z, true))

  @Test fun siblingsByDispatchPosition() {
    assertTrue(HostPaintOrder.compare(listOf(step(root, 0)), listOf(step(root, 1))) < 0)
    assertTrue(HostPaintOrder.compare(listOf(step(root, 1)), listOf(step(root, 0))) > 0)
  }

  @Test fun siblingsByZ() = assertTrue(HostPaintOrder.compare(listOf(step(root, 0, z = 4f)), listOf(step(root, 1))) > 0)

  @Test fun ancestorBeforeDescendant() {
    val ancestor = listOf(step(root, 2))
    val descendant = listOf(step(root, 2), step(Any(), 0))
    assertTrue(HostPaintOrder.compare(ancestor, descendant) < 0)
    assertTrue(HostPaintOrder.compare(descendant, ancestor) > 0)
  }

  @Test fun cousinsDecidedAtTheFirstDifferingLevel() {
    val first = listOf(step(root, 0), step(Any(), 5, z = 9f))
    val second = listOf(step(root, 1), step(Any(), 0))
    assertTrue(HostPaintOrder.compare(first, second) < 0)
  }

  @Test fun sharedParentThenDeeperLevelDecides() {
    val parent = Any()
    val first = listOf(step(root, 0), step(parent, 1))
    val second = listOf(step(root, 0), step(parent, 0))
    assertTrue(HostPaintOrder.compare(first, second) > 0)
  }

  @Test fun disappearingAfterLive() {
    val disappearing = listOf(step(root, BehindOrder.DISAPPEARING))
    assertTrue(HostPaintOrder.compare(disappearing, listOf(step(root, 3))) > 0)
    assertTrue(HostPaintOrder.compare(listOf(step(root, 3)), disappearing) < 0)
  }

  @Test fun samePathIsEqual() {
    val path = listOf(step(root, 1), step(Any(), 0))
    assertTrue(HostPaintOrder.compare(path, path) == 0)
  }

  @Test fun orderIsTotalWithDisappearingTwins() {
    // Two disappearing siblings share a step, so only their own children tell their hosts apart.
    val twinA = Any()
    val twinB = Any()
    val gone = step(root, BehindOrder.DISAPPEARING)
    val parent = Any()
    val paths = listOf(
      listOf(gone),
      listOf(gone, step(twinA, 0)),
      listOf(gone, step(twinA, 1)),
      listOf(gone, step(twinB, 0)),
      listOf(gone, step(twinB, 1, z = 2f)),
      listOf(step(root, 0)),
      listOf(step(root, 0), step(parent, 0)),
      listOf(step(root, 1, z = 1f))
    )
    val sign = { a: List<HostPaintOrder.Step>, b: List<HostPaintOrder.Step> -> Integer.signum(HostPaintOrder.compare(a, b)) }
    for (a in paths) for (b in paths) {
      assertTrue("antisymmetric", sign(a, b) == -sign(b, a))
      for (c in paths) {
        if (sign(a, b) <= 0 && sign(b, c) <= 0) assertTrue("transitive $a $b $c", sign(a, c) <= 0)
        if (sign(a, b) == 0) assertTrue("equal paths compare alike", sign(a, c) == sign(b, c))
      }
    }
  }
}
