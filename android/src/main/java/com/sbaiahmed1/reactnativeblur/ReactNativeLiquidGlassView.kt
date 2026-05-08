package com.sbaiahmed1.reactnativeblur

import android.content.Context
import android.graphics.Color
import android.util.AttributeSet
import android.widget.FrameLayout

class ReactNativeLiquidGlassView : FrameLayout {

  constructor(context: Context) : super(context) {
    setupView()
  }

  constructor(context: Context, attrs: AttributeSet?) : super(context, attrs) {
    setupView()
  }

  private fun setupView() {
    setBackgroundColor(Color.argb(128, 200, 200, 200))
  }
}
