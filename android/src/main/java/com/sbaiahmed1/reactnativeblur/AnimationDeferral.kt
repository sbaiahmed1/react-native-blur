package com.sbaiahmed1.reactnativeblur

/** Skips software captures while a legacy view animation is pending and while it settles (react-native-blur#167). */
internal class AnimationDeferral(
  private val settleFrames: Int = SETTLE_FRAMES,
  private val maxSkipMs: Long = MAX_SKIP_MS,
  private val minSkipFrames: Int = MIN_SKIP_FRAMES,
  private val runGapMs: Long = RUN_GAP_MS
) {
  enum class Decision { CAPTURE, SKIP, CAPTURE_FAIL_SAFE }

  private var settleLeft = 0
  private var lastSightingMs = NO_TIME
  private var skipStartMs = NO_TIME
  private var skippedFrames = 0
  private var tripped = false

  /** Decides one capture. Only [newFrame] calls count frames, and the fail-safe needs both the time and the frames. */
  fun onFrame(nowMs: Long, animationPending: Boolean, newFrame: Boolean = true): Decision {
    if (!animationPending) {
      clearRun()
      if (settleLeft == 0) return Decision.CAPTURE
      if (newFrame) settleLeft--
      return Decision.SKIP
    }

    if (lastSightingMs != NO_TIME && nowMs - lastSightingMs > runGapMs) clearRun()
    lastSightingMs = nowMs
    settleLeft = settleFrames
    if (tripped) return Decision.CAPTURE
    if (skipStartMs == NO_TIME) skipStartMs = nowMs
    if (!newFrame) return Decision.SKIP
    skippedFrames++
    if (nowMs - skipStartMs < maxSkipMs || skippedFrames < minSkipFrames) return Decision.SKIP
    tripped = true
    return Decision.CAPTURE_FAIL_SAFE
  }

  /** A source went from no hosts to one: forget the fail-safe run, keep the settle frames. */
  fun rearm() {
    clearRun()
  }

  private fun clearRun() {
    skipStartMs = NO_TIME
    skippedFrames = 0
    tripped = false
  }

  companion object {
    const val SETTLE_FRAMES = 3
    const val MAX_SKIP_MS = 1000L
    const val MIN_SKIP_FRAMES = 30
    // A sighting this long after the previous one starts a new run, so a stopped ticker never counts.
    const val RUN_GAP_MS = 1000L
    private const val NO_TIME = Long.MIN_VALUE
  }
}
