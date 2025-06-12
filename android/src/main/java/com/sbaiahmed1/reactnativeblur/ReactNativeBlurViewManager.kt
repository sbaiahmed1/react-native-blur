package com.sbaiahmed1.reactnativeblur

import android.graphics.Color
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.ViewManagerDelegate
import com.facebook.react.uimanager.annotations.ReactProp
import com.facebook.react.viewmanagers.ReactNativeBlurViewManagerInterface
import com.facebook.react.viewmanagers.ReactNativeBlurViewManagerDelegate

@ReactModule(name = ReactNativeBlurViewManager.NAME)
class ReactNativeBlurViewManager : SimpleViewManager<ReactNativeBlurView>(),
  ReactNativeBlurViewManagerInterface<ReactNativeBlurView> {
  private val mDelegate: ViewManagerDelegate<ReactNativeBlurView>

  init {
    mDelegate = ReactNativeBlurViewManagerDelegate(this)
  }

  override fun getDelegate(): ViewManagerDelegate<ReactNativeBlurView>? {
    return mDelegate
  }

  override fun getName(): String {
    return NAME
  }

  public override fun createViewInstance(context: ThemedReactContext): ReactNativeBlurView {
    return ReactNativeBlurView(context)
  }

  @ReactProp(name = "color")
  override fun setColor(view: ReactNativeBlurView?, color: String?) {
    view?.setBackgroundColor(Color.parseColor(color))
  }

  companion object {
    const val NAME = "ReactNativeBlurView"
  }
}
