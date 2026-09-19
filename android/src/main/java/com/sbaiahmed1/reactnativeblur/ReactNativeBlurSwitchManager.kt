package com.sbaiahmed1.reactnativeblur

import com.facebook.react.bridge.Arguments
import com.facebook.react.common.MapBuilder
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.ViewManagerDelegate
import com.facebook.react.uimanager.annotations.ReactProp
import com.facebook.react.uimanager.events.RCTEventEmitter
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
      context.getJSModule(RCTEventEmitter::class.java)
        .receiveEvent(view.id, "topValueChange", Arguments.createMap().apply {
          putBoolean("value", value)
        })
    }

    return view
  }

  @ReactProp(name = "value")
  override fun setValue(view: ReactNativeBlurSwitch?, value: Boolean) {
    view?.setValue(value)
  }

  @ReactProp(name = "blurAmount")
  override fun setBlurAmount(view: ReactNativeBlurSwitch?, blurAmount: Double) {
    view?.setBlurAmount(blurAmount.toFloat())
  }

  @ReactProp(name = "blurRounds")
  override fun setBlurRounds(view: ReactNativeBlurSwitch?, blurRounds: Int) {
    view?.setRounds(blurRounds)
  }

  @ReactProp(name = "thumbColor", customType = "Color")
  override fun setThumbColor(view: ReactNativeBlurSwitch?, color: Int?) {
    color?.let { view?.setThumbColor(it) }
  }

  @ReactProp(name = "trackColorOff", customType = "Color")
  override fun setTrackColorOff(view: ReactNativeBlurSwitch?, color: Int?) {
    color?.let { view?.setTrackColorOff(it) }
  }

  @ReactProp(name = "trackColorOn", customType = "Color")
  override fun setTrackColorOn(view: ReactNativeBlurSwitch?, color: Int?) {
    color?.let { view?.setTrackColorOn(it) }
  }

  @ReactProp(name = "disabled")
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
    return MapBuilder.builder<String, Any>()
      .put("topValueChange", MapBuilder.of("registrationName", "onValueChange"))
      .build()
  }

  companion object {
    const val NAME = "ReactNativeBlurSwitch"
  }
}
