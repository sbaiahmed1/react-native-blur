package com.sbaiahmed1.reactnativeblur

/** Sizes of a backdrop recorded at 1/2 and halved down to its node, so every halving is an exact 2x2 average. */
internal object BackdropReduction {
  /** Halvings from a recording at 1/2 down to a node at [downsample], or 0 when [downsample] is not a power of two above 2. */
  fun hops(downsample: Int): Int {
    if (downsample <= 2 || downsample and (downsample - 1) != 0) return 0
    return Integer.numberOfTrailingZeros(downsample) - 1
  }

  /** View px per px of the first recording: 2 when [downsample] is halved down to, else [downsample] itself. */
  fun recordScale(downsample: Int): Int = downsample shr hops(downsample)

  /** Node px covering [viewPx] at [downsample], rounded up. */
  fun nodeSize(viewPx: Int, downsample: Int): Int = ((viewPx + downsample - 1) / downsample).coerceAtLeast(1)

  /** Size of [level] in a chain of [hops] halvings ending at [nodePx], doubled once per halving still ahead. */
  fun levelSize(nodePx: Int, hops: Int, level: Int): Int = nodePx shl (hops - level)
}
