package com.sbaiahmed1.reactnativeblur

/** Where a nested host's backdrop walk starts: an opaque host ancestor already covers every level above it. */
internal object NestedCut {
  /** A host ancestor at [level] of the path, whether its backdrop is opaque and whether the nested host lies inside it. */
  class Ancestor(val level: Int, val opaque: Boolean, val containsHost: Boolean)

  /** Whether a blur's backdrop covers its rect: it blurs, it has a recording, and the recording is not Android's own backdrop. */
  fun isOpaqueBlur(effectRadius: Float, recorded: Boolean, platform: Boolean): Boolean = effectRadius > 0f && recorded && !platform

  /** The level of the deepest opaque ancestor that contains the host, listed from the root down, or 0 for no cut. */
  fun startLevel(ancestors: List<Ancestor>, windowOpaque: Boolean): Int {
    if (!windowOpaque) return 0
    for (index in ancestors.indices.reversed()) {
      val ancestor = ancestors[index]
      if (ancestor.opaque && ancestor.containsHost) return ancestor.level
    }
    return 0
  }
}
