package com.sbaiahmed1.reactnativeblur

import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.WritableMap
import com.facebook.react.uimanager.events.Event

/** The switch's `onValueChange` event. */
internal class ValueChangeEvent(surfaceId: Int, viewId: Int, private val value: Boolean) :
  Event<ValueChangeEvent>(surfaceId, viewId) {

  override fun getEventName(): String = EVENT_NAME

  override fun getEventData(): WritableMap =
    Arguments.createMap().apply { putBoolean("value", value) }

  companion object {
    const val EVENT_NAME = "topValueChange"
  }
}
