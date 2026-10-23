package com.sbaiahmed1.reactnativeblur

import android.content.Context
import android.graphics.Canvas
import android.view.View

/**
 * Capture root for a blur view hosted in a window other than the activity's,
 * such as React Native's Modal, which renders into its own Dialog window
 * (react-native-blur#133).
 *
 * QmBlurView always captures the activity decor view, which never contains
 * the modal's content, so the blur only showed the screen behind the dialog
 * and ignored its siblings inside the modal. QmBlurView draws this view as
 * its capture root instead, and it draws each window root at its screen
 * position, bottom first: the activity decor view, then the dialog's root.
 * A transparent modal keeps blurring the screen behind it, an opaque one
 * hides it, and the modal content under the blur view is now included. The
 * blur view skips itself while the dialog root is drawn (QmBlurView's
 * isRendering check in BlurViewGroup/BlurView.draw).
 *
 * Never attached: QmBlurView offsets the capture by this view's location on
 * screen, which is (0, 0) for a detached view, so each layer is translated by
 * its own location on screen. Its ViewTreeObserver is never dispatched, so
 * the caller registers the capture listener on the dialog's window root.
 */
internal class WindowCaptureRoot private constructor(
  context: Context,
  private val layers: List<View>
) : View(context) {

  private val location = IntArray(2)

  override fun draw(canvas: Canvas) {
    for (layer in layers) {
      if (!layer.isAttachedToWindow) continue
      layer.getLocationOnScreen(location)
      val saveCount = canvas.save()
      canvas.translate(location[0].toFloat(), location[1].toFloat())
      layer.draw(canvas)
      canvas.restoreToCount(saveCount)
    }
  }

  companion object {
    /**
     * Returns a capture root combining [activityRoot] (QmBlurView's default
     * capture root) and [host]'s own window root, or null when [host] is in
     * the activity window itself and [activityRoot] already covers it.
     */
    fun forHost(host: View, activityRoot: View?): WindowCaptureRoot? {
      if (activityRoot == null || !host.isAttachedToWindow) return null
      val windowRoot = host.rootView
      if (windowRoot === host || windowRoot === activityRoot.rootView) return null
      return WindowCaptureRoot(host.context, listOf(activityRoot, windowRoot))
    }
  }
}
