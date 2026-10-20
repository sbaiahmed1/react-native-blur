package com.sbaiahmed1.reactnativeblur

import android.os.SystemClock
import android.util.Log
import android.view.View
import android.view.ViewGroup
import android.view.ViewTreeObserver

/**
 * Guarded replacement for QmBlurView's capture pre-draw listener, registered
 * on the capture root that ReactNativeBlurView and
 * ReactNativeProgressiveBlurView swap in (their swapBlurRootToScreenAncestor).
 *
 * QmBlurView's listener rasterizes the capture root into a software canvas on
 * every pre-draw. That software pass runs before the frame's hardware draw,
 * with a stale drawing time, and evaluates any legacy view Animation in the
 * subtree (react-native-screens' stack transitions). It starts the animation
 * with a stale start time and consumes its alpha/end bookkeeping off the
 * hardware path, so the pushed screen's RenderNode is left at ~0 alpha and the
 * screen stays blank until reload (react-native-blur#167). This listener skips
 * the capture while such an animation is attached, plus a few settle frames
 * after it is cleared, and the blur keeps showing the last blurred frame
 * meanwhile.
 *
 * It must be the ONLY listener driving [capture] on the root: QmBlurView's
 * original listener is not registered alongside it, otherwise it would still
 * capture unguarded before this one runs. Callers own the instance and must
 * [remove] it, since QmBlurView only knows its original listener.
 */
internal class CaptureAnimationGuard private constructor(
  private val captureRoot: View,
  private val capture: ViewTreeObserver.OnPreDrawListener,
  private val frameRequester: View,
  private val logTag: String
) : ViewTreeObserver.OnPreDrawListener {

  private var settleFramesLeft = 0
  private var animationSkipStartMs = NOT_SKIPPING
  private var failSafeTripped = false

  companion object {
    // Pre-draws to keep skipping the backdrop capture after the last legacy
    // view animation in the capture root is gone. The frame that clears an
    // animation leaves the view's RenderNode alpha at its last animated value
    // and relies on the NEXT hardware draw to reset it to 1; a software
    // capture running first in that frame consumes the reset. One frame is
    // enough, the second is margin.
    private const val ANIMATION_SETTLE_FRAMES = 2
    // Fail-safe: the longest the capture stays skipped for one run of pending
    // animations. An animated view that never gets a hardware draw (e.g. under
    // a GONE parent) never clears its Animation, which would otherwise freeze
    // the blur and keep requesting frames forever. Stack transitions finish
    // well within this.
    private const val MAX_ANIMATION_SKIP_MS = 1000L
    private const val NOT_SKIPPING = -1L

    /**
     * Registers a guard that drives [capture] on [captureRoot]'s pre-draws.
     * [frameRequester] is invalidated while the capture is skipped so frames
     * keep coming until it resumes, even if nothing else invalidates.
     */
    fun install(
      captureRoot: View,
      capture: ViewTreeObserver.OnPreDrawListener,
      frameRequester: View,
      logTag: String
    ): CaptureAnimationGuard {
      val guard = CaptureAnimationGuard(captureRoot, capture, frameRequester, logTag)
      captureRoot.viewTreeObserver.addOnPreDrawListener(guard)
      return guard
    }

    /**
     * True if [view] or any descendant has a legacy view Animation attached
     * that a draw would still evaluate, including one started but not drawn
     * yet. hasEnded() alone is not enough: AndroidX Fragment's
     * EndViewTransitionAnimation reports ended but stays attached, returning
     * "more" with a stale transformation until the fragment transition ends.
     * Only an ended fillAfter animation, held on purpose, is ignored so it
     * cannot freeze the backdrop forever.
     *
     * Cost: a full walk of the capture root, once per guarded blur view per
     * frame. Under a Screen root that is one screen's subtree; with the
     * ReactRootView fallback it is the whole RN tree. Still cheap next to the
     * full software draw of the same tree that it guards.
     */
    private fun hasPendingViewAnimation(view: View): Boolean {
      val animation = view.animation
      if (animation != null && !(animation.hasEnded() && animation.fillAfter)) return true
      if (view is ViewGroup) {
        for (i in 0 until view.childCount) {
          if (hasPendingViewAnimation(view.getChildAt(i))) return true
        }
      }
      return false
    }
  }

  override fun onPreDraw(): Boolean {
    if (hasPendingViewAnimation(captureRoot)) {
      settleFramesLeft = ANIMATION_SETTLE_FRAMES
      if (!shouldKeepSkippingWhileAnimating()) return capture.onPreDraw()
      frameRequester.postInvalidateOnAnimation()
      return true
    }

    animationSkipStartMs = NOT_SKIPPING
    failSafeTripped = false
    if (settleFramesLeft > 0) {
      settleFramesLeft--
      frameRequester.postInvalidateOnAnimation()
      return true
    }
    return capture.onPreDraw()
  }

  fun remove() {
    try {
      captureRoot.viewTreeObserver.removeOnPreDrawListener(this)
    } catch (e: Exception) {
      Log.d(logTag, "Could not remove guarded pre-draw listener: ${e.message}")
    }
  }

  /**
   * False once the current run of pending animations has kept the capture
   * skipped for [MAX_ANIMATION_SKIP_MS]; the capture then runs unguarded until
   * no animation is pending.
   */
  private fun shouldKeepSkippingWhileAnimating(): Boolean {
    if (failSafeTripped) return false
    val now = SystemClock.uptimeMillis()
    if (animationSkipStartMs == NOT_SKIPPING) animationSkipStartMs = now
    if (now - animationSkipStartMs < MAX_ANIMATION_SKIP_MS) return true

    failSafeTripped = true
    Log.w(
      logTag,
      "Backdrop capture skipped for ${MAX_ANIMATION_SKIP_MS}ms while a view animation stayed " +
        "attached in ${captureRoot.javaClass.simpleName}; resuming capture."
    )
    return false
  }
}
