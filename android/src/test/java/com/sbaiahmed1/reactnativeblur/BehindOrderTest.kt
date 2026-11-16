package com.sbaiahmed1.reactnativeblur

import org.junit.Assert.assertEquals
import org.junit.Test

class BehindOrderTest {
  private fun flat(n: Int) = List(n) { BehindOrder.Child(it, 0f, true) }

  private fun positions(count: Int, customOrder: Boolean = true, orderOf: (Int) -> Int) =
    IntArray(count).also { BehindOrder.fillDispatchPositions(it, count, customOrder, orderOf) }.toList()

  @Test fun indexOrderWhenCustomOrderIsOff() = assertEquals(listOf(0, 1, 2), positions(3, customOrder = false) { 2 - it })

  @Test fun indexOrderWhenFlat() = assertEquals(listOf(0, 1), BehindOrder.behind(flat(4), 2))

  @Test fun dispatchPositionsFollowTheDrawingOrder() = assertEquals(listOf(2, 1, 0), positions(3) { 2 - it })

  @Test fun indexOrderWhenTheDrawingOrderThrows() =
    assertEquals(listOf(0, 1, 2), positions(3) { throw NullPointerException("no ordered children") })

  @Test fun indexOrderWhenTheDrawingOrderIsOutOfRange() = assertEquals(listOf(0, 1, 2), positions(3) { it + 1 })

  @Test fun indexOrderWhenTheDrawingOrderRepeatsAChild() = assertEquals(listOf(0, 1, 2), positions(3) { 0 })

  @Test fun firstChildHasNothingBehind() = assertEquals(emptyList<Int>(), BehindOrder.behind(flat(3), 0))

  @Test fun customDrawingOrderDecides() {
    val reversed = List(3) { BehindOrder.Child(2 - it, 0f, true) }
    assertEquals(listOf(2), BehindOrder.behind(reversed, 1))
  }

  @Test fun higherZPaintsAfterThePath() {
    val children = listOf(BehindOrder.Child(0, 4f, true), BehindOrder.Child(1, 0f, true))
    assertEquals(emptyList<Int>(), BehindOrder.behind(children, 1))
  }

  @Test fun elevatedPathSeesLaterFlatSiblings() {
    val children = listOf(BehindOrder.Child(0, 8f, true), BehindOrder.Child(1, 0f, true), BehindOrder.Child(2, 0f, true))
    assertEquals(listOf(1, 2), BehindOrder.behind(children, 0))
  }

  @Test fun negativeZPaintsFirst() {
    val children = listOf(BehindOrder.Child(0, 0f, true), BehindOrder.Child(1, 0f, true), BehindOrder.Child(2, -1f, true))
    assertEquals(listOf(2, 0), BehindOrder.behind(children, 1))
  }

  @Test fun equalZKeepsDispatchOrder() {
    val children = List(4) { BehindOrder.Child(it, 2f, true) }
    assertEquals(listOf(0, 1, 2), BehindOrder.behind(children, 3))
  }

  @Test fun disappearingPathSeesEveryDrawnChild() {
    val children = listOf(BehindOrder.Child(1, 0f, true), BehindOrder.Child(0, 0f, true), BehindOrder.Child(2, 0f, false))
    assertEquals(listOf(1, 0), BehindOrder.behind(children, BehindOrder.DISAPPEARING))
  }

  @Test fun elevatedSiblingStaysAboveADisappearingPath() {
    val children = listOf(BehindOrder.Child(0, 0f, true), BehindOrder.Child(1, 8f, true))
    assertEquals(listOf(0), BehindOrder.behind(children, BehindOrder.DISAPPEARING, disappearingZ = 0f))
  }

  @Test fun elevatedDisappearingPathSeesLowerSiblings() {
    val children = listOf(BehindOrder.Child(0, 8f, true), BehindOrder.Child(1, 0f, true), BehindOrder.Child(2, 12f, true))
    assertEquals(listOf(1, 0), BehindOrder.behind(children, BehindOrder.DISAPPEARING, disappearingZ = 8f))
  }

  @Test fun undrawnChildrenAreLeftOut() {
    val children = listOf(BehindOrder.Child(0, 0f, false), BehindOrder.Child(1, 0f, true), BehindOrder.Child(2, 0f, true))
    assertEquals(listOf(1), BehindOrder.behind(children, 2))
  }
}
