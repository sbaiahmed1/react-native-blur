package com.sbaiahmed1.reactnativeblur

import android.os.Build
import android.util.Log

internal enum class SourceKind { PLATFORM, BEHIND, SOFTWARE }

/** Picks the backdrop source of a host: Android's own backdrop in the activity window, the views behind it by reference, or the software capture when their nodes cannot be read. */
internal object BackdropSources {
  fun kind(platform: Boolean, activityWindow: Boolean, nodeAccess: () -> Boolean): SourceKind =
    when {
      platform && activityWindow -> SourceKind.PLATFORM
      nodeAccess() -> SourceKind.BEHIND
      else -> SourceKind.SOFTWARE
    }

  fun resolve(host: BackdropHostView): BackdropSource? {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.S) return SoftwareSource.forHost(host)
    val platform = host.allowsPlatformBackdrop && PlatformBackdropApi.available
    // A Modal or other dialog has its own window, which the platform backdrop cannot cross.
    val activityWindow = platform && host.rootView === CaptureRoots.activityDecor(host)
    val kind = kind(platform, activityWindow) { RenderNodeAccess.available }
    if (Log.isLoggable(TAG, Log.DEBUG)) Log.d(TAG, "${host.javaClass.simpleName} uses $kind")
    return when (kind) {
      SourceKind.PLATFORM -> PlatformSource.forHost(host)
      SourceKind.BEHIND -> BehindSource.forHost(host)
      SourceKind.SOFTWARE -> SoftwareSource.forHost(host)
    }
  }

  private const val TAG = "RNBackdrop"
}

/** View px per backdrop px, per kind of host. */
internal object BackdropScale {
  const val BLUR = 8
  const val GLASS = 3
}
