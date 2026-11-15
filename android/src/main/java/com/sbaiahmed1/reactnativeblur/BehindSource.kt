package com.sbaiahmed1.reactnativeblur

import android.graphics.Matrix
import android.graphics.RecordingCanvas
import android.graphics.Rect
import android.graphics.RectF
import android.graphics.RenderNode
import android.os.Build
import android.view.View
import android.view.ViewGroup
import android.view.ViewTreeObserver
import androidx.annotation.RequiresApi
import com.facebook.react.uimanager.ReactOverflowView
import kotlin.math.ceil

/** Records each host's backdrop from the RenderNodes of the views painted behind it, without running any view's draw code. */
@RequiresApi(Build.VERSION_CODES.S)
internal class BehindSource private constructor(
  private val root: View,
  // The activity decor behind a host that lives in another window, such as a Modal.
  private val behindDecor: View?
) : BackdropSource, ViewTreeObserver.OnPreDrawListener {

  private val hosts = LinkedHashSet<BackdropHostView>()
  private val glassLayers = HashMap<BackdropHostView, RenderNode>()
  private var observer: ViewTreeObserver? = null
  private var behindInvalidator: BehindWindowInvalidator? = null
  private var frame = 0L

  private val path = ArrayList<View>()
  private val children = ArrayList<BehindOrder.Child>()
  private val candidates = ArrayList<View>()
  private var positions = IntArray(16)
  private val hostToRoot = Matrix()
  private val rootToHost = Matrix()
  private val step = Matrix()
  private val hostRects = ArrayList<RectF>()
  private val childRect = RectF()
  private val visibleRect = Rect()
  private val location = IntArray(2)
  private val decorLocation = IntArray(2)
  private val overflowMatrices = ArrayList<Matrix>()
  private var overflowBudget = 0

  override fun addHost(host: BackdropHostView) {
    if (!hosts.add(host)) return
    if (hosts.size == 1) {
      observer = root.viewTreeObserver.also { it.addOnPreDrawListener(this) }
      behindDecor?.let { behindInvalidator = BehindWindowInvalidator.install(it, root) }
    }
    host.postInvalidateOnAnimation()
  }

  override fun removeHost(host: BackdropHostView) {
    if (!hosts.remove(host)) return
    glassLayers.remove(host)?.discardDisplayList()
    if (hosts.isNotEmpty()) return
    observer?.let { if (it.isAlive) it.removeOnPreDrawListener(this) }
    observer = null
    behindInvalidator?.remove()
    behindInvalidator = null
    if (sources[root] === this) sources.remove(root)
  }

  override fun onPreDraw(): Boolean {
    frame++
    // A host scrolled off screen records again on the pre-draw of the frame that shows it.
    for (host in hosts) if (host.isBackdropVisible && host.getGlobalVisibleRect(visibleRect)) host.onBackdropFrame()
    return true
  }

  // A new key on every pre-draw, so a visible host re-records once per frame.
  override fun contentKey(host: BackdropHostView): Any = frame

  override fun recordInto(node: RenderNode, host: BackdropHostView): Boolean {
    if (!buildPath(host) || !hostToRoot.invert(rootToHost)) return false
    val downsample = host.downsample.toFloat()
    if (host.nodeAtCaptureScale) {
      recordScaled(node, host, downsample)
      return true
    }
    // Glass reads view px, so the content renders into a layer at capture scale and is drawn back at view scale.
    val layer = glassLayers.getOrPut(host) { RenderNode("RNBackdropContent").also { it.setUseCompositingLayer(true, null) } }
    recordScaled(layer, host, downsample)
    node.setPosition(0, 0, host.width, host.height)
    node.setScaleX(1f)
    node.setScaleY(1f)
    val canvas = node.beginRecording(host.width, host.height)
    try {
      canvas.drawRenderNode(layer)
    } finally {
      node.endRecording()
    }
    return true
  }

  private fun recordScaled(node: RenderNode, host: View, downsample: Float) {
    val width = ceil(host.width / downsample).toInt().coerceAtLeast(1)
    val height = ceil(host.height / downsample).toInt().coerceAtLeast(1)
    node.setPosition(0, 0, width, height)
    node.setPivotX(0f)
    node.setPivotY(0f)
    node.setScaleX(downsample)
    node.setScaleY(downsample)
    val canvas = node.beginRecording(width, height)
    try {
      canvas.scale(1f / downsample, 1f / downsample)
      canvas.concat(rootToHost)
      drawBehind(canvas)
    } finally {
      node.endRecording()
    }
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

  // Only a sibling that paints over part of the host can reach its pixels, and skipping the rest keeps hwui's walk linear.
  private fun overlapsHost(child: View, level: Int): Boolean {
    overflowBudget = OVERFLOW_VIEW_BUDGET
    overflowMatrix(0).set(nodeTransform(child))
    return paintsInto(child, 0, hostRects[level])
  }

  // Whether [view], mapped into the culling space by overflowMatrix(depth), can paint into [target]. A view that does not
  // clip its children, the React Native default of overflow: visible, can paint descendants outside its own bounds.
  private fun paintsInto(view: View, depth: Int, target: RectF): Boolean {
    val toTarget = overflowMatrix(depth)
    childRect.set(0f, 0f, view.width.toFloat(), view.height.toFloat())
    toTarget.mapRect(childRect)
    if (RectF.intersects(childRect, target)) return true
    val group = view as? ViewGroup ?: return false
    if (clipsChildren(group)) return false
    // Too many descendants to check every frame: keeping the sibling is always correct, it only costs drawing it.
    if (--overflowBudget < 0) return true
    for (index in 0 until group.childCount) {
      val descendant = group.getChildAt(index)
      if (descendant.visibility != View.VISIBLE && descendant.animation == null) continue
      val toDescendant = overflowMatrix(depth + 1)
      toDescendant.set(nodeTransform(descendant))
      toDescendant.postTranslate(-group.scrollX.toFloat(), -group.scrollY.toFloat())
      toDescendant.postConcat(toTarget)
      if (paintsInto(descendant, depth + 1, target)) return true
    }
    return false
  }

  private fun clipsChildren(group: ViewGroup): Boolean {
    if (group.clipChildren || group.clipToOutline || group.clipBounds != null) return true
    // React Native views keep clipChildren off and clip overflow: hidden and scroll in their own dispatchDraw.
    val overflow = (group as? ReactOverflowView)?.overflow
    return overflow == "hidden" || overflow == "scroll"
  }

  private fun overflowMatrix(depth: Int): Matrix {
    while (overflowMatrices.size <= depth) overflowMatrices.add(Matrix())
    return overflowMatrices[depth]
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
      val pathIndex = fillCandidates(parent, pathChild, i - 1)
      val behind = BehindOrder.behind(children, pathIndex)
      if (behind.isNotEmpty()) {
        canvas.enableZ()
        for (index in behind) {
          val childNode = RenderNodeAccess.nodeOf(candidates[index]) ?: continue
          if (childNode.hasDisplayList()) canvas.drawRenderNode(childNode)
        }
        canvas.disableZ()
      }
      canvas.concat(nodeTransform(pathChild))
    }
  }

  private fun drawDecor(canvas: RecordingCanvas, decor: View) {
    val decorNode = RenderNodeAccess.nodeOf(decor) ?: return
    if (!decorNode.hasDisplayList()) return
    decor.getLocationOnScreen(decorLocation)
    root.getLocationOnScreen(location)
    val save = canvas.save()
    canvas.translate((decorLocation[0] - location[0]).toFloat(), (decorLocation[1] - location[1]).toFloat())
    canvas.drawRenderNode(decorNode)
    canvas.restoreToCount(save)
  }

  // Fills children and candidates with the path child and the siblings that overlap the host, and returns the path's index there.
  private fun fillCandidates(parent: ViewGroup, pathChild: View, level: Int): Int {
    val count = parent.childCount
    if (positions.size < count) positions = IntArray(count * 2)
    for (position in 0 until count) positions[parent.getChildDrawingOrder(position)] = position
    children.clear()
    candidates.clear()
    var pathIndex = BehindOrder.DISAPPEARING
    for (index in 0 until count) {
      val child = parent.getChildAt(index)
      val isPath = child === pathChild
      if (!isPath && !overlapsHost(child, level)) continue
      if (isPath) pathIndex = children.size
      candidates.add(child)
      children.add(BehindOrder.Child(positions[index], child.z, child.visibility == View.VISIBLE || child.animation != null))
    }
    return pathIndex
  }

  companion object {
    private val sources = HashMap<View, BehindSource>()

    // View groups opened to look for a sibling's overflow before keeping it without looking further.
    private const val OVERFLOW_VIEW_BUDGET = 64

    /** The shared source of [host]'s window, which also draws the activity behind a Modal's window. */
    fun forHost(host: BackdropHostView): BehindSource {
      val root = host.rootView
      return sources.getOrPut(root) { BehindSource(root, CaptureRoots.activityDecor(host)?.takeIf { it !== root }) }
    }
  }
}
