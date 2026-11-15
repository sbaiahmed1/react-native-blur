package com.sbaiahmed1.reactnativeblur

/** Two buffers: a draw goes into the spare one, which is published only when the draw succeeded. */
internal class SwapBuffer<T : Any>(
  private val create: (Int, Int) -> T,
  private val sizeOf: (T) -> Pair<Int, Int>
) {
  var published: T? = null
    private set
  private var spare: T? = null

  /** The buffer to draw the next frame into, at [width] by [height]. */
  fun spare(width: Int, height: Int): T =
    spare?.takeIf { sizeOf(it) == width to height } ?: create(width, height).also { spare = it }

  /** Shows the spare buffer and keeps the previous one for the next draw. */
  fun publish() {
    val drawn = spare ?: return
    spare = published
    published = drawn
  }

  /** Both buffers, for releasing them. */
  fun all(): List<T> = listOfNotNull(published, spare)
}
