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
import com.facebook.react.views.view.ReactViewGroup

/** Records each host's backdrop from the RenderNodes of the views painted behind it, without running any view's draw code. */
@RequiresApi(Build.VERSION_CODES.S)
internal class BehindSource private constructor(
  private val root: View,
  // The activity decor behind a host that lives in another window, such as a Modal.
  private val behindDecor: View?
) : BackdropSource, ViewTreeObserver.OnPreDrawListener {

  private val hosts = LinkedHashSet<BackdropHostView>()
  private val glassLayers = HashMap<BackdropHostView, RenderNode>()
  private val reductions = HashMap<BackdropHostView, Array<RenderNode>>()
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
  private val paintBounds = FloatArray(4)
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
    reductions.remove(host)?.forEach { it.discardDisplayList() }
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
    for (host in hosts) if (host.wantsBackdrop && host.isBackdropVisible && isOnScreen(host)) host.onBackdropFrame()
    return true
  }

  // getGlobalVisibleRect leaves out legacy view animations, which can draw a host laid out off screen on screen, so a host
  // under one always counts as on screen.
  private fun isOnScreen(host: View): Boolean {
    var view: View? = host
    while (view != null) {
      if (view.animation != null || view.animationMatrix != null) return true
      if (view === root) break
      view = view.parent as? View
    }
    return host.getGlobalVisibleRect(visibleRect)
  }

  // A new key on every pre-draw, so a visible host re-records once per frame.
  override fun contentKey(host: BackdropHostView): Any = frame

  override fun recordInto(node: RenderNode, host: BackdropHostView): Boolean {
    if (!buildPath(host) || !hostToRoot.invert(rootToHost)) return false
    val downsample = host.downsample
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

  // A power-of-two scale records at 1/2 and halves down to the node 2x2 px at a time, which averages layers, stretches and bitmaps behind the host.
  private fun recordScaled(node: RenderNode, host: BackdropHostView, downsample: Int) {
    val hops = BackdropReduction.hops(downsample)
    val width = BackdropReduction.nodeSize(host.width, downsample)
    val height = BackdropReduction.nodeSize(host.height, downsample)
    node.setPosition(0, 0, width, height)
    node.setPivotX(0f)
    node.setPivotY(0f)
    node.setScaleX(downsample.toFloat())
    node.setScaleY(downsample.toFloat())
    if (hops == 0) {
      record(node, width, height) { recordBehind(it, downsample) }
      return
    }
    val levels = reductions.getOrPut(host) { Array(hops) { RenderNode("RNBackdropReduction").also { it.setUseCompositingLayer(true, null) } } }
    val first = levels[0]
    val firstWidth = BackdropReduction.levelSize(width, hops, 0)
    val firstHeight = BackdropReduction.levelSize(height, hops, 0)
    first.setPosition(0, 0, firstWidth, firstHeight)
    record(first, firstWidth, firstHeight) { recordBehind(it, BackdropReduction.recordScale(downsample)) }
    for (level in 1 until hops) {
      val levelWidth = BackdropReduction.levelSize(width, hops, level)
      val levelHeight = BackdropReduction.levelSize(height, hops, level)
      levels[level].setPosition(0, 0, levelWidth, levelHeight)
      record(levels[level], levelWidth, levelHeight) { halve(it, levels[level - 1]) }
    }
    record(node, width, height) { halve(it, levels[hops - 1]) }
  }

  private inline fun record(node: RenderNode, width: Int, height: Int, draw: (RecordingCanvas) -> Unit) {
    val canvas = node.beginRecording(width, height)
    try {
      draw(canvas)
    } finally {
      node.endRecording()
    }
  }

  private fun recordBehind(canvas: RecordingCanvas, scale: Int) {
    canvas.scale(1f / scale, 1f / scale)
    canvas.concat(rootToHost)
    drawBehind(canvas)
  }

  private fun halve(canvas: RecordingCanvas, level: RenderNode) {
    canvas.scale(0.5f, 0.5f)
    canvas.drawRenderNode(level)
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
      hostToRoot.postConcat(ViewMatrices.node(path[i], step))
      hostRects[i - 1].set(0f, 0f, host.width.toFloat(), host.height.toFloat())
      hostToRoot.mapRect(hostRects[i - 1])
      hostToRoot.postTranslate(-parent.scrollX.toFloat(), -parent.scrollY.toFloat())
    }
    return true
  }

  // Only a sibling that paints over part of the host can reach its pixels, and skipping the rest keeps hwui's walk linear while hosts do not overlap each other.
  private fun overlapsHost(child: View, level: Int): Boolean {
    overflowMatrix(0).set(ViewMatrices.node(child, step))
    return paintsInto(child, 0, hostRects[level])
  }

  // Whether [view], mapped into the culling space by overflowMatrix(depth), can paint into [target]. A view that does not
  // clip its children, the React Native default of overflow: visible, can paint descendants outside its own bounds.
  private fun paintsInto(view: View, depth: Int, target: RectF): Boolean {
    val toTarget = overflowMatrix(depth)
    // React Native views draw overflowing children, which Fabric reports as the view's overflow inset. That settles most
    // siblings at once, and the walk below still finds what it misses, such as natively animated transforms.
    val inset = (view as? ReactViewGroup)?.overflowInset
    if (inset == null) {
      childRect.set(0f, 0f, view.width.toFloat(), view.height.toFloat())
    } else {
      OverflowBounds.write(view.width, view.height, inset.left, inset.top, inset.right, inset.bottom, paintBounds)
      childRect.set(paintBounds[0], paintBounds[1], paintBounds[2], paintBounds[3])
    }
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
      toDescendant.set(ViewMatrices.node(descendant, step))
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

  private fun drawBehind(canvas: RecordingCanvas) {
    behindDecor?.let { drawDecor(canvas, it) }
    for (i in 1 until path.size) {
      val parent = path[i - 1] as? ViewGroup ?: return
      val pathChild = path[i]
      parent.background?.draw(canvas)
      if (parent is BackdropHostView) parent.drawOwnBackdrop(canvas)
      canvas.translate(-parent.scrollX.toFloat(), -parent.scrollY.toFloat())
      val pathIndex = fillCandidates(parent, pathChild, i - 1)
      val behind = BehindOrder.behind(children, pathIndex, pathChild.z)
      if (behind.isNotEmpty()) {
        canvas.enableZ()
        // No display list check: a child attached this frame records after pre-draw, and the reference picks it up at sync.
        for (index in behind) RenderNodeAccess.nodeOf(candidates[index])?.let { canvas.drawRenderNode(it) }
        canvas.disableZ()
      }
      canvas.concat(ViewMatrices.node(pathChild, step))
    }
  }

  private fun drawDecor(canvas: RecordingCanvas, decor: View) {
    val decorNode = RenderNodeAccess.nodeOf(decor) ?: return
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
    BehindOrder.fillDispatchPositions(positions, count, ChildDrawingOrder.isEnabled(parent)) { parent.getChildDrawingOrder(it) }
    children.clear()
    candidates.clear()
    // One budget for the whole level, so many siblings with overflow cannot each walk their own subtrees.
    overflowBudget = OVERFLOW_VIEW_BUDGET
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

    // View groups opened per level to look for siblings' overflow before keeping the rest without looking further.
    private const val OVERFLOW_VIEW_BUDGET = 64

    /** The shared source of [host]'s window, which also draws the activity behind a Modal's window. */
    fun forHost(host: BackdropHostView): BehindSource {
      val root = host.rootView
      return sources.getOrPut(root) { BehindSource(root, CaptureRoots.activityDecor(host)?.takeIf { it !== root }) }
    }
  }
}
