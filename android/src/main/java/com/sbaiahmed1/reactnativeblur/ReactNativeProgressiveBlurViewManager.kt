package com.sbaiahmed1.reactnativeblur

import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.ViewGroupManager
import com.facebook.react.uimanager.ViewManagerDelegate
import com.facebook.react.uimanager.annotations.ReactProp
import com.facebook.react.viewmanagers.ReactNativeProgressiveBlurViewManagerInterface
import com.facebook.react.viewmanagers.ReactNativeProgressiveBlurViewManagerDelegate

/**
 * View manager for the ReactNativeProgressiveBlurView component.
 * Handles prop updates and view lifecycle for progressive blur effects on Android.
 *
 * A ViewGroupManager (not SimpleViewManager) so React children can mount
 * INSIDE the native view on Android: the view draws them unmasked on top of
 * the blur and excludes them from backdrop captures — children hoisted as
 * siblings would be baked into the blurred backdrop as a ghost copy.
 */
@ReactModule(name = ReactNativeProgressiveBlurViewManager.NAME)
class ReactNativeProgressiveBlurViewManager : ViewGroupManager<ReactNativeProgressiveBlurView>(),
  ReactNativeProgressiveBlurViewManagerInterface<ReactNativeProgressiveBlurView> {
  private val mDelegate: ViewManagerDelegate<ReactNativeProgressiveBlurView>

  init {
    mDelegate = ReactNativeProgressiveBlurViewManagerDelegate(this)
  }

  override fun getDelegate(): ViewManagerDelegate<ReactNativeProgressiveBlurView>? {
    return mDelegate
  }

  override fun getName(): String {
    return NAME
  }

  public override fun createViewInstance(context: ThemedReactContext): ReactNativeProgressiveBlurView {
    return ReactNativeProgressiveBlurView(context)
  }

  @ReactProp(name = "blurType")
  override fun setBlurType(view: ReactNativeProgressiveBlurView?, blurType: String?) {
    // Provide default value if blurType is null or empty
    val safeBlurType = if (blurType.isNullOrBlank()) "regular" else blurType
    view?.setBlurType(safeBlurType)
  }

  @ReactProp(name = "blurAmount")
  override fun setBlurAmount(view: ReactNativeProgressiveBlurView?, blurAmount: Double) {
    view?.setBlurAmount(blurAmount.toFloat())
  }

  @ReactProp(name = "blurRounds")
  override fun setBlurRounds(view: ReactNativeProgressiveBlurView?, blurRounds: Int) {
    view?.setRounds(blurRounds)
  }

  @ReactProp(name = "direction")
  override fun setDirection(view: ReactNativeProgressiveBlurView?, direction: String?) {
    // Provide default value if direction is null or empty
    val safeDirection = if (direction.isNullOrBlank()) "blurredTopClearBottom" else direction
    view?.setDirection(safeDirection)
  }

  @ReactProp(name = "startOffset")
  override fun setStartOffset(view: ReactNativeProgressiveBlurView?, startOffset: Double) {
    view?.setStartOffset(startOffset.toFloat())
  }

  @ReactProp(name = "reducedTransparencyFallbackColor")
  override fun setReducedTransparencyFallbackColor(
    view: ReactNativeProgressiveBlurView?,
    reducedTransparencyFallbackColor: String?
  ) {
    // no-op
  }

  // Border radii come from the style (BaseViewManager setters, not the codegen
  // spec). With children mounted inside the native view on Android, the view
  // must clip itself — the JS container that used to apply overflow: hidden
  // no longer wraps it.
  @ReactProp(name = "borderRadius")
  override fun setBorderRadius(view: ReactNativeProgressiveBlurView?, borderRadius: Float) {
    view?.setBorderRadius(borderRadius)
  }

  @ReactProp(name = "borderTopLeftRadius")
  override fun setBorderTopLeftRadius(view: ReactNativeProgressiveBlurView?, borderTopLeftRadius: Float) {
    view?.setBorderTopLeftRadius(borderTopLeftRadius)
  }

  @ReactProp(name = "borderTopRightRadius")
  override fun setBorderTopRightRadius(view: ReactNativeProgressiveBlurView?, borderTopRightRadius: Float) {
    view?.setBorderTopRightRadius(borderTopRightRadius)
  }

  @ReactProp(name = "borderBottomLeftRadius")
  override fun setBorderBottomLeftRadius(view: ReactNativeProgressiveBlurView?, borderBottomLeftRadius: Float) {
    view?.setBorderBottomLeftRadius(borderBottomLeftRadius)
  }

  @ReactProp(name = "borderBottomRightRadius")
  override fun setBorderBottomRightRadius(view: ReactNativeProgressiveBlurView?, borderBottomRightRadius: Float) {
    view?.setBorderBottomRightRadius(borderBottomRightRadius)
  }

  /**
   * Called when view is detached from view hierarchy and allows for cleanup.
   * This prevents the white screen issue during navigation transitions on Android.
   */
  override fun onDropViewInstance(view: ReactNativeProgressiveBlurView) {
    super.onDropViewInstance(view)
    // Call cleanup to reset state and prevent white screen artifacts
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
    const val NAME = "ReactNativeProgressiveBlurView"
  }
}
