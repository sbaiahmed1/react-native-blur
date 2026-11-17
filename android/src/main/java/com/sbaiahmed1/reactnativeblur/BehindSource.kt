package com.sbaiahmed1.reactnativeblur

import android.graphics.Matrix
import android.graphics.PixelFormat
import android.graphics.RecordingCanvas
import android.graphics.Rect
import android.graphics.RectF
import android.graphics.RenderNode
import android.os.Build
import android.util.Log
import android.view.View
import android.view.ViewGroup
import android.view.ViewTreeObserver
import androidx.annotation.RequiresApi
import com.facebook.react.uimanager.ReactOverflowView
import com.facebook.react.views.view.ReactViewGroup
import java.util.BitSet

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

  private val ids = HashMap<BackdropHostView, Int>()
  private var nextId = 0
  private val budget = BackdropBudget()
  // Every view on the way from a host up to the root, with the ids of the hosts at or below it.
  private val hostsUnder = HashMap<View, BitSet>()
  private val bitSets = ArrayList<BitSet>()
  private val leafIds = HashMap<View, IntArray>()
  private val dispatchPositions = HashMap<ViewGroup, IntArray>()
  private val recordOrder = ArrayList<BackdropHostView>()
  private val paintPaths = HashMap<BackdropHostView, List<HostPaintOrder.Step>>()
  private val levelCandidates = ArrayList<ArrayList<View>>()
  private val levelBehind = ArrayList<List<Int>>()
  // Per level, the first leaf and the leaf count of each candidate in levelBehind's order.
  private val levelLeafRanges = ArrayList<IntArray>()
  private val leaves = ArrayList<IntArray>()
  private var forced = IntArray(4)
  private var plan = BackdropBudget.Plan(0, 0, 1)
  private var frameVisits = 0
  private var frameRecordings = 0
  private var loggedVisits = -1
  private val ancestors = ArrayList<NestedCut.Ancestor>()
  private val cutMatrix = Matrix()
  private val cutStep = Matrix()
  private val cutRect = RectF()
  private val replay = FlatReplay { hostsUnder.containsKey(it) }
  private val classify: (View) -> BackdropReference = { referenceOf(it) }
  // The leaf of every host id the current plan reaches, for a replay that keeps some of a view's hosts.
  private val leafOfId = HashMap<Int, Int>()
  private val leafViews = ArrayList<View>()
  private val plannedLeaves = ArrayList<IntArray>()
  private val paidLeaves = ArrayList<IntArray>()
  private var leafFull = BooleanArray(16)
  private var leafVisible = BooleanArray(16)
  private val hostRect = RectF()
  private val rootRects = HashMap<View, RectF>()
  private val rectPool = ArrayList<RectF>()
  private var rectsUsed = 0
  private val rootMatrix = Matrix()
  private val rootStep = Matrix()
  // The levels of the host ancestors in forced, in the same order.
  private var forcedLevels = IntArray(4)
  private var forcedCount = 0

  override fun addHost(host: BackdropHostView) {
    if (!hosts.add(host)) return
    ids[host] = nextId++
    if (hosts.size == 1) {
      observer = root.viewTreeObserver.also { it.addOnPreDrawListener(this) }
      behindDecor?.let { behindInvalidator = BehindWindowInvalidator.install(it, root) }
    }
    host.postInvalidateOnAnimation()
  }

  override fun removeHost(host: BackdropHostView) {
    if (!hosts.remove(host)) return
    ids.remove(host)?.let { budget.forget(it) }
    replay.remove(host)
    glassLayers.remove(host)?.discardDisplayList()
    reductions.remove(host)?.forEach { it.discardDisplayList() }
    if (hosts.isNotEmpty()) return
    replay.clear()
    observer?.let { if (it.isAlive) it.removeOnPreDrawListener(this) }
    observer = null
    behindInvalidator?.remove()
    behindInvalidator = null
    if (sources[root] === this) sources.remove(root)
  }

  override fun onPreDraw(): Boolean {
    frame++
    markHostsUnder()
    recordOrder.clear()
    for (host in hosts) {
      // A host that draws no backdrop references none.
      if (!host.wantsBackdrop) ids[host]?.let { budget.forget(it) }
      // A host scrolled off screen records again on the pre-draw of the frame that shows it.
      else if (host.isBackdropVisible && isOnScreen(host)) recordOrder.add(host)
    }
    // Paint order, so every host a backdrop references has recorded this frame.
    if (recordOrder.size > 1) {
      for (host in recordOrder) paintPaths[host] = paintPath(host)
      recordOrder.sortWith { a, b -> HostPaintOrder.compare(paintPaths.getValue(a), paintPaths.getValue(b)) }
    }
    frameVisits = 0
    frameRecordings = 0
    replay.beginFrame()
    for (host in recordOrder) host.onBackdropFrame()
    replay.endFrame()
    logVisits()
    paintPaths.clear()
    dispatchPositions.clear()
    leafIds.clear()
    rootRects.clear()
    rectsUsed = 0
    return true
  }

  private fun markHostsUnder() {
    hostsUnder.clear()
    var used = 0
    for (host in hosts) {
      val id = ids[host] ?: continue
      var view: View? = host
      while (view != null) {
        var bits = hostsUnder[view]
        if (bits == null) {
          if (used == bitSets.size) bitSets.add(BitSet())
          bits = bitSets[used++].also { it.clear() }
          hostsUnder[view] = bits
        }
        bits.set(id)
        if (view === root) break
        view = view.parent as? View
      }
    }
  }

  // The host's place at every level from the root's child down, for HostPaintOrder.
  private fun paintPath(host: View): List<HostPaintOrder.Step> {
    val steps = ArrayList<HostPaintOrder.Step>()
    var child = host
    while (child !== root) {
      val parent = child.parent as? ViewGroup ?: break
      val index = parent.indexOfChild(child)
      val position = if (index < 0) BehindOrder.DISAPPEARING else dispatchPositionsOf(parent)[index]
      steps.add(HostPaintOrder.Step(parent, BehindOrder.Child(position, child.z, isDrawnByParent(child))))
      child = parent
    }
    steps.reverse()
    return steps
  }

  private fun dispatchPositionsOf(parent: ViewGroup): IntArray =
    dispatchPositions.getOrPut(parent) {
      val count = parent.childCount
      IntArray(count).also { out ->
        BehindOrder.fillDispatchPositions(out, count, ChildDrawingOrder.isEnabled(parent)) { parent.getChildDrawingOrder(it) }
      }
    }


  private fun logVisits() {
    if (frameRecordings == 0 || frameVisits == loggedVisits || !Log.isLoggable(TAG, Log.DEBUG)) return
    loggedVisits = frameVisits
    Log.d(TAG, "backdrop visits $frameVisits over $frameRecordings hosts")
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
      record(node, width, height) { recordBehind(it, downsample, host) }
      return
    }
    val levels = reductions.getOrPut(host) { Array(hops) { RenderNode("RNBackdropReduction").also { it.setUseCompositingLayer(true, null) } } }
    val first = levels[0]
    val firstWidth = BackdropReduction.levelSize(width, hops, 0)
    val firstHeight = BackdropReduction.levelSize(height, hops, 0)
    first.setPosition(0, 0, firstWidth, firstHeight)
    record(first, firstWidth, firstHeight) { recordBehind(it, BackdropReduction.recordScale(downsample), host) }
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

  private fun recordBehind(canvas: RecordingCanvas, scale: Int, host: BackdropHostView) {
    canvas.scale(1f / scale, 1f / scale)
    canvas.concat(rootToHost)
    drawBehind(canvas, host)
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

  private fun drawBehind(canvas: RecordingCanvas, host: BackdropHostView) {
    val cut = cutLevel(host)
    val levels = collectLevels(cut)
    planBackdrop(host, cut, levels)
    // An opaque host ancestor covers the decor and every level above it, which then only place the canvas.
    if (cut == 0) behindDecor?.let { drawDecor(canvas, it) }
    // Forced references past the plan are the farthest ones, so every host ancestor at or above this level draws flat.
    val flatAncestorsFrom = if (plan.forcedKept < forcedCount) forcedLevels[plan.forcedKept] else -1
    for (level in 0 until levels) {
      val parent = path[level] as ViewGroup
      if (level >= cut) {
        parent.background?.draw(canvas)
        if (parent is BackdropHostView) {
          if (level > flatAncestorsFrom) parent.drawOwnBackdrop(canvas) else parent.drawFlat(canvas)
        }
      }
      canvas.translate(-parent.scrollX.toFloat(), -parent.scrollY.toFloat())
      val behind = levelBehind[level]
      if (behind.isNotEmpty()) {
        val levelViews = levelCandidates[level]
        val ranges = levelLeafRanges[level]
        canvas.enableZ()
        for (k in behind.indices) {
          val view = levelViews[behind[k]]
          // No display list check: a child attached this frame records after pre-draw, and the reference picks it up at sync.
          val start = ranges[k * 2]
          val count = ranges[k * 2 + 1]
          var full = 0
          for (leaf in start until start + count) if (leafFull[leaf]) full++
          val node = when (BackdropReference.of(full, count)) {
            BackdropReference.NODE -> RenderNodeAccess.nodeOf(view)
            BackdropReference.FLAT -> replay.flatProxy(view)
            BackdropReference.REPLAY -> replay.replayProxy(view, host, classify)
          }
          node?.let { canvas.drawRenderNode(it) }
        }
        canvas.disableZ()
      }
      canvas.concat(ViewMatrices.node(path[level + 1], step))
    }
  }

  // The level of the nearest host ancestor whose opaque backdrop holds the whole host, or 0.
  private fun cutLevel(host: BackdropHostView): Int {
    ancestors.clear()
    for (level in 1 until path.size - 1) {
      val ancestor = path[level] as? BackdropHostView ?: continue
      val opaque = ancestor.opaqueBackdrop
      ancestors.add(NestedCut.Ancestor(level, opaque, opaque && liesInside(host, ancestor)))
    }
    if (ancestors.none { it.opaque && it.containsHost }) return 0
    return NestedCut.startLevel(ancestors, isWindowOpaque(host))
  }

  private fun liesInside(host: View, ancestor: View): Boolean {
    if (!ViewMatrices.toAncestor(host, ancestor, cutMatrix, cutStep)) return false
    cutRect.set(0f, 0f, host.width.toFloat(), host.height.toFloat())
    cutMatrix.mapRect(cutRect)
    return cutRect.left >= -EDGE_SLOP && cutRect.top >= -EDGE_SLOP &&
      cutRect.right <= ancestor.width + EDGE_SLOP && cutRect.bottom <= ancestor.height + EDGE_SLOP
  }

  @Suppress("DEPRECATION")
  private fun isWindowOpaque(host: View): Boolean =
    CaptureRoots.activityDecor(host)?.background?.opacity == PixelFormat.OPAQUE

  // Keeps each level's candidates from [cut] down and the ones painted before the path child, since fillCandidates reuses its buffers.
  private fun collectLevels(cut: Int): Int {
    var levels = 0
    for (i in 1 until path.size) {
      val parent = path[i - 1] as? ViewGroup ?: break
      val pathChild = path[i]
      if (levelCandidates.size == levels) {
        levelCandidates.add(ArrayList())
        levelBehind.add(emptyList())
        levelLeafRanges.add(IntArray(8))
      }
      if (levels < cut) {
        levelCandidates[levels].clear()
        levelBehind[levels] = emptyList()
      } else {
        val pathIndex = fillCandidates(parent, pathChild, i - 1)
        levelCandidates[levels].apply {
          clear()
          addAll(candidates)
        }
        levelBehind[levels] = BehindOrder.behind(children, pathIndex, pathChild.z)
      }
      levels++
    }
    return levels
  }

  // Plans the host's references: its host ancestors, nearest first down to [cut], and the hosts painted behind it.
  private fun planBackdrop(host: BackdropHostView, cut: Int, levels: Int) {
    forcedCount = 0
    leaves.clear()
    leafViews.clear()
    leafOfId.clear()
    for (level in levels - 1 downTo cut) {
      val parent = path[level] as? BackdropHostView ?: continue
      val parentId = ids[parent] ?: continue
      if (forcedCount == forced.size) {
        forced = forced.copyOf(forcedCount * 2)
        forcedLevels = forcedLevels.copyOf(forcedCount * 2)
      }
      forcedLevels[forcedCount] = level
      forced[forcedCount++] = parentId
    }
    for (level in levels - 1 downTo cut) {
      val behind = levelBehind[level]
      if (levelLeafRanges[level].size < behind.size * 2) levelLeafRanges[level] = IntArray(behind.size * 4)
      val ranges = levelLeafRanges[level]
      val levelViews = levelCandidates[level]
      for (k in behind.indices.reversed()) {
        val start = leaves.size
        collectLeaves(levelViews[behind[k]], leaves)
        ranges[k * 2] = start
        ranges[k * 2 + 1] = leaves.size - start
      }
    }
    val count = leaves.size
    for (index in 0 until count) for (leafId in leaves[index]) leafOfId[leafId] = index
    if (leafFull.size < count) {
      leafFull = BooleanArray(count * 2)
      leafVisible = BooleanArray(count * 2)
    }
    val id = ids[host]
    if (id == null) {
      plan = FULL_PLAN
      leafFull.fill(true, 0, count)
      return
    }
    // A leaf outside the host's rect adds no pixels to its backdrop, so leaves inside it are planned first.
    hostRect.set(rootRect(host))
    hostRect.inset(-host.downsample.toFloat(), -host.downsample.toFloat())
    for (index in 0 until count) leafVisible[index] = RectF.intersects(rootRect(leafViews[index]), hostRect)
    val order = LeafOrder.visibleFirst(leafVisible, count)
    plannedLeaves.clear()
    for (index in order) plannedLeaves.add(leaves[index])
    plan = budget.plan(id, forced.copyOf(forcedCount), plannedLeaves)
    leafFull.fill(false, 0, count)
    for (planned in 0 until minOf(plan.fullLeaves, count)) leafFull[order[planned]] = true
    payForWholeViews(id, cut, levels)
    frameVisits += budget.visits(id)
    frameRecordings++
  }

  // A view whose leaves inside the host's rect are all full goes by node as before, so its flat leaves are paid instead.
  private fun payForWholeViews(id: Int, cut: Int, levels: Int) {
    for (level in levels - 1 downTo cut) {
      val ranges = levelLeafRanges[level]
      for (k in levelBehind[level].indices.reversed()) {
        val start = ranges[k * 2]
        val end = start + ranges[k * 2 + 1]
        var flat = false
        var visibleFlat = false
        for (leaf in start until end) {
          if (leafFull[leaf]) continue
          flat = true
          if (leafVisible[leaf]) visibleFlat = true
        }
        if (!flat || visibleFlat) continue
        paidLeaves.clear()
        for (leaf in start until end) if (!leafFull[leaf]) paidLeaves.add(leaves[leaf])
        if (budget.pay(id, paidLeaves)) leafFull.fill(true, start, end)
      }
    }
  }

  // [view]'s bounds in the root's px, once per frame, or the whole plane when it is not under the root.
  private fun rootRect(view: View): RectF =
    rootRects.getOrPut(view) {
      if (rectsUsed == rectPool.size) rectPool.add(RectF())
      val rect = rectPool[rectsUsed++]
      rect.set(0f, 0f, view.width.toFloat(), view.height.toFloat())
      if (ViewMatrices.toAncestor(view, root, rootMatrix, rootStep)) rootMatrix.mapRect(rect) else rect.set(-Float.MAX_VALUE, -Float.MAX_VALUE, Float.MAX_VALUE, Float.MAX_VALUE)
      rect
    }

  // Whether the current plan keeps every host in [view] full, none of them, or some.
  private fun referenceOf(view: View): BackdropReference {
    val under = hostsUnder[view] ?: return BackdropReference.NODE
    var total = 0
    var full = 0
    var id = under.nextSetBit(0)
    while (id >= 0) {
      leafOfId[id]?.let { leaf ->
        total++
        if (leafFull[leaf]) full++
      }
      id = under.nextSetBit(id + 1)
    }
    return BackdropReference.of(full, total)
  }

  // The topmost hosts in [view]'s subtree, nearest first, each with the ids of the hosts nested in it.
  private fun collectLeaves(view: View, out: ArrayList<IntArray>) {
    val under = hostsUnder[view] ?: return
    if (view is BackdropHostView) {
      out.add(leafIds.getOrPut(view) { under.stream().toArray() })
      leafViews.add(view)
      return
    }
    val group = view as? ViewGroup ?: return
    val positions = dispatchPositionsOf(group)
    val order = BehindOrder.paintOrder(List(group.childCount) { BehindOrder.Child(positions[it], group.getChildAt(it).z, isDrawnByParent(group.getChildAt(it))) })
    for (k in order.indices.reversed()) collectLeaves(group.getChildAt(order[k]), out)
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

    private const val TAG = "RNBackdrop"

    // A host this source has no id for references everything in full, as before planning.
    private val FULL_PLAN = BackdropBudget.Plan(Int.MAX_VALUE, Int.MAX_VALUE, 1)

    // Px a nested host may reach past its ancestor's bounds through float error and still count as inside.
    private const val EDGE_SLOP = 0.5f

    /** The shared source of [host]'s window, which also draws the activity behind a Modal's window. */
    fun forHost(host: BackdropHostView): BehindSource {
      val root = host.rootView
      return sources.getOrPut(root) { BehindSource(root, CaptureRoots.activityDecor(host)?.takeIf { it !== root }) }
    }
  }
}
