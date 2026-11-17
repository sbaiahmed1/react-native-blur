package com.sbaiahmed1.reactnativeblur

/** How a backdrop references a view painted behind it, from how many of the view's leaves the plan keeps full. */
internal enum class BackdropReference {
  /** The view's own node: it holds no host, or every host in it fits the budget. */
  NODE,

  /** A proxy that draws every host in the view flat. */
  FLAT,

  /** A proxy that references the hosts that fit by node and draws the rest flat. */
  REPLAY;

  companion object {
    fun of(fullLeaves: Int, leafCount: Int): BackdropReference = when (fullLeaves) {
      leafCount -> NODE
      0 -> FLAT
      else -> REPLAY
    }
  }
}
