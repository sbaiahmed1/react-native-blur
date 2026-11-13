package com.sbaiahmed1.reactnativeblur

import android.util.Log
import android.view.View
import android.view.ViewTreeObserver

/** Redraws a blur view in a dialog window when the window behind the dialog draws. */
internal class BehindWindowInvalidator private constructor(
  private val behindRoot: View,
  private val target: View
) : ViewTreeObserver.OnPreDrawListener {

  // Held from install, since a detached view hands out a different, floating observer.
  private val observer: ViewTreeObserver = behindRoot.viewTreeObserver

  override fun onPreDraw(): Boolean {
    target.postInvalidateOnAnimation()
    return true
  }

  fun remove() {
    try {
      if (observer.isAlive) observer.removeOnPreDrawListener(this)
    } catch (e: Exception) {
      Log.d(TAG, "Could not remove the behind-window listener from ${behindRoot.javaClass.simpleName}: ${e.message}")
    }
  }

  companion object {
    private const val TAG = "BehindWindowInvalidator"

    fun install(behindRoot: View, target: View): BehindWindowInvalidator {
      val invalidator = BehindWindowInvalidator(behindRoot, target)
      invalidator.observer.addOnPreDrawListener(invalidator)
      return invalidator
    }
  }
}
