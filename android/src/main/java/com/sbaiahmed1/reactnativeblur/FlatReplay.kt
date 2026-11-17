package com.sbaiahmed1.reactnativeblur

import android.graphics.Matrix
import android.graphics.Outline
import android.graphics.RecordingCanvas
import android.graphics.RenderNode
import android.os.Build
import android.util.Log
import android.view.View
import android.view.ViewGroup
import androidx.annotation.RequiresApi
import com.facebook.react.uimanager.ReactOverflowView

/** Whether [view]'s parent draws it this frame. */
internal fun isDrawnByParent(view: View): Boolean = view.visibility == View.VISIBLE || view.animation != null

/**
 * Proxy nodes for the views a backdrop references, with some or all of the hosts in them drawn flat: their look with no
 * backdrop. Views are drawn by value from their background, their node's properties and their children's nodes, never
 * through View.draw.
 */
@RequiresApi(Build.VERSION_CODES.S)
internal class FlatReplay(private val holdsHosts: (View) -> Boolean) {
  private val flat = HashMap<View, RenderNode>()
  private val replays = HashMap<View, HashMap<Any, RenderNode>>()
  private val recordedFlat = HashSet<View>()
  private val used = HashSet<RenderNode>()
  private val outline = Outline()
  private var omitLogged = false

  fun beginFrame() {
    recordedFlat.clear()
    used.clear()
  }

  /** [view] with every host in it flat, recorded once a frame and shared by every backdrop. */
  fun flatProxy(view: View): RenderNode {
    val node = flat.getOrPut(view) { RenderNode("RNBackdropFlat") }
    used.add(node)
    if (recordedFlat.add(view)) {
      record(node, view) { child -> if (holdsHosts(child)) flatProxy(child) else RenderNodeAccess.nodeOf(child) }
    }
    return node
  }

  /** [view] for [owner]'s backdrop: each child holding hosts goes by node, flat or replayed, as [classify] says. */
  fun replayProxy(view: View, owner: Any, classify: (View) -> BackdropReference): RenderNode {
    val node = replays.getOrPut(view) { HashMap() }.getOrPut(owner) { RenderNode("RNBackdropReplay") }
    used.add(node)
    record(node, view) { child ->
      if (!holdsHosts(child)) {
        RenderNodeAccess.nodeOf(child)
      } else {
        when (classify(child)) {
          BackdropReference.NODE -> RenderNodeAccess.nodeOf(child)
          BackdropReference.FLAT -> flatProxy(child)
          BackdropReference.REPLAY -> replayProxy(child, owner, classify)
        }
      }
    }
    return node
  }

  /** Drops the proxies no backdrop used this frame. */
  fun endFrame() {
    val flatEntries = flat.values.iterator()
    while (flatEntries.hasNext()) {
      val node = flatEntries.next()
      if (node in used) continue
      node.discardDisplayList()
      flatEntries.remove()
    }
    val views = replays.values.iterator()
    while (views.hasNext()) {
      val owners = views.next()
      val nodes = owners.values.iterator()
      while (nodes.hasNext()) {
        val node = nodes.next()
        if (node in used) continue
        node.discardDisplayList()
        nodes.remove()
      }
      if (owners.isEmpty()) views.remove()
    }
  }

  /** Drops every proxy. */
  fun clear() {
    beginFrame()
    endFrame()
  }

  /** Drops the proxies of [view] and the ones recorded for its backdrop. */
  fun remove(view: View) {
    flat.remove(view)?.discardDisplayList()
    replays.remove(view)?.values?.forEach { it.discardDisplayList() }
    for (owners in replays.values) owners.remove(view)?.discardDisplayList()
  }

  private inline fun record(node: RenderNode, view: View, childNode: (View) -> RenderNode?) {
    val animation = copyProperties(view, node)
    val canvas = node.beginRecording(view.width, view.height)
    try {
      if (animation != null) {
        canvas.concat(animation)
        if (!view.matrix.isIdentity) canvas.concat(view.matrix)
      }
      val host = view as? BackdropHostView
      // A host clips its background and children to non-uniform corners, as its own draw does.
      val save = host?.clipFlatCorners(canvas) ?: -1
      view.background?.draw(canvas)
      if (host != null) {
        host.drawFlat(canvas)
      } else if (clipsOverflow(view)) {
        canvas.clipRect(0f, 0f, view.width.toFloat(), view.height.toFloat())
      }
      canvas.translate(-view.scrollX.toFloat(), -view.scrollY.toFloat())
      if (view is ViewGroup) drawChildren(canvas, view, childNode)
      if (save >= 0) canvas.restoreToCount(save)
    } finally {
      node.endRecording()
    }
  }

  private inline fun drawChildren(canvas: RecordingCanvas, group: ViewGroup, childNode: (View) -> RenderNode?) {
    val count = group.childCount
    if (count == 0) return
    val positions = IntArray(count)
    BehindOrder.fillDispatchPositions(positions, count, ChildDrawingOrder.isEnabled(group)) { group.getChildDrawingOrder(it) }
    val order = BehindOrder.paintOrder(
      List(count) { BehindOrder.Child(positions[it], group.getChildAt(it).z, isDrawnByParent(group.getChildAt(it))) }
    )
    canvas.enableZ()
    for (index in order) {
      val node = childNode(group.getChildAt(index))
      if (node == null) {
        logOmit()
        continue
      }
      canvas.drawRenderNode(node)
    }
    canvas.disableZ()
  }

  // Copies the properties hwui draws the view's node with, and returns its animation matrix, which only the content can apply.
  private fun copyProperties(view: View, node: RenderNode): Matrix? {
    node.setPosition(view.left, view.top, view.right, view.bottom)
    val animation = view.animationMatrix
    val real = RenderNodeAccess.nodeOf(view)
    if (real != null) {
      val ownMatrix = animation == null
      node.setTranslationX(if (ownMatrix) real.translationX else 0f)
      node.setTranslationY(if (ownMatrix) real.translationY else 0f)
      node.setTranslationZ(real.translationZ)
      node.setScaleX(if (ownMatrix) real.scaleX else 1f)
      node.setScaleY(if (ownMatrix) real.scaleY else 1f)
      node.setRotationX(if (ownMatrix) real.rotationX else 0f)
      node.setRotationY(if (ownMatrix) real.rotationY else 0f)
      node.setRotationZ(if (ownMatrix) real.rotationZ else 0f)
      if (ownMatrix && real.isPivotExplicitlySet) {
        node.setPivotX(real.pivotX)
        node.setPivotY(real.pivotY)
      } else {
        node.resetPivot()
      }
      node.setAlpha(real.alpha)
      node.setHasOverlappingRendering(real.hasOverlappingRendering())
      node.setElevation(real.elevation)
      node.setCameraDistance(real.cameraDistance)
      node.setClipToBounds(real.clipToBounds)
      node.setClipToOutline(real.clipToOutline)
      node.setAmbientShadowColor(real.ambientShadowColor)
      node.setSpotShadowColor(real.spotShadowColor)
      node.setUseCompositingLayer(real.useCompositingLayer, null)
    }
    val provider = view.outlineProvider
    if (provider == null) {
      node.setOutline(null)
    } else {
      outline.setEmpty()
      outline.alpha = 1f
      provider.getOutline(view, outline)
      node.setOutline(outline)
    }
    node.setClipRect(view.clipBounds)
    return animation
  }

  // React Native views clip overflow hidden and scroll in their own dispatchDraw.
  private fun clipsOverflow(view: View): Boolean {
    val overflow = (view as? ReactOverflowView)?.overflow
    return overflow == "hidden" || overflow == "scroll"
  }

  private fun logOmit() {
    if (omitLogged) return
    omitLogged = true
    Log.w("RNBackdrop", "A view behind a blur has no readable node, so the blur leaves it out")
  }
}
