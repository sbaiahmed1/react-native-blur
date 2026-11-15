package com.sbaiahmed1.reactnativeblur

import android.graphics.RenderEffect
import android.graphics.RenderNode
import android.os.Build
import android.util.Log
import androidx.annotation.RequiresApi

/** The version gate of Android's own backdrop effect, public from SDK 37.2. */
internal object PlatformBackdrop {
  /** SDK_INT_FULL of Android 17 QPR2, major * 100000 + minor. */
  const val MIN_FULL_SDK = 3_700_002

  fun isSupported(sdkInt: Int, fullSdk: Int): Boolean = sdkInt >= 37 && fullSdk >= MIN_FULL_SDK

  /** The full SDK version from [read], or the major version alone below API 36 where the field does not exist. */
  inline fun fullSdk(sdkInt: Int, read: () -> Int): Int =
    try {
      read()
    } catch (e: Exception) {
      sdkInt * 100_000
    }
}

/** RenderNode.setBackdropRenderEffect, reached by reflection so the library builds at any compileSdk. */
@RequiresApi(Build.VERSION_CODES.S)
internal object PlatformBackdropApi {
  private val setter = MethodInvoker(RenderNode::class.java, "setBackdropRenderEffect", arrayOf(RenderEffect::class.java)) { e ->
    Log.w("RNBackdrop", "RenderNode.setBackdropRenderEffect failed (${e.javaClass.simpleName}: ${e.message}), blur views use the views behind them")
  }

  // The flag is read first, so nothing is looked up when the app did not opt in.
  private val supported: Boolean by lazy {
    BuildConfig.PLATFORM_BACKDROP &&
      PlatformBackdrop.isSupported(
        Build.VERSION.SDK_INT,
        PlatformBackdrop.fullSdk(Build.VERSION.SDK_INT) { Build.VERSION::class.java.getField("SDK_INT_FULL").getInt(null) }
      )
  }

  /** False for good once a call failed. */
  val available: Boolean
    get() = supported && setter.available

  fun set(node: RenderNode, effect: RenderEffect): Boolean = available && setter.invoke(node, effect)
}
