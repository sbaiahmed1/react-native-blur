package com.sbaiahmed1.reactnativeblur

import android.app.Activity
import android.view.View
import android.view.ViewGroup

object RootViewFinder {
  fun findRootView(view: View): ViewGroup? {
    // Strategy 1: walk up to content view
    var parent = view.parent
    while (parent != null) {
      if (parent is ViewGroup && parent.id == android.R.id.content) return parent
      parent = parent.parent
    }
    // Strategy 2: activity content
    (view.context as? Activity)?.findViewById<ViewGroup>(android.R.id.content)?.let { return it }
    // Strategy 3: immediate parent
    return view.parent as? ViewGroup
  }
}
