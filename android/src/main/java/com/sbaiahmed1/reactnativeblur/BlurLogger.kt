package com.sbaiahmed1.reactnativeblur

import android.util.Log

object BlurLogger {
  var DEBUG: Boolean = false
  fun d(tag: String, msg: String) { if (DEBUG) Log.d(tag, msg) }
  fun w(tag: String, msg: String) { Log.w(tag, msg) }
  fun e(tag: String, msg: String, tr: Throwable? = null) { Log.e(tag, msg, tr) }
}
