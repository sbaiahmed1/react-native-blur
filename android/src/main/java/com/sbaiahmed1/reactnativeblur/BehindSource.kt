package com.sbaiahmed1.reactnativeblur

import android.graphics.Matrix
import android.graphics.RecordingCanvas
import android.graphics.RectF
import android.graphics.RenderNode
import android.os.Build
import android.view.View
import android.view.ViewGroup
import android.view.ViewTreeObserver
import androidx.annotation.RequiresApi
import kotlin.math.ceil

/** Records each host's backdrop from the RenderNodes of the views painted behind it, without running any view's draw code. */
@RequiresApi(Build.VERSION_CODES.S)
internal class BehindSource private constructor(
  private val root: View,
  // The activity decor behind a host that lives in another window, such as a Modal.
  private val behindDecor: View?
) : BackdropSource, ViewTreeObserver.OnPreDrawListener {

  private val hosts = LinkedHashSet<BackdropHostView>()
  private var observer: ViewTreeObserver? = null
  private var behindInvalidator: BehindWindowInvalidator? = null
  private var frame = 0L

  private val path = ArrayList<View>()
  private val children = ArrayList<BehindOrder.Child>()
  private var positions = IntArray(16)
  private val hostToRoot = Matrix()
  private val rootToHost = Matrix()
  private val step = Matrix()
  private val hostRects = ArrayList<RectF>()
  private val childRect = RectF()
  private val location = IntArray(2)
  private val decorLocation = IntArray(2)
  // Set while recording when a view that belongs in the backdrop has no display list yet.
  private var missingDisplayList = false
  private val retries = HashMap<BackdropHostView, Int>()

  override fun addHost(host: BackdropHostView) {
    if (!hosts.add(host)) return
    if (hosts.size == 1) {
      observer = root.viewTreeObserver.also { it.addOnPreDrawListener(this) }
      behindDecor?.let { behindInvalidator = BehindWindowInvalidator.install(it, root) }
    }
    host.postInvalidateOnAnimation()
  }

  override fun removeHost(host: BackdropHostView) {
    retries.remove(host)
    if (!hosts.remove(host) || hosts.isNotEmpty()) return
    observer?.let { if (it.isAlive) it.removeOnPreDrawListener(this) }
    observer = null
    behindInvalidator?.remove()
    behindInvalidator = null
    if (sources[root] === this) sources.remove(root)
  }

  override fun onPreDraw(): Boolean {
    frame++
    for (host in hosts) if (host.isBackdropVisible) host.onBackdropFrame()
    return true
  }

  // A new key on every pre-draw, so a visible host re-records once per frame.
  override fun contentKey(host: BackdropHostView): Any = frame

  override fun recordInto(node: RenderNode, host: BackdropHostView): Boolean {
    if (!buildPath(host) || !hostToRoot.invert(rootToHost)) return false
    val downsample = host.downsample.toFloat()
    val canvas: RecordingCanvas
    if (host.nodeAtCaptureScale) {
      val width = ceil(host.width / downsample).toInt().coerceAtLeast(1)
      val height = ceil(host.height / downsample).toInt().coerceAtLeast(1)
      node.setPosition(0, 0, width, height)
      node.setPivotX(0f)
      node.setPivotY(0f)
      node.setScaleX(downsample)
      node.setScaleY(downsample)
      canvas = node.beginRecording(width, height)
      canvas.scale(1f / downsample, 1f / downsample)
    } else {
      node.setPosition(0, 0, host.width, host.height)
      node.setScaleX(1f)
      node.setScaleY(1f)
      canvas = node.beginRecording(host.width, host.height)
    }
    missingDisplayList = false
    try {
      canvas.concat(rootToHost)
      drawBehind(canvas)
    } finally {
      node.endRecording()
    }
    scheduleRetry(host)
    return true
  }

  // hwui builds a new view's display list after pre-draw, so a sibling added behind a host can miss this recording.
  // Nothing else asks for a frame once the scene is idle, so ask for one, a few times at most per gap.
  private fun scheduleRetry(host: BackdropHostView) {
    if (!missingDisplayList) {
      retries.remove(host)
      return
    }
    val attempt = (retries[host] ?: 0) + 1
    if (attempt > MAX_RETRIES) return
    retries[host] = attempt
    host.postInvalidateOnAnimation()
  }

  // Fills path with root..host, hostToRoot, and the host's bounds in each parent's content space for culling.
  private fun buildPath(host: View): Boolean {
    path.clear()
    var view: View? = host
    while (view != null) {
      path.add(view)
      if (view === root) break
      view = view.parent as? View
    }
    if (path.last() !== root) return false
    path.reverse()
    while (hostRects.size < path.size) hostRects.add(RectF())
    hostToRoot.reset()
    for (i in path.size - 1 downTo 1) {
      val parent = path[i - 1]
      hostToRoot.postConcat(nodeTransform(path[i]))
      hostRects[i - 1].set(0f, 0f, host.width.toFloat(), host.height.toFloat())
      hostToRoot.mapRect(hostRects[i - 1])
      hostToRoot.postTranslate(-parent.scrollX.toFloat(), -parent.scrollY.toFloat())
    }
    return true
  }

  // Only a sibling that covers part of the host can reach its pixels, and skipping the rest keeps hwui's walk linear.
  private fun overlapsHost(child: View, level: Int): Boolean {
    childRect.set(0f, 0f, child.width.toFloat(), child.height.toFloat())
    val own = child.matrix
    if (!own.isIdentity) own.mapRect(childRect)
    childRect.offset(child.left.toFloat(), child.top.toFloat())
    return RectF.intersects(childRect, hostRects[level])
  }

  // hwui's node transform without the legacy animation matrix, which no public API returns.
  private fun nodeTransform(view: View): Matrix {
    step.setTranslate(view.left.toFloat(), view.top.toFloat())
    val own = view.matrix
    if (!own.isIdentity) step.preConcat(own)
    return step
  }

  private fun drawBehind(canvas: RecordingCanvas) {
    behindDecor?.let { drawDecor(canvas, it) }
    for (i in 1 until path.size) {
      val parent = path[i - 1] as? ViewGroup ?: return
      val pathChild = path[i]
      parent.background?.draw(canvas)
      if (parent is BackdropHostView) parent.drawOwnBackdrop(canvas)
      canvas.translate(-parent.scrollX.toFloat(), -parent.scrollY.toFloat())
      fillChildren(parent)
      val behind = BehindOrder.behind(children, parent.indexOfChild(pathChild))
      if (behind.isNotEmpty()) {
        canvas.enableZ()
        for (index in behind) {
          val child = parent.getChildAt(index)
          if (!overlapsHost(child, i - 1)) continue
          val childNode = RenderNodeAccess.nodeOf(child) ?: continue
          if (childNode.hasDisplayList()) canvas.drawRenderNode(childNode) else missingDisplayList = true
        }
        canvas.disableZ()
      }
      canvas.concat(nodeTransform(pathChild))
    }
  }

  private fun drawDecor(canvas: RecordingCanvas, decor: View) {
    val decorNode = RenderNodeAccess.nodeOf(decor) ?: return
    if (!decorNode.hasDisplayList()) {
      missingDisplayList = true
      return
    }
    decor.getLocationOnScreen(decorLocation)
    root.getLocationOnScreen(location)
    val save = canvas.save()
    canvas.translate((decorLocation[0] - location[0]).toFloat(), (decorLocation[1] - location[1]).toFloat())
    canvas.drawRenderNode(decorNode)
    canvas.restoreToCount(save)
  }

  private fun fillChildren(parent: ViewGroup) {
    val count = parent.childCount
    if (positions.size < count) positions = IntArray(count * 2)
    for (position in 0 until count) positions[parent.getChildDrawingOrder(position)] = position
    children.clear()
    for (index in 0 until count) {
      val child = parent.getChildAt(index)
      children.add(BehindOrder.Child(positions[index], child.z, child.visibility == View.VISIBLE || child.animation != null))
    }
  }

  companion object {
    private val sources = HashMap<View, BehindSource>()

    // Follow-up frames requested while a view in the backdrop still has no display list.
    private const val MAX_RETRIES = 8

    /** The shared source of [host]'s window, which also draws the activity behind a Modal's window. */
    fun forHost(host: BackdropHostView): BehindSource {
      val root = host.rootView
      return sources.getOrPut(root) { BehindSource(root, CaptureRoots.activityDecor(host)?.takeIf { it !== root }) }
    }
  }
}
