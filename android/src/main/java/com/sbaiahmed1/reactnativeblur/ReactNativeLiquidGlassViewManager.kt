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

  @ReactProp(name = "isInteractive")
  override fun setIsInteractive(view: ReactNativeLiquidGlassView?, isInteractive: Boolean) {
    view?.setIsInteractive(isInteractive)
  }

  @ReactProp(name = "reducedTransparencyFallbackColor")
  override fun setReducedTransparencyFallbackColor(view: ReactNativeLiquidGlassView?, reducedTransparencyFallbackColor: String?) {
    // no-op
  }

  @ReactProp(name = "ignoreSafeArea")
  override fun setIgnoreSafeArea(view: ReactNativeLiquidGlassView?, ignoreSafeArea: Boolean) {
    // no-op
  }

  @ReactProp(name = "borderRadius")
  override fun setBorderRadius(view: ReactNativeLiquidGlassView?, borderRadius: Float) {
    view?.setBorderRadius(borderRadius)
  }

  @ReactProp(name = "borderTopLeftRadius")
  override fun setBorderTopLeftRadius(view: ReactNativeLiquidGlassView?, borderTopLeftRadius: Float) {
    view?.setBorderTopLeftRadius(borderTopLeftRadius)
  }

  @ReactProp(name = "borderTopRightRadius")
  override fun setBorderTopRightRadius(view: ReactNativeLiquidGlassView?, borderTopRightRadius: Float) {
    view?.setBorderTopRightRadius(borderTopRightRadius)
  }

  @ReactProp(name = "borderBottomLeftRadius")
  override fun setBorderBottomLeftRadius(view: ReactNativeLiquidGlassView?, borderBottomLeftRadius: Float) {
    view?.setBorderBottomLeftRadius(borderBottomLeftRadius)
  }

  @ReactProp(name = "borderBottomRightRadius")
  override fun setBorderBottomRightRadius(view: ReactNativeLiquidGlassView?, borderBottomRightRadius: Float) {
    view?.setBorderBottomRightRadius(borderBottomRightRadius)
  }

  /**
   * Called when view is detached from view hierarchy and allows for cleanup.
   */
  override fun onDropViewInstance(view: ReactNativeLiquidGlassView) {
    super.onDropViewInstance(view)
    view.cleanup()
  }

  /**
   * Indicates that React Native's Yoga layout should handle child positioning.
   * Returns false to let React Native manage the layout of children.
   */
  override fun needsCustomLayoutForChildren(): Boolean {
    return false
  }

  companion object {
    const val NAME = "ReactNativeLiquidGlassView"
  }
}
