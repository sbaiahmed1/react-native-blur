package com.sbaiahmed1.reactnativeblur

import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.Paint
import android.graphics.RenderNode
import android.os.Build
import android.os.SystemClock
import android.util.Log
import android.view.View
import android.view.ViewTreeObserver
import androidx.annotation.RequiresApi
import kotlin.math.ceil

/** One software capture per frame of a capture root, shared by every backdrop host under it, behind [AnimationDeferral]. */

internal class SoftwareSource private constructor(
  private val key: View,
  private val root: View,
  // The view whose window this source listens to: the root, or the dialog root inside a Modal.
  private val listenerRoot: View,
  private val animationRoots: List<View>,
  // Set for a window root (Modal), whose capture runs in screen coordinates.
  private val activityDecor: View?
) : BackdropSource, ViewTreeObserver.OnPreDrawListener {

  internal data class Snapshot(
    val bitmap: Bitmap,
    val generation: Long,
    val offsetX: Int,
    val offsetY: Int,
    val downsample: Int
  )

  private class Buffer(val bitmap: Bitmap) {
    val canvas = Canvas(bitmap)
  }

  private class Region(var bounds: CaptureLane.Bounds) {
    // A capture draws into the spare buffer, so a failed one leaves the published capture as it was.
    val buffers = SwapBuffer(
      create = { w, h -> Buffer(Bitmap.createBitmap(w, h, Bitmap.Config.ARGB_8888)) },
      release = { it.bitmap.recycle() }
    ) { it.bitmap.width to it.bitmap.height }
    val bitmap: Bitmap?
      get() = buffers.published?.bitmap
    // The bounds the bitmap holds, which lag behind bounds until a capture succeeds.
    var bitmapBounds: CaptureLane.Bounds? = null
    var generation = 0L
  }

  private class Lane(val config: CaptureLane) {
    val regions = HashMap<Any, Region>()
    val capturedBounds = HashMap<BackdropHostView, CaptureLane.Bounds>()
  }

  private val hosts = LinkedHashSet<BackdropHostView>()
  private val nestedHosts = HashSet<BackdropHostView>()
  private val lanes = HashMap<Int, Lane>()
  private val hostBounds = HashMap<BackdropHostView, CaptureLane.Bounds>()
  private val deferral = AnimationDeferral()
  private var observer: ViewTreeObserver? = null
  private var behindInvalidator: BehindWindowInvalidator? = null
  private var releaseListener: View.OnAttachStateChangeListener? = null
  private var failureLogged = false
  private val trailing = TrailingDeadline()
  private val location = IntArray(2)
  private val rootLocation = IntArray(2)
  private val bitmapPaint = Paint(Paint.FILTER_BITMAP_FLAG)
  private val trailingFrame = Runnable {
    trailing.clear()
    hosts.firstOrNull { it.isBackdropVisible }?.invalidate()
  }

  override fun addHost(host: BackdropHostView) {
    if (!hosts.add(host)) return
    if (hosts.size == 1) {
      deferral.rearm()
      releaseListener?.let { listenerRoot.removeOnAttachStateChangeListener(it) }
      releaseListener = null
      observer = listenerRoot.viewTreeObserver.also { it.addOnPreDrawListener(this) }
      if (activityDecor != null) behindInvalidator = BehindWindowInvalidator.install(activityDecor, listenerRoot)
    }
    lanes.getOrPut(host.downsample) { Lane(laneFor(host.downsample)) }
    host.postInvalidateOnAnimation()
  }

  override fun removeHost(host: BackdropHostView) {
    if (!hosts.remove(host)) return
    hostBounds.remove(host)
    for (lane in lanes.values) {
      lane.capturedBounds.remove(host)
      lane.regions.remove(host)
    }
    nestedHosts.remove(host)
    if (hosts.isNotEmpty()) return

    observer?.let { if (it.isAlive) it.removeOnPreDrawListener(this) }
    observer = null
    behindInvalidator?.remove()
    behindInvalidator = null
    listenerRoot.removeCallbacks(trailingFrame)
    trailing.clear()
    if (!listenerRoot.isAttachedToWindow) {
      release()
      return
    }
    // Keep the last capture while the root stays in the window, so a remounted host shows it at once.
    val listener = object : View.OnAttachStateChangeListener {
      override fun onViewAttachedToWindow(v: View) = Unit

      override fun onViewDetachedFromWindow(v: View) {
        v.removeOnAttachStateChangeListener(this)
        if (releaseListener === this) releaseListener = null
        if (hosts.isEmpty()) release()
      }
    }
    releaseListener = listener
    listenerRoot.addOnAttachStateChangeListener(listener)
  }

  override fun onPreDraw(): Boolean {
    val visible = hosts.filter { it.isBackdropVisible && it.wantsBackdrop }
    if (visible.isEmpty()) return true
    updateNested()
    for (host in visible) hostBounds[host] = currentBounds(host)

    val now = SystemClock.uptimeMillis()
    val pending = animationRoots.any { CaptureAnimationGuard.hasPendingViewAnimation(it) }
    when (deferral.onFrame(now, pending)) {
      AnimationDeferral.Decision.SKIP -> visible.first().postInvalidateOnAnimation()
      AnimationDeferral.Decision.CAPTURE -> captureDueLanes(visible, now)
      AnimationDeferral.Decision.CAPTURE_FAIL_SAFE -> {
        Log.w(
          TAG,
          "Backdrop capture skipped for ${AnimationDeferral.MAX_SKIP_MS}ms and ${AnimationDeferral.MIN_SKIP_FRAMES} " +
            "frames while a view animation stayed attached in ${root.javaClass.simpleName}, resuming capture."
        )
        captureDueLanes(visible, now)
      }
    }
    for (host in visible) host.onBackdropFrame()
    return true
  }

  /** The current capture for [host], with its offset in the capture in px. Null before the first capture. */
  internal fun snapshotOf(host: BackdropHostView): Snapshot? {
    val lane = lanes[host.downsample] ?: return null
    val region = regionOf(lane, host) ?: return null
    val bitmap = region.bitmap ?: return null
    val captured = region.bitmapBounds ?: return null
    val bounds = hostBounds[host] ?: currentBounds(host)
    return Snapshot(bitmap, region.generation, bounds.left - captured.left, bounds.top - captured.top, lane.config.downsample)
  }

  override fun contentKey(host: BackdropHostView): Any? = snapshotOf(host)

  @RequiresApi(Build.VERSION_CODES.Q)
  override fun recordInto(node: RenderNode, host: BackdropHostView): Boolean {
    val snapshot = snapshotOf(host) ?: return false
    val downsample = snapshot.downsample.toFloat()
    val left = -snapshot.offsetX / downsample
    val top = -snapshot.offsetY / downsample
    if (host.nodeAtCaptureScale) {
      val width = ceil(host.width / downsample).toInt().coerceAtLeast(1)
      val height = ceil(host.height / downsample).toInt().coerceAtLeast(1)
      node.setPosition(0, 0, width, height)
      node.setPivotX(0f)
      node.setPivotY(0f)
      node.setScaleX(downsample)
      node.setScaleY(downsample)
      val canvas = node.beginRecording(width, height)
      try {
        canvas.drawBitmap(snapshot.bitmap, left, top, bitmapPaint)
      } finally {
        node.endRecording()
      }
    } else {
      node.setPosition(0, 0, host.width, host.height)
      node.setScaleX(1f)
      node.setScaleY(1f)
      val canvas = node.beginRecording(host.width, host.height)
      try {
        canvas.scale(downsample, downsample)
        canvas.drawBitmap(snapshot.bitmap, left, top, bitmapPaint)
      } finally {
        node.endRecording()
      }
    }
    return true
  }

  private fun regionOf(lane: Lane, host: BackdropHostView): Region? =
    if (lane.config.sharesRoot(host in nestedHosts)) lane.regions[ROOT_KEY] else lane.regions[host]

  private fun updateNested() {
    nestedHosts.clear()
    for (host in hosts) if (hasHostAncestor(host)) nestedHosts.add(host)
    // A host that left its outer host reads the root again, so its own region goes.
    for (lane in lanes.values) lane.regions.keys.retainAll { it === ROOT_KEY || it in nestedHosts }
  }

  private fun hasHostAncestor(host: View): Boolean {
    var parent = host.parent
    while (parent is View && parent !== root) {
      if (parent is BackdropHostView && parent in hosts) return true
      parent = parent.parent
    }
    return false
  }

  private fun captureDueLanes(visible: List<BackdropHostView>, now: Long) {
    val rootBounds = rootBounds()
    for ((downsample, lane) in lanes) {
      val laneHosts = visible.filter { it.downsample == downsample }
      if (laneHosts.isEmpty()) continue
      val moved = laneHosts.any { hostBounds[it] != lane.capturedBounds[it] }
      val remaining = lane.config.remainingMs(now, moved)
      if (remaining > 0) {
        postTrailingFrame(now, remaining)
        continue
      }
      var success = true
      for (target in lane.config.captureTargets(laneHosts, nestedHosts)) {
        val area = if (target == null) rootBounds else hostBounds[target] ?: continue
        val bounds = lane.config.regionBounds(rootBounds, area, alone = target != null) ?: continue
        val region = lane.regions.getOrPut(target ?: ROOT_KEY) { Region(bounds) }
        region.bounds = bounds
        if (!capture(lane.config, region, target)) success = false
      }
      lane.config.onCaptureResult(now, success)
      // A still screen draws no more frames, so the retry asks for one.
      lane.config.retryDelayMs(now)?.let { postTrailingFrame(now, it) }
      if (success) for (host in laneHosts) hostBounds[host]?.let { lane.capturedBounds[host] = it }
    }
  }

  private fun capture(config: CaptureLane, region: Region, host: BackdropHostView?): Boolean {
    val (width, height) = config.bitmapSize(region.bounds)
    val target = region.buffers.spare(width, height)
    val canvas = target.canvas
    target.bitmap.eraseColor(0)
    val save = canvas.save()
    canvas.scale(1f / config.downsample, 1f / config.downsample)
    canvas.translate(-region.bounds.left.toFloat(), -region.bounds.top.toFloat())
    capturingSource = this
    capturingHost = host
    var captured = true
    try {
      root.draw(canvas)
    } catch (e: Exception) {
      captured = false
      if (!failureLogged) {
        failureLogged = true
        Log.w(TAG, "Backdrop capture failed: ${e.message}")
      }
    } finally {
      capturingSource = null
      capturingHost = null
      canvas.restoreToCount(save)
    }
    if (!captured) return false
    region.buffers.publish()
    region.bitmapBounds = region.bounds
    region.generation++
    failureLogged = false
    return true
  }

  private fun postTrailingFrame(nowMs: Long, delayMs: Long) {
    if (!trailing.request(nowMs, delayMs)) return
    listenerRoot.removeCallbacks(trailingFrame)
    listenerRoot.postDelayed(trailingFrame, delayMs)
  }

  private fun rootBounds(): CaptureLane.Bounds {
    val decor = activityDecor
    if (decor != null) {
      decor.getLocationOnScreen(location)
      return CaptureLane.Bounds(location[0], location[1], decor.width, decor.height)
    }
    return CaptureLane.Bounds(0, 0, root.width, root.height)
  }

  private fun currentBounds(host: View): CaptureLane.Bounds {
    if (activityDecor != null) {
      host.getLocationOnScreen(location)
      return CaptureLane.Bounds(location[0], location[1], host.width, host.height)
    }
    root.getLocationInWindow(rootLocation)
    host.getLocationInWindow(location)
    return CaptureLane.Bounds(location[0] - rootLocation[0], location[1] - rootLocation[1], host.width, host.height)
  }

  private fun release() {
    for (lane in lanes.values) {
      for (region in lane.regions.values) for (buffer in region.buffers.all()) buffer.bitmap.recycle()
    }
    lanes.clear()
    if (sources[key] === this) sources.remove(key)
  }

  companion object {
    private const val TAG = "RNSoftwareSource"
    private const val GLASS_MOTION_INTERVAL_MS = 33L
    private const val GLASS_IDLE_INTERVAL_MS = 100L
    private val ROOT_KEY = Any()

    private val sources = HashMap<View, SoftwareSource>()
    private var capturingSource: SoftwareSource? = null
    private var capturingHost: View? = null

    private fun laneFor(downsample: Int): CaptureLane =
      if (downsample == BackdropScale.GLASS) {
        CaptureLane(downsample, GLASS_MOTION_INTERVAL_MS, GLASS_IDLE_INTERVAL_MS)
      } else {
        CaptureLane(downsample, 0L, 0L)
      }

    /** The shared source for [host]'s capture root: a Modal's two windows, else a Screen or React root, else the activity window. */
    fun forHost(host: BackdropHostView): SoftwareSource? {
      val decor = CaptureRoots.activityDecor(host)
      val window = WindowCaptureRoot.forHost(host, decor)
      val root = CaptureRoots.resolve(host)
      return when (CaptureRoots.softwareRoot(window != null, root != null, decor != null)) {
        SoftwareRoot.WINDOW -> {
          val dialogRoot = host.rootView
          sources.getOrPut(dialogRoot) { SoftwareSource(dialogRoot, window!!, dialogRoot, window.layers, decor) }
        }
        SoftwareRoot.ANCESTOR -> sources.getOrPut(root!!) { SoftwareSource(root, root, root, listOf(root), null) }
        SoftwareRoot.ACTIVITY -> sources.getOrPut(decor!!) { SoftwareSource(decor, decor, decor, listOf(decor), null) }
        null -> null
      }
    }

    /** True while a capture that [host] must stay out of is drawing. */
    fun isCapturing(host: View): Boolean {
      val source = capturingSource ?: return false
      val target = capturingHost
      if (target != null) return target === host
      return host is BackdropHostView && host in source.hosts
    }
  }
}
