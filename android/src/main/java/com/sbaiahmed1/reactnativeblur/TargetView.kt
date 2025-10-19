package com.sbaiahmed1.reactnativeblur

import android.content.Context
import android.util.AttributeSet
import android.util.Log
import eightbitlab.com.blurview.BlurTarget

class TargetView : BlurTarget {
  private var id: String? = null
  private var isInitialized: Boolean = false

  companion object {
    private const val TAG: String = "TargetView"
  }

  constructor(context: Context): super(context) {
    this.setupBlurTarget()
  }

  constructor(context: Context, attrs: AttributeSet): super(context, attrs) {
    this.setupBlurTarget()
  }

  constructor(context: Context, attrs: AttributeSet, defStyleAttr: Int): super(context, attrs, defStyleAttr) {
    this.setupBlurTarget()
  }

  override fun onAttachedToWindow() {
    super.onAttachedToWindow()

    if (!this.isInitialized) {
      this.reinitialize()
    }
  }

  override fun onDetachedFromWindow() {
    super.onDetachedFromWindow()

    this.isInitialized = false
    this.removeCallbacks(null)
  }

  private fun setupBlurTarget() {
    super.layoutParams = LayoutParams(
      LayoutParams.MATCH_PARENT,
      LayoutParams.MATCH_PARENT
    )
  }

  private fun reinitialize() {
    post {
      this.initialize()
    }
  }

  private fun initialize() {
    if (this.id != null) {
      super.tag = this.id
      this.isInitialized = true
    } else {
      Log.w(TAG, "Target view id is null")

      this.isInitialized = false
    }
  }

  fun setId(id: String?) {
    val oldId = this.id
    this.id = id

    if (oldId != id && this.isAttachedToWindow) {
      this.isInitialized = false
      this.reinitialize()
    }
  }
}
