package com.sbaiahmed1.reactnativeblur

import android.os.SystemClock
import android.util.Log
import android.view.View
import android.view.ViewGroup
import android.view.ViewTreeObserver

/**
 * Guarded replacement for QmBlurView's capture pre-draw listener, used by
 * ReactNativeBlurView, ReactNativeProgressiveBlurView and ReactNativeBlurSwitch.
 * QmBlurView registers its listener on the activity decor view at attach. Each
 * view swaps it for this guard on the capture root it resolves, a Screen
 * ancestor when there is one.
 *
 * QmBlurView's listener rasterizes the capture root into a software canvas on
 * every pre-draw. That software pass runs before the frame's hardware draw,
 * with a stale drawing time, and evaluates any legacy view Animation in the
 * subtree (react-native-screens' stack transitions). It starts the animation
 * with a stale start time and consumes its alpha/end bookkeeping off the
 * hardware path, so the pushed screen's RenderNode is left at a stale alpha
 * (0 or partial) and the screen stays blank or veiled until reload
 * (react-native-blur#167). This listener skips the capture while such an
 * animation is attached, plus a few settle frames after it is cleared, and
 * the blur keeps showing the last blurred frame meanwhile.
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
  private val logTag: String,
  private val animationRoots: List<View>
) : ViewTreeObserver.OnPreDrawListener {

  private val deferral = AnimationDeferral()

  companion object {
    /**
     * Registers a guard that drives [capture] on [captureRoot]'s pre-draws.
     * [frameRequester] is invalidated while the capture is skipped so frames
     * keep coming until it resumes, even if nothing else invalidates.
     */
    fun install(
      captureRoot: View,
      capture: ViewTreeObserver.OnPreDrawListener,
      frameRequester: View,
      logTag: String,
      // Views scanned for pending animations, every window a Modal capture draws.
      animationRoots: List<View> = listOf(captureRoot)
    ): CaptureAnimationGuard {
      val guard = CaptureAnimationGuard(captureRoot, capture, frameRequester, logTag, animationRoots)
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
     * ReactRootView fallback it is the whole RN tree; on the decor view
     * (until the swap, or for good when no root is found) it is the whole
     * window. Still cheap next to the full software draw of the same tree
     * that it guards.
     */
    internal fun hasPendingViewAnimation(view: View): Boolean {
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
    val pending = animationRoots.any { hasPendingViewAnimation(it) }
    return when (deferral.onFrame(SystemClock.uptimeMillis(), pending)) {
      AnimationDeferral.Decision.CAPTURE -> capture.onPreDraw()
      AnimationDeferral.Decision.SKIP -> {
        frameRequester.postInvalidateOnAnimation()
        true
      }
      AnimationDeferral.Decision.CAPTURE_FAIL_SAFE -> {
        Log.w(
          logTag,
          "Backdrop capture skipped for ${AnimationDeferral.MAX_SKIP_MS}ms and " +
            "${AnimationDeferral.MIN_SKIP_FRAMES} frames while a view animation stayed attached in " +
            "${captureRoot.javaClass.simpleName}, resuming capture."
        )
        capture.onPreDraw()
      }
    }
  }

  fun remove() {
    try {
      captureRoot.viewTreeObserver.removeOnPreDrawListener(this)
    } catch (e: Exception) {
      Log.d(logTag, "Could not remove guarded pre-draw listener: ${e.message}")
    }
  }
}
