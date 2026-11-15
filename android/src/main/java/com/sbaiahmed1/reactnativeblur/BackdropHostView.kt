package com.sbaiahmed1.reactnativeblur

import android.content.Context
import android.graphics.Canvas
import android.graphics.Outline
import android.graphics.Path
import android.graphics.RenderNode
import android.os.Build
import android.view.View
import android.view.ViewOutlineProvider
import android.widget.FrameLayout

/** Base of the engine views: joins the shared [SoftwareSource], owns the backdrop node and its effect, clips to the corners. */
abstract class BackdropHostView(context: Context) : FrameLayout(context) {
  internal abstract val downsample: Int
  internal abstract val effect: BackdropEffect
  protected abstract fun drawBackdrop(canvas: Canvas, node: RenderNode)
  protected abstract fun drawSoftwareFallback(canvas: Canvas)
  internal open val engineEnabled: Boolean
    get() = Build.VERSION.SDK_INT >= Build.VERSION_CODES.S
  internal open val nodeAtCaptureScale: Boolean
    get() = true

  private var source: SoftwareSource? = null
  private var attachRunnable: Runnable? = null
  private var node: RenderNode? = null
  private var recorded: SoftwareSource.Snapshot? = null
  private var recordedWidth = 0
  private var recordedHeight = 0
  private var effectDirty = true
  private var nodeDrawn = false

  private var borderRadiusDp = 0f
  private var borderTopLeftRadiusDp = -1f
  private var borderTopRightRadiusDp = -1f
  private var borderBottomLeftRadiusDp = -1f
  private var borderBottomRightRadiusDp = -1f
  internal var cornerRadii = CornerRadii.Px(0f, 0f, 0f, 0f)
    private set
  protected var baseRadiusPx = 0f
    private set
  private val cornerPath = Path()
  private var cornerPathWidth = -1
  private var cornerPathHeight = -1

  internal val isBackdropVisible: Boolean
    get() = isAttachedToWindow && isShown && windowVisibility == VISIBLE && width > 0 && height > 0

  init {
    clipChildren = true
    clipToOutline = true
  }

  override fun onAttachedToWindow() {
    super.onAttachedToWindow()
    if (!engineEnabled) return
    // The parent chain up to the Screen is not settled at attach on a re-attach during navigation.
    val runnable = Runnable {
      attachRunnable = null
      source = SoftwareSource.forHost(this)?.also { it.addHost(this) }
    }
    attachRunnable = runnable
    post(runnable)
  }

  override fun onDetachedFromWindow() {
    super.onDetachedFromWindow()
    cleanup()
  }

  open fun cleanup() {
    attachRunnable?.let { removeCallbacks(it) }
    attachRunnable = null
    source?.removeHost(this)
    source = null
    recorded = null
    nodeDrawn = false
    if (engineEnabled) node?.discardDisplayList()
  }

  /** The effect is rebuilt at the next frame, for a prop or a size change. */
  fun markEffectDirty() {
    effectDirty = true
    invalidate()
  }

  override fun onSizeChanged(w: Int, h: Int, oldw: Int, oldh: Int) {
    super.onSizeChanged(w, h, oldw, oldh)
    markEffectDirty()
  }

  /** Called by the source on every pre-draw after its capture: re-records the node when the capture, the offset or the size changed. */
  internal fun onBackdropFrame() {
    val currentSource = source ?: return
    if (width <= 0 || height <= 0 || Build.VERSION.SDK_INT < Build.VERSION_CODES.S) return
    val snapshot = currentSource.snapshotOf(this) ?: return
    val backdropNode = node ?: RenderNode("RNBackdrop").also { node = it }
    val rerecord = snapshot != recorded || width != recordedWidth || height != recordedHeight
    if (rerecord) {
      if (!currentSource.recordInto(backdropNode, this)) return
      recorded = snapshot
      recordedWidth = width
      recordedHeight = height
    }
    // Some API 31 builds key the filtered layer on the effect object only, so new content needs a new effect.
    if (effectDirty || (rerecord && Build.VERSION.SDK_INT == Build.VERSION_CODES.S)) {
      backdropNode.setRenderEffect(effect.create(this))
      effectDirty = false
    }
    if (!nodeDrawn) invalidate()
  }

  override fun draw(canvas: Canvas) {
    if (SoftwareSource.isCapturing(this)) return
    val save = clipCorners(canvas)
    super.draw(canvas)
    if (save >= 0) canvas.restoreToCount(save)
  }

  override fun dispatchDraw(canvas: Canvas) {
    // A ViewGroup that paints nothing itself skips draw() and comes here directly, so the check is repeated.
    if (SoftwareSource.isCapturing(this)) return
    val save = clipCorners(canvas)
    drawContent(canvas)
    if (save >= 0) canvas.restoreToCount(save)
  }

  // A path outline clips only from API 33, so non-uniform corners also clip on the canvas.
  private fun clipCorners(canvas: Canvas): Int {
    if (cornerRadii.isUniform) return -1
    if (cornerPathWidth != width || cornerPathHeight != height) {
      cornerPath.rewind()
      addCornerPath(cornerPath, width, height)
      cornerPathWidth = width
      cornerPathHeight = height
    }
    val save = canvas.save()
    canvas.clipPath(cornerPath)
    return save
  }

  private fun addCornerPath(path: Path, w: Int, h: Int) {
    val radii = cornerRadii
    val corners = floatArrayOf(
      radii.topLeft, radii.topLeft,
      radii.topRight, radii.topRight,
      radii.bottomRight, radii.bottomRight,
      radii.bottomLeft, radii.bottomLeft
    )
    path.addRoundRect(0f, 0f, w.toFloat(), h.toFloat(), corners, Path.Direction.CW)
  }

  private fun drawContent(canvas: Canvas) {
    val backdropNode = node
    if (
      engineEnabled && canvas.isHardwareAccelerated && backdropNode != null && recorded != null &&
      Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q && backdropNode.hasDisplayList()
    ) {
      drawBackdrop(canvas, backdropNode)
      nodeDrawn = true
    } else {
      drawSoftwareFallback(canvas)
    }
    super.dispatchDraw(canvas)
  }

  fun setBorderRadius(radius: Float) {
    borderRadiusDp = radius
    updateCorners()
  }

  fun setBorderTopLeftRadius(radius: Float) {
    borderTopLeftRadiusDp = radius
    updateCorners()
  }

  fun setBorderTopRightRadius(radius: Float) {
    borderTopRightRadiusDp = radius
    updateCorners()
  }

  fun setBorderBottomLeftRadius(radius: Float) {
    borderBottomLeftRadiusDp = radius
    updateCorners()
  }

  fun setBorderBottomRightRadius(radius: Float) {
    borderBottomRightRadiusDp = radius
    updateCorners()
  }

  private fun updateCorners() {
    val density = resources.displayMetrics.density
    val radii = CornerRadii.resolve(
      borderRadiusDp,
      borderTopLeftRadiusDp,
      borderTopRightRadiusDp,
      borderBottomRightRadiusDp,
      borderBottomLeftRadiusDp,
      density
    )
    cornerRadii = radii
    cornerPathWidth = -1
    baseRadiusPx = borderRadiusDp * density
    outlineProvider = if (radii.isUniform) {
      object : ViewOutlineProvider() {
        override fun getOutline(view: View, outline: Outline) {
          outline.setRoundRect(0, 0, view.width, view.height, radii.topLeft)
        }
      }
    } else {
      object : ViewOutlineProvider() {
        override fun getOutline(view: View, outline: Outline) {
          val path = Path()
          addCornerPath(path, view.width, view.height)
          if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            outline.setPath(path)
          } else {
            @Suppress("DEPRECATION")
            outline.setConvexPath(path)
          }
        }
      }
    }
    clipToOutline = true
    invalidateOutline()
    markEffectDirty()
  }

  override fun onMeasure(widthMeasureSpec: Int, heightMeasureSpec: Int) {
    // React Native sets the size.
    setMeasuredDimension(MeasureSpec.getSize(widthMeasureSpec), MeasureSpec.getSize(heightMeasureSpec))
  }

  override fun onLayout(changed: Boolean, left: Int, top: Int, right: Int, bottom: Int) {
    // Yoga lays out the children.
  }
}
