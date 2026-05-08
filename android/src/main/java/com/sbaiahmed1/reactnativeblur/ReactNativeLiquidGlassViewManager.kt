package com.sbaiahmed1.reactnativeblur

import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.uimanager.ViewGroupManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.ViewManagerDelegate
import com.facebook.react.uimanager.annotations.ReactProp
import com.facebook.react.viewmanagers.ReactNativeLiquidGlassViewManagerInterface
import com.facebook.react.viewmanagers.ReactNativeLiquidGlassViewManagerDelegate

@ReactModule(name = ReactNativeLiquidGlassViewManager.NAME)
class ReactNativeLiquidGlassViewManager : ViewGroupManager<ReactNativeLiquidGlassView>(),
  ReactNativeLiquidGlassViewManagerInterface<ReactNativeLiquidGlassView> {
  private val mDelegate: ViewManagerDelegate<ReactNativeLiquidGlassView>

  init {
    mDelegate = ReactNativeLiquidGlassViewManagerDelegate(this)
  }

  override fun getDelegate(): ViewManagerDelegate<ReactNativeLiquidGlassView>? {
    return mDelegate
  }

  override fun getName(): String {
    return NAME
  }

  public override fun createViewInstance(context: ThemedReactContext): ReactNativeLiquidGlassView {
    return ReactNativeLiquidGlassView(context)
  }

  @ReactProp(name = "glassType")
  override fun setGlassType(view: ReactNativeLiquidGlassView?, glassType: String?) {
    // no-op for now
  }

  @ReactProp(name = "glassTintColor")
  override fun setGlassTintColor(view: ReactNativeLiquidGlassView?, glassTintColor: String?) {
    // no-op for now
  }

  @ReactProp(name = "glassOpacity")
  override fun setGlassOpacity(view: ReactNativeLiquidGlassView?, glassOpacity: Double) {
    // no-op for now
  }

  @ReactProp(name = "reducedTransparencyFallbackColor")
  override fun setReducedTransparencyFallbackColor(view: ReactNativeLiquidGlassView?, reducedTransparencyFallbackColor: String?) {
    // no-op for now
  }

  @ReactProp(name = "isInteractive")
  override fun setIsInteractive(view: ReactNativeLiquidGlassView?, isInteractive: Boolean) {
    // no-op for now
  }

  @ReactProp(name = "ignoreSafeArea")
  override fun setIgnoreSafeArea(view: ReactNativeLiquidGlassView?, ignoreSafeArea: Boolean) {
    // no-op for now
  }

  override fun needsCustomLayoutForChildren(): Boolean {
    return false
  }

  companion object {
    const val NAME = "ReactNativeLiquidGlassView"
  }
}
