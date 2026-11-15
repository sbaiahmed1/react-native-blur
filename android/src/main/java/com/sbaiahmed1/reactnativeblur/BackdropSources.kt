package com.sbaiahmed1.reactnativeblur

import android.os.Build

internal enum class SourceKind { BEHIND, SOFTWARE }

/** Picks the backdrop source of a host: the views behind it by reference, or the software capture when their nodes cannot be read. */
internal object BackdropSources {
  fun kind(nodeAccess: Boolean): SourceKind = if (nodeAccess) SourceKind.BEHIND else SourceKind.SOFTWARE

  fun resolve(host: BackdropHostView): BackdropSource? {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.S) return SoftwareSource.forHost(host)
    return when (kind(RenderNodeAccess.available)) {
      SourceKind.BEHIND -> BehindSource.forHost(host)
      SourceKind.SOFTWARE -> SoftwareSource.forHost(host)
    }
  }
}

/** View px per backdrop px, per kind of host. */
internal object BackdropScale {
  const val BLUR = 8
  const val GLASS = 3
}
