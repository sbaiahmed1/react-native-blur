package com.sbaiahmed1.reactnativeblur

import android.content.Context
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Outline
import android.graphics.Paint
import android.graphics.Path
import android.graphics.Rect
import android.graphics.RectF
import android.graphics.RenderEffect
import android.graphics.RenderNode
import android.graphics.RuntimeShader
import android.graphics.Shader
import android.os.Build
import android.util.Log
import android.util.TypedValue
import android.view.MotionEvent
import android.view.View
import android.view.ViewGroup
import android.view.ViewOutlineProvider
import android.widget.FrameLayout
import androidx.annotation.RequiresApi
import androidx.core.graphics.toColorInt

/**
 * Android implementation of React Native LiquidGlassView, rendering the
 * AndroidLiquidGlassView (com.qmdeve.liquidglass) AGSL glass shader on
 * Android 13+ (RuntimeShader requires API 33; the JS wrapper falls back to
 * BlurView below that).
 *
 * Only the library's shader and effect parameters are used — NOT its widget
 * classes. Those record the bound backdrop source with `target.draw()` on a
 * hardware RecordingCanvas, which references the cached display lists of the
 * source's children; with an ancestor as the source (the only general choice
 * inside an RN hierarchy) that recording transitively references the glass
 * view's own RenderNode, forming a cyclic render tree that stack-overflows
 * the render thread in RenderNode::prepareTreeImpl (the library's own demo
 * only ever binds a sibling container, which RN cannot guarantee).
 *
 * Instead, the backdrop is captured the way this library's sibling QmBlurView
 * (and ReactNativeBlurView here) already proved safe: a SOFTWARE draw of the
 * nearest rnscreens Screen / ReactRootView into a reused downsampled bitmap —
 * a software canvas re-executes draw() so the self-exclusion guard in [draw]
 * works, and a flat bitmap holds no node references, so a cycle is impossible
 * by construction. The bitmap is drawn into a standalone RenderNode carrying
 * the library's RuntimeShader RenderEffect, so refraction/dispersion/blur/tint
 * all still run on the GPU. React children are direct children of this view;
 * the capture guard skips the whole subtree, so they are never refracted back
 * into their own backdrop.
 */
class ReactNativeLiquidGlassView(context: Context) : FrameLayout(context) {

  private var glassType: String = "clear"
  private var glassTintColor: Int = Color.TRANSPARENT
  private var glassOpacity: Float = 1.0f
  private var interactive: Boolean = true
  private var borderRadius = 0f
  private var borderTopLeftRadius = -1f
  private var borderTopRightRadius = -1f
  private var borderBottomLeftRadius = -1f
  private var borderBottomRightRadius = -1f

  // Shader engine state; only touched on API 33+.
  private var glassNode: RenderNode? = null
  private var liquidShader: RuntimeShader? = null
  private var shaderFailed = false
  // Resolved uniform corner radius in px for the shader's lens geometry (the
  // per-corner-aware outline clip is handled separately in updateCornerRadius).
  private var shaderRadiusPx = 0f
  private var captureSource: ViewGroup? = null
  private var effectDirty = true
  private var initRunnable: Runnable? = null
  // Guards the visibility callbacks Android fires from the View super
  // constructor, before this class's properties are initialized.
  private var constructed = false
  private val capturePaint = Paint(Paint.FILTER_BITMAP_FLAG)
  private val captureSrcRect = Rect()
  private val nodeBounds = RectF()
  private val sourceLocation = IntArray(2)
  private val ownLocation = IntArray(2)

  // Attach-scoped throttled backdrop refresh (~30 fps): live enough that
  // content scrolling behind the glass tracks smoothly, without re-capturing
  // at full display rate.
  private val backdropTicker = object : Runnable {
    override fun run() {
      refreshBackdrop()
      postDelayed(this, BACKDROP_REFRESH_MS)
    }
  }

  companion object {
    private const val TAG = "RNLiquidGlassView"

    private const val BACKDROP_REFRESH_MS = 33L

    // Capture at half linear resolution: 4x fewer bytes and 4x less software
    // raster work per refresh; the shader's blur consumes the softness.
    private const val CAPTURE_DOWNSAMPLE = 2

    // Shader parameter defaults matching the library widget's own defaults
    // (LiquidGlassView.java): refractionHeight 20dp, refractionOffset -70dp,
    // dispersion 0.5, plus Config.DEPTH_EFFECT 0.3 and the noFilter() preset
    // (contrast 0, whitePoint 0, chromaMultiplier 1).
    private const val REFRACTION_HEIGHT_DP = 20f
    private const val REFRACTION_OFFSET_DP = 70f
    private const val DISPERSION = 0.5f
    private const val DEPTH_EFFECT = 0.3f

    // The library leaves blur to the caller (widget default is ~0). Map the
    // two iOS materials to a light and a frosty backdrop blur respectively.
    private const val CLEAR_BLUR_RADIUS = 4f
    private const val REGULAR_BLUR_RADIUS = 18f

    // iOS-style press feedback for isInteractive (the library widget uses the
    // same scale in its touch effect).
    private const val PRESS_SCALE = 1.02f

    private val isSupported = Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU

    private fun logWarning(message: String, throwable: Throwable? = null) {
      Log.w(TAG, message, throwable)
    }
  }

  init {
    clipChildren = true
    clipToOutline = true
    constructed = true
  }

  override fun onAttachedToWindow() {
    super.onAttachedToWindow()
    if (!isSupported) return

    // Resolve the capture root once the parent chain has settled (on a
    // re-attach during navigation it is not settled at attach time — same
    // reasoning as ReactNativeBlurView). The wrapper's own parent is a safe
    // last resort: software capture self-excludes via the draw() guard.
    val runnable = Runnable {
      initRunnable = null
      val source =
        findNearestScreenAncestor() ?: findNearestReactRootView() ?: parent as? ViewGroup
      captureSource = source
      source?.let { SharedBackdropCapture.register(it) }
      refreshBackdrop()
    }
    initRunnable = runnable
    post(runnable)

    restartTickerIfVisible()
  }

  // The per-instance software capture is the main running cost, so the ticker
  // only runs while the view can actually be seen: it stops when the view or
  // its window is hidden (backgrounded app, covered screen, GONE subtree) and
  // restarts when visibility returns.
  private fun restartTickerIfVisible() {
    if (!constructed) return
    removeCallbacks(backdropTicker)
    if (isSupported && isAttachedToWindow && isShown && windowVisibility == VISIBLE) {
      postDelayed(backdropTicker, BACKDROP_REFRESH_MS)
    }
  }

  override fun onWindowVisibilityChanged(visibility: Int) {
    super.onWindowVisibilityChanged(visibility)
    restartTickerIfVisible()
  }

  override fun onVisibilityChanged(changedView: View, visibility: Int) {
    super.onVisibilityChanged(changedView, visibility)
    restartTickerIfVisible()
  }

  override fun onDetachedFromWindow() {
    super.onDetachedFromWindow()
    cleanup()
  }

  fun cleanup() {
    initRunnable?.let { removeCallbacks(it) }
    initRunnable = null
    removeCallbacks(backdropTicker)
    captureSource?.let { SharedBackdropCapture.unregister(it) }
    captureSource = null
    if (isSupported) {
      glassNode?.discardDisplayList()
    }
  }

  override fun onSizeChanged(w: Int, h: Int, oldw: Int, oldh: Int) {
    super.onSizeChanged(w, h, oldw, oldh)
    if (w > 0 && h > 0) {
      effectDirty = true
      refreshBackdrop()
    }
  }

  /** Self-exclusion from backdrop capture; the software canvas re-executes
   * draw(), so returning early skips this whole subtree (glass + children).
   * The flag is global so that EVERY glass view is excluded from the shared
   * capture, not just the one that triggered it. */
  override fun draw(canvas: Canvas) {
    if (SharedBackdropCapture.captureInProgress) return
    super.draw(canvas)
  }

  override fun dispatchDraw(canvas: Canvas) {
    if (isSupported && canvas.isHardwareAccelerated) {
      val node = glassNode
      if (node != null && node.hasDisplayList()) {
        canvas.drawRenderNode(node)
      }
    }
    super.dispatchDraw(canvas)
  }

  private fun refreshBackdrop() {
    if (!isSupported || width <= 0 || height <= 0 || !isAttachedToWindow) return
    val source = captureSource ?: return
    if (source.width <= 0 || source.height <= 0) return
    refreshBackdrop33(source)
  }

  @RequiresApi(Build.VERSION_CODES.TIRAMISU)
  private fun refreshBackdrop33(source: ViewGroup) {
    ensureEngine()
    // Without a compiled shader the node would draw a raw, unshaded copy of
    // the backdrop on top of the content; leave it without a display list so
    // dispatchDraw skips it entirely.
    if (shaderFailed) return
    val node = glassNode ?: return

    // One shared, downsampled capture of the source per refresh interval,
    // shared by every glass view on the screen; this view only blits its own
    // sub-rect out of it.
    val bitmap = SharedBackdropCapture.acquire(source, CAPTURE_DOWNSAMPLE, BACKDROP_REFRESH_MS)
      ?: return
    source.getLocationInWindow(sourceLocation)
    getLocationInWindow(ownLocation)
    val left = (ownLocation[0] - sourceLocation[0]) / CAPTURE_DOWNSAMPLE
    val top = (ownLocation[1] - sourceLocation[1]) / CAPTURE_DOWNSAMPLE
    captureSrcRect.set(
      left,
      top,
      left + (width / CAPTURE_DOWNSAMPLE).coerceAtLeast(1),
      top + (height / CAPTURE_DOWNSAMPLE).coerceAtLeast(1)
    )

    node.setPosition(0, 0, width, height)
    val recording = node.beginRecording(width, height)
    try {
      nodeBounds.set(0f, 0f, width.toFloat(), height.toFloat())
      recording.drawBitmap(bitmap, captureSrcRect, nodeBounds, capturePaint)
    } finally {
      node.endRecording()
    }

    if (effectDirty) {
      applyRenderEffect(node)
    }
    invalidate()
  }

  @RequiresApi(Build.VERSION_CODES.TIRAMISU)
  private fun ensureEngine() {
    if (glassNode != null) return
    glassNode = RenderNode(TAG)
    try {
      liquidShader = RuntimeShader(loadShaderSource())
    } catch (e: Exception) {
      // A shader compile failure would otherwise crash on first uniform set;
      // leave the engine dark (children still render) rather than crash.
      logWarning("Failed to create liquid glass shader", e)
      liquidShader = null
      shaderFailed = true
    }
  }

  private fun loadShaderSource(): String {
    // The AGSL shader is vendored from AndroidLiquidGlassView (MIT, license
    // header retained in the resource) rather than consumed from its AAR: the
    // published artifact requires compileSdk 37+, and only the shader is
    // usable inside RN anyway (see the class comment).
    return resources.openRawResource(R.raw.rnblur_liquidglass_effect)
      .bufferedReader()
      .use { it.readText() }
  }

  @RequiresApi(Build.VERSION_CODES.TIRAMISU)
  private fun applyRenderEffect(node: RenderNode) {
    val shader = liquidShader ?: return
    val w = width.toFloat()
    val h = height.toFloat()
    if (w <= 0f || h <= 0f) return

    // The shader models a single uniform-radius rounded rect; clamp against
    // BOTH half-extents so the signed-distance geometry stays valid on views
    // that are narrower than they are tall (and vice versa).
    val radius = shaderRadiusPx.coerceIn(0f, minOf(w, h) / 2f)

    shader.setFloatUniform("size", floatArrayOf(w, h))
    shader.setFloatUniform("offset", floatArrayOf(0f, 0f))
    shader.setFloatUniform("cornerRadii", floatArrayOf(radius, radius, radius, radius))
    shader.setFloatUniform("refractionHeight", convertDpToPx(REFRACTION_HEIGHT_DP))
    shader.setFloatUniform("refractionAmount", -convertDpToPx(REFRACTION_OFFSET_DP))
    shader.setFloatUniform("depthEffect", DEPTH_EFFECT)
    shader.setFloatUniform("chromaticAberration", DISPERSION)
    shader.setFloatUniform("contrast", 0f)
    shader.setFloatUniform("whitePoint", 0f)
    shader.setFloatUniform("chromaMultiplier", 1f)
    // Shader-modulated tint, so the iOS formula (tint's own alpha scaled by
    // glassOpacity) maps directly — no scrim, no alpha cap needed.
    shader.setFloatUniform(
      "tintColor",
      floatArrayOf(
        Color.red(glassTintColor) / 255f,
        Color.green(glassTintColor) / 255f,
        Color.blue(glassTintColor) / 255f
      )
    )
    shader.setFloatUniform("tintAlpha", (Color.alpha(glassTintColor) / 255f) * glassOpacity)

    val shaderEffect = RenderEffect.createRuntimeShaderEffect(shader, "content")
    val blurRadius =
      if (glassType.equals("regular", ignoreCase = true)) REGULAR_BLUR_RADIUS
      else CLEAR_BLUR_RADIUS
    val effect = RenderEffect.createChainEffect(
      shaderEffect,
      RenderEffect.createBlurEffect(blurRadius, blurRadius, Shader.TileMode.CLAMP)
    )
    node.setRenderEffect(effect)
    effectDirty = false
  }

  private fun findNearestScreenAncestor(): ViewGroup? {
    var currentParent = this.parent
    while (currentParent != null) {
      if (currentParent.javaClass.name == "com.swmansion.rnscreens.Screen") {
        return currentParent as? ViewGroup
      }
      currentParent = currentParent.parent
    }
    return null
  }

  private fun findNearestReactRootView(): ViewGroup? {
    var currentParent = this.parent
    while (currentParent != null) {
      if (currentParent.javaClass.name == "com.facebook.react.ReactRootView") {
        return currentParent as? ViewGroup
      }
      currentParent = currentParent.parent
    }
    return null
  }

  fun setGlassType(type: String) {
    glassType = type
    effectDirty = true
  }

  /**
   * Set the glass tint color.
   * @param color Hex string (e.g. "#FF0000"), or "clear"/"transparent"/null for no tint
   */
  fun setGlassTintColor(color: String?) {
    glassTintColor =
      if (color == null || color.equals("clear", ignoreCase = true) ||
        color.equals("transparent", ignoreCase = true)
      ) {
        Color.TRANSPARENT
      } else {
        try {
          color.toColorInt()
        } catch (e: Exception) {
          logWarning("Invalid color format for glass tint: $color", e)
          Color.TRANSPARENT
        }
      }
    effectDirty = true
  }

  fun setGlassOpacity(opacity: Float) {
    glassOpacity = opacity.coerceIn(0.0f, 1.0f)
    effectDirty = true
  }

  fun setIsInteractive(isInteractive: Boolean) {
    interactive = isInteractive
    if (!isInteractive) {
      animate().cancel()
      scaleX = 1f
      scaleY = 1f
    }
  }

  override fun onTouchEvent(event: MotionEvent): Boolean {
    if (!interactive) return super.onTouchEvent(event)
    when (event.actionMasked) {
      MotionEvent.ACTION_DOWN -> {
        animate().scaleX(PRESS_SCALE).scaleY(PRESS_SCALE).setDuration(120).start()
        // Claim only the DOWN so the press animation gets its UP/CANCEL;
        // moves are not consumed, leaving scroll parents free to intercept
        // the gesture (which delivers the CANCEL that releases the scale).
        return true
      }
      MotionEvent.ACTION_UP, MotionEvent.ACTION_CANCEL -> {
        animate().scaleX(1f).scaleY(1f).setDuration(160).start()
      }
    }
    return super.onTouchEvent(event)
  }

  fun setBorderRadius(radius: Float) {
    borderRadius = radius
    updateCornerRadius()
  }

  fun setBorderTopLeftRadius(radius: Float) {
    borderTopLeftRadius = radius
    updateCornerRadius()
  }

  fun setBorderTopRightRadius(radius: Float) {
    borderTopRightRadius = radius
    updateCornerRadius()
  }

  fun setBorderBottomLeftRadius(radius: Float) {
    borderBottomLeftRadius = radius
    updateCornerRadius()
  }

  fun setBorderBottomRightRadius(radius: Float) {
    borderBottomRightRadius = radius
    updateCornerRadius()
  }

  private fun convertDpToPx(dp: Float): Float {
    val displayMetrics = context.resources.displayMetrics
    return TypedValue.applyDimension(TypedValue.COMPLEX_UNIT_DIP, dp, displayMetrics)
  }

  private fun updateCornerRadius() {
    // Unset per-corner radii use the sentinel -1f (see the field defaults), so
    // test >= 0: an explicit 0 must override the base radius to square that
    // corner, only a negative sentinel falls back to baseRadius. The shader's
    // lens geometry only supports the uniform base radius; per-corner
    // differences are honored by the outline clip.
    val baseRadius = convertDpToPx(borderRadius)
    val topLeft = if (borderTopLeftRadius >= 0) convertDpToPx(borderTopLeftRadius) else baseRadius
    val topRight = if (borderTopRightRadius >= 0) convertDpToPx(borderTopRightRadius) else baseRadius
    val bottomLeft = if (borderBottomLeftRadius >= 0) convertDpToPx(borderBottomLeftRadius) else baseRadius
    val bottomRight = if (borderBottomRightRadius >= 0) convertDpToPx(borderBottomRightRadius) else baseRadius

    val isUniform = topLeft == topRight && topRight == bottomLeft && bottomLeft == bottomRight

    // The shader lens geometry follows the resolved uniform radius (which may
    // come from four equal per-corner values rather than borderRadius);
    // non-uniform corners keep the base radius for the lens and rely on the
    // outline clip for their exact shape.
    shaderRadiusPx = if (isUniform) topLeft else baseRadius

    if (isUniform) {
      outlineProvider = object : ViewOutlineProvider() {
        override fun getOutline(view: View, outline: Outline?) {
          outline?.setRoundRect(0, 0, view.width, view.height, topLeft)
        }
      }
    } else {
      outlineProvider = object : ViewOutlineProvider() {
        override fun getOutline(view: View, outline: Outline?) {
          val path = Path()
          val radii = floatArrayOf(
            topLeft,
            topLeft,
            topRight,
            topRight,
            bottomRight,
            bottomRight,
            bottomLeft,
            bottomLeft
          )
          path.addRoundRect(0f, 0f, view.width.toFloat(), view.height.toFloat(), radii, Path.Direction.CW)
          if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            outline?.setPath(path)
          } else {
            @Suppress("DEPRECATION")
            outline?.setConvexPath(path)
          }
        }
      }
    }

    clipToOutline = true
    invalidateOutline()
    effectDirty = true
  }

  override fun onMeasure(widthMeasureSpec: Int, heightMeasureSpec: Int) {
    // Trust React Native to provide correct dimensions
    setMeasuredDimension(
      MeasureSpec.getSize(widthMeasureSpec),
      MeasureSpec.getSize(heightMeasureSpec)
    )
  }

  /**
   * Override onLayout to properly position children according to React Native's Yoga layout.
   */
  override fun onLayout(changed: Boolean, left: Int, top: Int, right: Int, bottom: Int) {
    // No-op: Layout is handled by React Native's UIManager.
  }
}
