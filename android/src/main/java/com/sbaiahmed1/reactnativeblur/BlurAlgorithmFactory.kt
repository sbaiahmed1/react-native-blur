package com.sbaiahmed1.reactnativeblur

import android.content.Context
import android.os.Build
import eightbitlab.com.blurview.BlurAlgorithm
import eightbitlab.com.blurview.RenderEffectBlur
import eightbitlab.com.blurview.RenderScriptBlur

object BlurAlgorithmFactory {
  fun create(context: Context): BlurAlgorithm {
    return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
      RenderEffectBlur()
    } else {
      RenderScriptBlur(context)
    }
  }
}
