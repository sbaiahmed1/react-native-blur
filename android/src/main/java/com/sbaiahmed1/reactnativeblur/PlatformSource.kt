package com.sbaiahmed1.reactnativeblur

import android.graphics.Color
import android.graphics.Rect
import android.graphics.RenderEffect
import android.graphics.RenderNode
import android.os.Build
import android.view.View
import android.view.ViewTreeObserver
import androidx.annotation.RequiresApi

/** Lets Android blur what its window drew behind each host: the node holds nothing and carries the effect as a backdrop effect. */
@RequiresApi(Build.VERSION_CODES.S)
internal class PlatformSource private constructor(private val root: View) : BackdropSource, ViewTreeObserver.OnPreDrawListener {

  private val hosts = LinkedHashSet<BackdropHostView>()
  private var observer: ViewTreeObserver? = null
  private val visibleRect = Rect()

  override fun addHost(host: BackdropHostView) {
    if (!hosts.add(host)) return
    if (hosts.size == 1) observer = root.viewTreeObserver.also { it.addOnPreDrawListener(this) }
    host.postInvalidateOnAnimation()
  }

  override fun removeHost(host: BackdropHostView) {
    if (!hosts.remove(host)) return
    if (hosts.isNotEmpty()) return
    observer?.let { if (it.isAlive) it.removeOnPreDrawListener(this) }
    observer = null
    if (sources[root] === this) sources.remove(root)
  }

  override fun onPreDraw(): Boolean {
    // A host that is never drawn would ask for a frame on every pre-draw through its first-draw invalidate.
    for (host in hosts) if (host.wantsBackdrop && host.isBackdropVisible && host.getGlobalVisibleRect(visibleRect)) host.onBackdropFrame()
    return true
  }

  // hwui snapshots the window on every frame, so the node records again only for a new size.
  override fun contentKey(host: BackdropHostView): Any = KEY

  override fun recordInto(node: RenderNode, host: BackdropHostView): Boolean {
    node.setPosition(0, 0, host.width, host.height)
    node.setPivotX(0f)
    node.setPivotY(0f)
    node.setScaleX(1f)
    node.setScaleY(1f)
    val canvas = node.beginRecording(host.width, host.height)
    try {
      // A transparent SRC_OVER fill keeps the backdrop, a CLEAR fill suppresses it on 37.2.
      canvas.drawColor(Color.TRANSPARENT)
    } finally {
      node.endRecording()
    }
    return true
  }

  override fun applyEffect(node: RenderNode, effect: RenderEffect): Boolean {
    if (PlatformBackdropApi.set(node, effect)) return true
    failAll()
    return false
  }

  override fun scale(host: BackdropHostView): Int = 1

  companion object {
    private val KEY = Any()
    private val sources = HashMap<View, PlatformSource>()
    private var failed = false

    /** The shared source of [host]'s window. */
    fun forHost(host: BackdropHostView): PlatformSource {
      val root = host.rootView
      return sources.getOrPut(root) { PlatformSource(root) }
    }

    /** Moves every host off the platform backdrop once a call failed. */
    fun failAll() {
      if (failed) return
      failed = true
      for (source in sources.values.toList()) for (host in source.hosts.toList()) host.post { host.resolveSourceAgain() }
    }
  }
}
