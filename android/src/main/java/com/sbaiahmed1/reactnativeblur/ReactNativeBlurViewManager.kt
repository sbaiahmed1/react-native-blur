package com.sbaiahmed1.reactnativeblur

import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.uimanager.ViewGroupManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.ViewManagerDelegate
import com.facebook.react.uimanager.annotations.ReactProp
import com.facebook.react.viewmanagers.ReactNativeBlurViewManagerInterface
import com.facebook.react.viewmanagers.ReactNativeBlurViewManagerDelegate

@ReactModule(name = ReactNativeBlurViewManager.NAME)
class ReactNativeBlurViewManager : ViewGroupManager<ReactNativeBlurView>(),
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

  @ReactProp(name = "blurType")
  override fun setBlurType(view: ReactNativeBlurView?, blurType: String?) {
    view?.setBlurType(blurType ?: "light")
  }

  @ReactProp(name = "blurAmount")
  override fun setBlurAmount(view: ReactNativeBlurView?, blurAmount: Double) {
    view?.setBlurAmount(blurAmount.toFloat())
  }

  @ReactProp(name = "reducedTransparencyFallbackColor")
  override fun setReducedTransparencyFallbackColor(view: ReactNativeBlurView?, reducedTransparencyFallbackColor: String?) {
    view?.setReducedTransparencyFallbackColor(reducedTransparencyFallbackColor)
  }

  companion object {
    const val NAME = "ReactNativeBlurView"
  }
}
