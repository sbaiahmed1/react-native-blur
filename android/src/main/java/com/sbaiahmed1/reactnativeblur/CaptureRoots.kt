package com.sbaiahmed1.reactnativeblur

import android.view.View
import android.view.ViewGroup
import com.facebook.react.ReactRootView

/** Resolves the ancestor a blur or glass view captures as its backdrop. */
internal object CaptureRoots {
  // Matched by name because react-native-screens is not a dependency. consumer-rules.pro keeps these names under R8.
  private val SCREEN_CLASS_NAMES = setOf(
    "com.swmansion.rnscreens.Screen",
    "com.swmansion.rnscreens.gamma.tabs.screen.TabsScreen",
    "com.swmansion.rnscreens.gamma.tabs.TabScreen"
  )

  /** Nearest ancestor that is a react-native-screens stack or tab screen. */
  fun findScreenAncestor(view: View): ViewGroup? =
    findAncestor(view) { it.javaClass.name in SCREEN_CLASS_NAMES }

  /** Nearest ancestor that is a ReactRootView, which includes the New Architecture ReactSurfaceView. */
  fun findReactRoot(view: View): ViewGroup? = findAncestor(view) { it is ReactRootView }

  fun resolve(view: View): ViewGroup? = findScreenAncestor(view) ?: findReactRoot(view)

  private inline fun findAncestor(view: View, match: (ViewGroup) -> Boolean): ViewGroup? {
    var parent = view.parent
    while (parent != null) {
      if (parent is ViewGroup && match(parent)) return parent
      parent = parent.parent
    }
    return null
  }
}
