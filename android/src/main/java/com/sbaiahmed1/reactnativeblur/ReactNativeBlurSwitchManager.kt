package com.sbaiahmed1.reactnativeblur

import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.UIManagerHelper
import com.facebook.react.uimanager.ViewManagerDelegate
import com.facebook.react.viewmanagers.ReactNativeBlurSwitchManagerInterface
import com.facebook.react.viewmanagers.ReactNativeBlurSwitchManagerDelegate

@ReactModule(name = ReactNativeBlurSwitchManager.NAME)
class ReactNativeBlurSwitchManager : SimpleViewManager<ReactNativeBlurSwitch>(),
  ReactNativeBlurSwitchManagerInterface<ReactNativeBlurSwitch> {

  private val mDelegate: ViewManagerDelegate<ReactNativeBlurSwitch> =
    ReactNativeBlurSwitchManagerDelegate(this)

  override fun getDelegate(): ViewManagerDelegate<ReactNativeBlurSwitch> {
    return mDelegate
  }

  override fun getName(): String {
    return NAME
  }

  public override fun createViewInstance(context: ThemedReactContext): ReactNativeBlurSwitch {
    val view = ReactNativeBlurSwitch(context)

    view.setOnValueChangeListener { value ->
      // Deprecated in recent React Native, but its replacement does not exist in 0.80, which the library still supports.
      @Suppress("DEPRECATION")
      UIManagerHelper.getEventDispatcherForReactTag(context, view.id)
        ?.dispatchEvent(ValueChangeEvent(UIManagerHelper.getSurfaceId(context), view.id, value))
    }

    return view
  }

  override fun setValue(view: ReactNativeBlurSwitch?, value: Boolean) {
    view?.setValue(value)
  }

  override fun setNativeValue(view: ReactNativeBlurSwitch?, value: Boolean) {
    view?.setValue(value)
  }

  override fun setBlurAmount(view: ReactNativeBlurSwitch?, blurAmount: Double) {
    view?.setBlurAmount(blurAmount.toFloat())
  }

  override fun setBlurRounds(view: ReactNativeBlurSwitch?, blurRounds: Int) {
    view?.setRounds(blurRounds)
  }

  override fun setThumbColor(view: ReactNativeBlurSwitch?, color: Int?) {
    color?.let { view?.setThumbColor(it) }
  }

  override fun setTrackColorOff(view: ReactNativeBlurSwitch?, color: Int?) {
    color?.let { view?.setTrackColorOff(it) }
  }

  override fun setTrackColorOn(view: ReactNativeBlurSwitch?, color: Int?) {
    color?.let { view?.setTrackColorOn(it) }
  }

  override fun setDisabled(view: ReactNativeBlurSwitch?, disabled: Boolean) {
    view?.setDisabled(disabled)
  }

  /**
   * Called when view is detached from view hierarchy and allows for cleanup.
   */
  override fun onDropViewInstance(view: ReactNativeBlurSwitch) {
    super.onDropViewInstance(view)
    // Reset state and drop listeners now that React Native is done with the view.
    view.cleanup()
  }

  override fun getExportedCustomDirectEventTypeConstants(): Map<String, Any> {
    return mapOf(ValueChangeEvent.EVENT_NAME to mapOf("registrationName" to "onValueChange"))
  }

  companion object {
    const val NAME = "ReactNativeBlurSwitch"
  }
}
