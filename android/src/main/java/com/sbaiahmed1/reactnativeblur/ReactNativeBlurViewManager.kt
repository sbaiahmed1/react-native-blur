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
    view?.setBlurType(blurType ?: "xlight")
  }

  @ReactProp(name = "blurAmount")
  override fun setBlurAmount(view: ReactNativeBlurView?, blurAmount: Double) {
    view?.setBlurAmount(blurAmount.toFloat())
  }

  @ReactProp(name = "reducedTransparencyFallbackColor")
  override fun setReducedTransparencyFallbackColor(view: ReactNativeBlurView?, reducedTransparencyFallbackColor: String?) {
    view?.setReducedTransparencyFallbackColor(reducedTransparencyFallbackColor)
  }

  @ReactProp(name = "glassTintColor")
  fun setGlassTintColor(view: ReactNativeBlurView?, glassTintColor: String?) {
    view?.setGlassTintColor(glassTintColor)
  }

  @ReactProp(name = "glassOpacity")
  fun setGlassOpacity(view: ReactNativeBlurView?, glassOpacity: Double) {
    view?.setGlassOpacity(glassOpacity.toFloat())
  }

  @ReactProp(name = "type")
  fun setType(view: ReactNativeBlurView?, type: String?) {
    view?.setType(type ?: "blur")
  }

  @ReactProp(name = "glassType")
  fun setGlassType(view: ReactNativeBlurView?, glassType: String?) {
    view?.setGlassType(glassType ?: "clear")
  }

  @ReactProp(name = "isInteractive")
  fun setIsInteractive(view: ReactNativeBlurView?, isInteractive: Boolean) {
    view?.setIsInteractive(isInteractive)
  }

  @ReactProp(name = "borderRadius")
  override fun setBorderRadius(view: ReactNativeBlurView?, borderRadius: Float) {
    view?.setBorderRadius(borderRadius)
  }

  @ReactProp(name = "ignoreSafeArea")
  override fun setIgnoreSafeArea(view: ReactNativeBlurView?, ignoreSafeArea: Boolean) {
    // no-op
  }

  /**
   * Called when view is detached from view hierarchy and allows for cleanup.
   * This prevents the white screen issue during navigation transitions on Android.
   */
  override fun onDropViewInstance(view: ReactNativeBlurView) {
    super.onDropViewInstance(view)
    // Call cleanup to reset state and prevent white screen artifacts
    view.cleanup()
  }

  companion object {
    const val NAME = "ReactNativeBlurView"
  }
}
