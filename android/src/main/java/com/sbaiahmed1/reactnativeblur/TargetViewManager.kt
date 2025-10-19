package com.sbaiahmed1.reactnativeblur

import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.ViewGroupManager
import com.facebook.react.uimanager.ViewManagerDelegate
import com.facebook.react.uimanager.annotations.ReactProp
import com.facebook.react.viewmanagers.TargetViewManagerInterface
import com.facebook.react.viewmanagers.TargetViewManagerDelegate

@ReactModule(name = TargetViewManager.NAME)
class TargetViewManager : ViewGroupManager<TargetView>(),
  TargetViewManagerInterface<TargetView> {
  private val mDelegate: ViewManagerDelegate<TargetView> = TargetViewManagerDelegate(this)

  override fun getDelegate(): ViewManagerDelegate<TargetView> {
    return mDelegate
  }

  public override fun createViewInstance(context: ThemedReactContext): TargetView {
    return TargetView(context)
  }

  override fun getName(): String {
    return NAME
  }

  companion object {
    const val NAME = "TargetView"
  }

  @Override
  @ReactProp(name = "id")
  override fun setId(view: TargetView?, id: String?) {
    view?.setId(id)
  }
}
