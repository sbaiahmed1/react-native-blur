package com.sbaiahmed1.reactnativeblur

import com.facebook.react.BaseReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.model.ReactModuleInfoProvider
import com.facebook.react.uimanager.ViewManager

class ReactNativeBlurViewPackage : BaseReactPackage() {
  override fun createViewManagers(reactContext: ReactApplicationContext): List<ViewManager<*, *>> =
    listOf(
      ReactNativeBlurViewManager(),
      ReactNativeProgressiveBlurViewManager(),
      ReactNativeBlurSwitchManager(),
      ReactNativeLiquidGlassViewManager(),
    )

  // The library has views only, no native modules.
  override fun getModule(name: String, reactContext: ReactApplicationContext): NativeModule? = null

  override fun getReactModuleInfoProvider(): ReactModuleInfoProvider =
    ReactModuleInfoProvider { emptyMap() }
}
