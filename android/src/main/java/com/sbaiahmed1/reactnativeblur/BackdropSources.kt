package com.sbaiahmed1.reactnativeblur

/** Picks the backdrop source of a host. */
internal object BackdropSources {
  fun resolve(host: BackdropHostView): BackdropSource? = SoftwareSource.forHost(host)
}

/** View px per backdrop px, per kind of host. */
internal object BackdropScale {
  const val BLUR = 8
  const val GLASS = 3
}
