package com.sbaiahmed1.reactnativeblur

import android.os.Build
import android.view.ViewGroup
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.uimanager.ViewGroupManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.ViewManagerDelegate
import com.facebook.react.viewmanagers.ReactNativeBlurViewManagerInterface
import com.facebook.react.viewmanagers.ReactNativeBlurViewManagerDelegate

@ReactModule(name = ReactNativeBlurViewManager.NAME)
class ReactNativeBlurViewManager : ViewGroupManager<ViewGroup>(),
  ReactNativeBlurViewManagerInterface<ViewGroup> {
  private val mDelegate: ViewManagerDelegate<ViewGroup>

  init {
    mDelegate = ReactNativeBlurViewManagerDelegate(this)
  }

  override fun getDelegate(): ViewManagerDelegate<ViewGroup>? {
    return mDelegate
  }

  override fun getName(): String {
    return NAME
  }

  // API 31+ blurs on the GPU through the backdrop engine, older versions keep QmBlurView.
  public override fun createViewInstance(context: ThemedReactContext): ViewGroup =
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) EngineBlurView(context) else ReactNativeBlurView(context)

  override fun setBlurType(view: ViewGroup?, blurType: String?) {
    (view as? BlurViewProps)?.setBlurType(blurType ?: "xlight")
  }

  override fun setBlurAmount(view: ViewGroup?, blurAmount: Double) {
    (view as? BlurViewProps)?.setBlurAmount(blurAmount.toFloat())
  }

  override fun setBlurRounds(view: ViewGroup?, blurRounds: Int) {
    (view as? BlurViewProps)?.setRounds(blurRounds)
  }

  override fun setBorderRadius(view: ViewGroup?, borderRadius: Float) {
    (view as? BlurViewProps)?.setBorderRadius(borderRadius)
  }

  override fun setBorderTopLeftRadius(view: ViewGroup?, borderTopLeftRadius: Float) {
    (view as? BlurViewProps)?.setBorderTopLeftRadius(borderTopLeftRadius)
  }

  override fun setBorderTopRightRadius(view: ViewGroup?, borderTopRightRadius: Float) {
    (view as? BlurViewProps)?.setBorderTopRightRadius(borderTopRightRadius)
  }

  override fun setBorderBottomLeftRadius(view: ViewGroup?, borderBottomLeftRadius: Float) {
    (view as? BlurViewProps)?.setBorderBottomLeftRadius(borderBottomLeftRadius)
  }

  override fun setBorderBottomRightRadius(view: ViewGroup?, borderBottomRightRadius: Float) {
    (view as? BlurViewProps)?.setBorderBottomRightRadius(borderBottomRightRadius)
  }

  override fun setReducedTransparencyFallbackColor(view: ViewGroup?, reducedTransparencyFallbackColor: Int?) {
    // no-op
  }

  override fun setIgnoreSafeArea(view: ViewGroup?, ignoreSafeArea: Boolean) {
    // no-op
  }

  /**
   * Called when view is detached from view hierarchy and allows for cleanup.
   * This prevents the white screen issue during navigation transitions on Android.
   */
  override fun onDropViewInstance(view: ViewGroup) {
    super.onDropViewInstance(view)
    // Call cleanup to reset state and prevent white screen artifacts
    (view as? BlurViewProps)?.cleanup()
  }

  /**
   * Indicates that React Native's Yoga layout should handle child positioning.
   * Returns false to let React Native manage the layout of children.
   */
  override fun needsCustomLayoutForChildren(): Boolean {
    return false
  }

  companion object {
    const val NAME = "ReactNativeBlurView"
  }
}
