package com.sbaiahmed1.reactnativeblur

import android.view.View
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

  override fun addView(parent: ReactNativeLiquidGlassView, child: View, index: Int) {
    parent.addReactSubview(child, index)
  }

  override fun removeViewAt(parent: ReactNativeLiquidGlassView, index: Int) {
    parent.removeReactSubviewAt(index)
  }

  override fun getChildAt(parent: ReactNativeLiquidGlassView, index: Int): View {
    return parent.getReactSubviewAt(index)
  }

  override fun getChildCount(parent: ReactNativeLiquidGlassView): Int {
    return parent.getReactSubviewCount()
  }

  override fun needsCustomLayoutForChildren(): Boolean {
    return true
  }

  @ReactProp(name = "glassType")
  override fun setGlassType(view: ReactNativeLiquidGlassView?, glassType: String?) {
    view?.setGlassType(glassType ?: "clear")
  }

  @ReactProp(name = "glassTintColor")
  override fun setGlassTintColor(view: ReactNativeLiquidGlassView?, glassTintColor: String?) {
    view?.setGlassTintColor(glassTintColor)
  }

  @ReactProp(name = "glassOpacity")
  override fun setGlassOpacity(view: ReactNativeLiquidGlassView?, glassOpacity: Double) {
    view?.setGlassOpacity(glassOpacity.toFloat())
  }

  @ReactProp(name = "reducedTransparencyFallbackColor")
  override fun setReducedTransparencyFallbackColor(view: ReactNativeLiquidGlassView?, reducedTransparencyFallbackColor: String?) {
    // no-op for Android
  }

  @ReactProp(name = "isInteractive")
  override fun setIsInteractive(view: ReactNativeLiquidGlassView?, isInteractive: Boolean) {
    view?.setIsInteractive(isInteractive)
  }

  @ReactProp(name = "ignoreSafeArea")
  override fun setIgnoreSafeArea(view: ReactNativeLiquidGlassView?, ignoreSafeArea: Boolean) {
    // no-op for Android
  }

  companion object {
    const val NAME = "ReactNativeLiquidGlassView"
  }
}
