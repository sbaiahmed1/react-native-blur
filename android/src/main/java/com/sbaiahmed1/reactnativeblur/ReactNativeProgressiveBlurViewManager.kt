package com.sbaiahmed1.reactnativeblur

import android.os.Build
import android.view.ViewGroup
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.ViewGroupManager
import com.facebook.react.uimanager.ViewManagerDelegate
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
class ReactNativeProgressiveBlurViewManager : ViewGroupManager<ViewGroup>(),
  ReactNativeProgressiveBlurViewManagerInterface<ViewGroup> {
  private val mDelegate: ViewManagerDelegate<ViewGroup>

  init {
    mDelegate = ReactNativeProgressiveBlurViewManagerDelegate(this)
  }

  override fun getDelegate(): ViewManagerDelegate<ViewGroup>? {
    return mDelegate
  }

  override fun getName(): String {
    return NAME
  }

  // API 31+ blurs on the GPU through the backdrop engine, older versions keep QmBlurView.
  public override fun createViewInstance(context: ThemedReactContext): ViewGroup =
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) EngineProgressiveBlurView(context)
    else ReactNativeProgressiveBlurView(context)

  override fun setBlurType(view: ViewGroup?, blurType: String?) {
    // Provide default value if blurType is null or empty
    val safeBlurType = if (blurType.isNullOrBlank()) "regular" else blurType
    (view as? ProgressiveBlurViewProps)?.setBlurType(safeBlurType)
  }

  override fun setBlurAmount(view: ViewGroup?, blurAmount: Double) {
    (view as? ProgressiveBlurViewProps)?.setBlurAmount(blurAmount.toFloat())
  }

  override fun setBlurRounds(view: ViewGroup?, blurRounds: Int) {
    (view as? ProgressiveBlurViewProps)?.setRounds(blurRounds)
  }

  override fun setDirection(view: ViewGroup?, direction: String?) {
    // Provide default value if direction is null or empty
    val safeDirection = if (direction.isNullOrBlank()) "blurredTopClearBottom" else direction
    (view as? ProgressiveBlurViewProps)?.setDirection(safeDirection)
  }

  override fun setStartOffset(view: ViewGroup?, startOffset: Double) {
    (view as? ProgressiveBlurViewProps)?.setStartOffset(startOffset.toFloat())
  }

  override fun setReducedTransparencyFallbackColor(
    view: ViewGroup?,
    reducedTransparencyFallbackColor: Int?
  ) {
    // no-op
  }

  override fun setMaterialTint(view: ViewGroup?, materialTint: Int?) {
    // no-op
  }

  override fun setMaterialSaturation(view: ViewGroup?, materialSaturation: Double) {
    // no-op
  }

  override fun setMaterialRadius(view: ViewGroup?, materialRadius: Double) {
    // no-op
  }

  // Border radii come from the style (BaseViewManager setters, not the codegen
  // spec). With children mounted inside the native view on Android, the view
  // must clip itself — the JS container that used to apply overflow: hidden
  // no longer wraps it.
  override fun setBorderRadius(view: ViewGroup?, borderRadius: Float) {
    (view as? ProgressiveBlurViewProps)?.setBorderRadius(borderRadius)
  }

  override fun setBorderTopLeftRadius(view: ViewGroup?, borderTopLeftRadius: Float) {
    (view as? ProgressiveBlurViewProps)?.setBorderTopLeftRadius(borderTopLeftRadius)
  }

  override fun setBorderTopRightRadius(view: ViewGroup?, borderTopRightRadius: Float) {
    (view as? ProgressiveBlurViewProps)?.setBorderTopRightRadius(borderTopRightRadius)
  }

  override fun setBorderBottomLeftRadius(view: ViewGroup?, borderBottomLeftRadius: Float) {
    (view as? ProgressiveBlurViewProps)?.setBorderBottomLeftRadius(borderBottomLeftRadius)
  }

  override fun setBorderBottomRightRadius(view: ViewGroup?, borderBottomRightRadius: Float) {
    (view as? ProgressiveBlurViewProps)?.setBorderBottomRightRadius(borderBottomRightRadius)
  }

  /**
   * Called when view is detached from view hierarchy and allows for cleanup.
   * This prevents the white screen issue during navigation transitions on Android.
   */
  override fun onDropViewInstance(view: ViewGroup) {
    super.onDropViewInstance(view)
    // Call cleanup to reset state and prevent white screen artifacts
    (view as? ProgressiveBlurViewProps)?.cleanup()
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
