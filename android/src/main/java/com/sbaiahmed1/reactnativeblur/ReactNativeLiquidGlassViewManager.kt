package com.sbaiahmed1.reactnativeblur

import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.uimanager.ViewGroupManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.ViewManagerDelegate
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

  override fun setGlassType(view: ReactNativeLiquidGlassView?, glassType: String?) {
    view?.setGlassType(glassType ?: "clear")
  }

  override fun setGlassTintColor(view: ReactNativeLiquidGlassView?, glassTintColor: Int?) {
    view?.setGlassTintColor(glassTintColor)
  }

  override fun setGlassOpacity(view: ReactNativeLiquidGlassView?, glassOpacity: Double) {
    view?.setGlassOpacity(glassOpacity.toFloat())
  }

  override fun setIsInteractive(view: ReactNativeLiquidGlassView?, isInteractive: Boolean) {
    view?.setIsInteractive(isInteractive)
  }

  override fun setReducedTransparencyFallbackColor(view: ReactNativeLiquidGlassView?, reducedTransparencyFallbackColor: Int?) {
    // no-op
  }

  override fun setIgnoreSafeArea(view: ReactNativeLiquidGlassView?, ignoreSafeArea: Boolean) {
    // no-op
  }

  override fun setBorderRadius(view: ReactNativeLiquidGlassView?, borderRadius: Float) {
    view?.setBorderRadius(borderRadius)
  }

  override fun setBorderTopLeftRadius(view: ReactNativeLiquidGlassView?, borderTopLeftRadius: Float) {
    view?.setBorderTopLeftRadius(borderTopLeftRadius)
  }

  override fun setBorderTopRightRadius(view: ReactNativeLiquidGlassView?, borderTopRightRadius: Float) {
    view?.setBorderTopRightRadius(borderTopRightRadius)
  }

  override fun setBorderBottomLeftRadius(view: ReactNativeLiquidGlassView?, borderBottomLeftRadius: Float) {
    view?.setBorderBottomLeftRadius(borderBottomLeftRadius)
  }

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
