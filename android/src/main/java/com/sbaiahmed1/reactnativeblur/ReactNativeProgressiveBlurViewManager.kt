package com.sbaiahmed1.reactnativeblur

import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.ViewManagerDelegate
import com.facebook.react.uimanager.annotations.ReactProp
import com.facebook.react.viewmanagers.ReactNativeProgressiveBlurViewManagerInterface
import com.facebook.react.viewmanagers.ReactNativeProgressiveBlurViewManagerDelegate

/**
 * View manager for the ReactNativeProgressiveBlurView component.
 * Handles prop updates and view lifecycle for progressive blur effects on Android.
 */
@ReactModule(name = ReactNativeProgressiveBlurViewManager.NAME)
class ReactNativeProgressiveBlurViewManager : SimpleViewManager<ReactNativeProgressiveBlurView>(),
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
    view?.setReducedTransparencyFallbackColor(reducedTransparencyFallbackColor)
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

  companion object {
    const val NAME = "ReactNativeProgressiveBlurView"
  }
}
