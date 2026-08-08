package com.sbaiahmed1.reactnativeblur

import android.content.Context
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.LinearGradient
import android.graphics.Outline
import android.graphics.Paint
import android.graphics.Path
import android.graphics.PorterDuff
import android.graphics.PorterDuffXfermode
import android.graphics.Shader
import android.os.Build
import android.util.AttributeSet
import android.util.Log
import android.util.TypedValue
import android.view.View
import android.view.ViewGroup
import android.view.ViewOutlineProvider
import android.widget.FrameLayout
import android.view.View.MeasureSpec
import com.qmdeve.blurview.widget.BlurView
import kotlin.math.roundToInt

/**
 * Android implementation of React Native ProgressiveBlurView component.
 * Uses a combination of normal blur (BlurView) + eased gradient alpha mask to
 * create a progressive blur effect that transitions from blurred to clear.
 *
 * QmBlurView ships its own ProgressiveBlurView, but it is the same technique
 * (uniform blur + DST_IN gradient) with a hardcoded 2-stop linear full-height
 * ramp — the exact "no visible blur" failure mode of issue #119 — and offers
 * no startOffset/plateau control, no center direction, and no curve tuning,
 * so it is not a viable replacement for this class.
 */
class ReactNativeProgressiveBlurView : FrameLayout {
  private var blurView: BlurView? = null
  // RN border radii (dp; -1f sentinels for unset per-corner values). With
  // children mounted inside the native view on Android, the view itself must
  // clip to the style's border radius — the JS container that used to do it
  // (overflow: hidden) no longer wraps this view.
  private var borderRadius = 0f
  private var borderTopLeftRadius = -1f
  private var borderTopRightRadius = -1f
  private var borderBottomLeftRadius = -1f
  private var borderBottomRightRadius = -1f
  private val gradientPaint = Paint(Paint.ANTI_ALIAS_FLAG)
  // Hoisted out of dispatchDraw so the mask xfermode is not reallocated on
  // every frame. gradientPaint is only ever used for the DST_IN mask, so the
  // xfermode can stay set for the paint's whole lifetime.
  private val dstInXfermode = PorterDuffXfermode(PorterDuff.Mode.DST_IN)

  // Raw blur amount (0-100) as received from JS. Kept separate from
  // currentBlurRadius because the effective radius also depends on the current
  // direction (center is scaled down), and direction can change after the
  // amount is set, so the radius must be derivable at any time.
  private var currentBlurAmount = DEFAULT_BLUR_RADIUS
  private var currentBlurRadius = DEFAULT_BLUR_RADIUS
  private var currentBlurRounds = DEFAULT_BLUR_ROUNDS
  private var currentOverlayColor = Color.TRANSPARENT
  private var currentBlurType = "xlight"
  private var currentDirection = "topToBottom"
  private var currentStartOffset = 0.0f
  private var isBlurInitialized: Boolean = false
  private var initRunnable: Runnable? = null
  private var swapRootRunnable: Runnable? = null

  companion object {
    private const val TAG = "ReactNativeProgressiveBlur"
    private const val MAX_BLUR_RADIUS = 100f
    private const val DEFAULT_BLUR_RADIUS = 10f
    // Kept at 5 to match the JS wrapper and codegen default (one source of
    // truth); the wrapper always sends blurRounds so a lower internal default
    // was never reachable. See ReactNativeBlurView for the downsample rationale.
    private const val DEFAULT_BLUR_ROUNDS = 5
    private const val DEFAULT_DOWNSAMPLE_FACTOR = 8.0f
    private const val DEBUG = false

    // The DST_IN mask cross-fades one fixed-radius blur in *opacity*, while iOS
    // and web ramp the blur *radius*. A linear alpha ramp therefore reads as a
    // weak ghosting cross-fade — at the perceptual midpoint the blur layer is
    // only 50% opaque, whereas a half-radius blur on iOS still looks clearly
    // blurred (issue #119: "ProgressiveBlurView renders no visible blur").
    //
    // The curve below is a hand-tuned compromise between two failure modes:
    //  - too shallow (linear): the default full-height ramp never looks solid
    //    and the blur reads as "nothing" under a tint (the original #119 bug);
    //  - too steep (ease-out cubic): opacity saturates so close to the clear
    //    edge that the plateau boundary startOffset moves becomes invisible —
    //    every offset renders the same near-uniform frost.
    // These stops rise above linear early (blur body shows by mid-ramp) but
    // keep a genuine clear window near the clear edge and only saturate at
    // ~3/4 of the ramp, so growing the plateau visibly changes the output.
    private val RAMP_POSITIONS = floatArrayOf(0f, 0.15f, 0.3f, 0.45f, 0.6f, 0.75f, 1f)
    private val RAMP_COLORS = floatArrayOf(0f, 0.08f, 0.3f, 0.52f, 0.75f, 0.9f, 1f)
      .map { alpha -> Color.argb((alpha * 255f).roundToInt(), 255, 255, 255) }
      .toIntArray()

    // Cross-platform blur amount constants
    private const val MIN_BLUR_AMOUNT = 0f
    private const val MAX_BLUR_AMOUNT = 100f

    private fun logDebug(message: String) {
      if (DEBUG) {
        Log.d(TAG, message)
      }
    }

    private fun logWarning(message: String) {
      Log.w(TAG, message)
    }

    private fun logError(message: String, throwable: Throwable? = null) {
      Log.e(TAG, message, throwable)
    }

    /**
     * Maps blur amount (0-100) 1:1 to the QmBlurView blur radius, matching
     * ReactNativeBlurView.
     */
    private fun mapBlurAmountToRadius(amount: Float): Float {
      if (amount.isNaN() || amount.isInfinite()) {
        logWarning("Invalid blur amount: $amount, using default")
        return DEFAULT_BLUR_RADIUS
      }
      val clampedAmount = amount.coerceIn(MIN_BLUR_AMOUNT, MAX_BLUR_AMOUNT)
      return (clampedAmount / MAX_BLUR_AMOUNT) * MAX_BLUR_RADIUS
    }
  }

  constructor(context: Context) : super(context) {
    setupView()
  }

  constructor(context: Context, attrs: AttributeSet?) : super(context, attrs) {
    setupView()
  }

  /**
   * Initial view setup in constructor - only sets up visual defaults and gradient paint.
   * Blur child creation is deferred to onAttachedToWindow.
   */
  private fun setupView() {
    // Set up the gradient paint. The DST_IN xfermode is set once here rather
    // than on every dispatchDraw call.
    gradientPaint.style = Paint.Style.FILL
    gradientPaint.xfermode = dstInXfermode
    setWillNotDraw(false)

    // Set transparent background for the container
    super.setBackgroundColor(currentOverlayColor)

    // Force the initialization of the blur child here to ensure it's created,
    // but the actual blur setup will be deferred to onAttachedToWindow
    initializeBlurChild()
  }

  /**
   * Called when the view is attached to a window.
   * Defers blur initialization to the next frame to ensure the view tree is ready.
   */
  override fun onAttachedToWindow() {
    super.onAttachedToWindow()

    if (!isBlurInitialized) {
      val runnable = Runnable {
        initRunnable = null
        initializeBlurChild()
      }
      initRunnable = runnable
      post(runnable)
    }
  }

  /**
   * Initialize the internal blur view child after the view tree is ready.
   * Also swaps the blur capture root to the nearest Screen ancestor.
   */
  private fun initializeBlurChild() {
    if (isBlurInitialized) return

    try {
      if (blurView == null) {
        blurView = BlurView(context, null).apply {
          layoutParams = LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT)
          setDownsampleFactor(DEFAULT_DOWNSAMPLE_FACTOR)
          blurRounds = currentBlurRounds
        }
        addView(blurView)
      }

      blurView?.apply {
        setBlurRadius(currentBlurRadius)
        overlayColor = currentOverlayColor
        setBackgroundColor(currentOverlayColor)
      }

      // Swap blur root after BlurView is attached (deferred to let it attach first)
      val swapRunnable = Runnable {
        swapRootRunnable = null
        swapBlurRootToScreenAncestor()
      }
      swapRootRunnable = swapRunnable
      blurView?.post(swapRunnable)

      isBlurInitialized = true
      logDebug("Initialized progressive blur with blur + gradient approach")
      updateGradient()

    } catch (e: Exception) {
      logError("Failed to initialize progressive blur view: ${e.message}", e)
    }
  }

  /**
   * Redirects the internal BlurView's blur capture root from the activity decor view
   * to the nearest react-native-screens Screen ancestor.
   *
   * BaseBlurView (QmBlurView 1.3.0) field visibility:
   *   public  — mDecorView, mDifferentRoot, preDrawListener (direct access)
   *   private — mForceRedraw (requires reflection)
   */
  private fun swapBlurRootToScreenAncestor() {
    val bv = blurView ?: return
    val newRoot = findOptimalBlurRoot() ?: return

    try {
      val oldDecorView = bv.mDecorView
      val listener = bv.preDrawListener

      if (oldDecorView != null && listener != null) {
        // Remove listener from old root
        try {
          oldDecorView.viewTreeObserver.removeOnPreDrawListener(listener)
        } catch (e: Exception) {
          logDebug("Could not remove old pre-draw listener: ${e.message}")
        }

        // Set new root (public field)
        bv.mDecorView = newRoot

        // Add listener to new root
        newRoot.viewTreeObserver.addOnPreDrawListener(listener)

        // Update mDifferentRoot flag (public field)
        bv.mDifferentRoot = newRoot.rootView != bv.rootView

        // Force a redraw (private field — requires reflection)
        try {
          val forceRedrawField = bv.javaClass.superclass.getDeclaredField("mForceRedraw")
          forceRedrawField.isAccessible = true
          forceRedrawField.setBoolean(bv, true)
        } catch (e: NoSuchFieldException) {
          logWarning("Could not set mForceRedraw via reflection: ${e.message}")
        }

        logDebug("Progressive blur: swapped root to ${newRoot.javaClass.simpleName}")
      }
    } catch (e: Exception) {
      logWarning("Failed to swap progressive blur root: ${e.message}")
    }
  }

  /**
   * Finds the optimal view to use as blur capture root.
   *
   * Priority:
   * 1. Nearest react-native-screens Screen ancestor — scopes blur to the current
   *    screen and prevents capturing navigation transition artifacts.
   * 2. Nearest ReactRootView ancestor — scopes blur to the React Native root when
   *    the component is not inside a Screen (e.g. plain View hierarchies). Without
   *    this fallback, QmBlurView defaults to the activity decor view and blurs the
   *    entire screen instead of just the component area (issue #89).
   * 3. null — returned for modals, which intentionally need to blur content from
   *    the main activity window (decor view is correct there).
   */
  private fun findOptimalBlurRoot(): ViewGroup? {
    return findNearestScreenAncestor() ?: findNearestReactRootView()
  }

  /**
   * Walks up the view hierarchy looking for react-native-screens Screen components.
   */
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

  /**
   * Walks up the view hierarchy looking for the React Native root view.
   * Used as a fallback when no Screen ancestor exists, to scope the blur
   * capture to the RN root rather than the full activity decor view.
   */
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

  override fun onMeasure(widthMeasureSpec: Int, heightMeasureSpec: Int) {
    val width = MeasureSpec.getSize(widthMeasureSpec)
    val height = MeasureSpec.getSize(heightMeasureSpec)
    setMeasuredDimension(width, height)

    // Measure the internal blurView to match the parent size
    blurView?.measure(
      MeasureSpec.makeMeasureSpec(width, MeasureSpec.EXACTLY),
      MeasureSpec.makeMeasureSpec(height, MeasureSpec.EXACTLY)
    )
  }

  override fun onLayout(changed: Boolean, left: Int, top: Int, right: Int, bottom: Int) {
    // Layout the internal blurView to fill the parent
    val width = right - left
    val height = bottom - top
    blurView?.layout(0, 0, width, height)

    // Do NOT call super.onLayout to avoid interfering with React Native children
  }

  override fun onSizeChanged(w: Int, h: Int, oldw: Int, oldh: Int) {
    super.onSizeChanged(w, h, oldw, oldh)
    if (w > 0 && h > 0) {
      updateGradient()
    }
  }

  /**
   * Update the gradient shader based on current direction and startOffset.
   */
  private fun updateGradient() {
    if (width <= 0 || height <= 0) {
      return
    }

    try {
      val gradient = when (currentDirection) {
        "center" -> {
          // Clamp to [0.01, 0.3]: above 0.3 the derived stops
          // (centerLow = 0.2 + startEdge, centerHigh = 0.8 - startEdge) cross
          // over, producing a non-monotonic position array that LinearGradient
          // renders undefined. At 0.3 they meet (0.5, 0.5), the tightest valid
          // center band.
          val startEdge = currentStartOffset.coerceIn(0.01f, 0.3f)
          val endEdge = 1f - startEdge
          val centerLow = 0.2f + startEdge
          val centerHigh = 0.8f - startEdge

          LinearGradient(
            0f,
            0f,
            0f,
            height.toFloat(),
            intArrayOf(
              Color.TRANSPARENT,
              Color.TRANSPARENT,
              Color.WHITE,
              Color.WHITE,
              Color.TRANSPARENT,
              Color.TRANSPARENT
            ),
            floatArrayOf(
              0f,
              startEdge,
              centerLow,
              centerHigh,
              endEdge,
              1f
            ),
            Shader.TileMode.CLAMP
          )
        }
        // startOffset 1 grows the plateau over the whole view: the ramp
        // collapses to zero length and the gradient's two points coincide,
        // which Skia treats as an empty shader — the DST_IN mask erases the
        // blur entirely instead of keeping it fully opaque. Use an all-opaque
        // mask for that case.
        else -> if (currentStartOffset >= 1f) {
          LinearGradient(
            0f,
            0f,
            0f,
            height.toFloat(),
            intArrayOf(Color.WHITE, Color.WHITE),
            floatArrayOf(0f, 1f),
            Shader.TileMode.CLAMP
          )
        } else {
          // point0 is always the clear edge (alpha 0), point1 the point where
          // the mask reaches full opacity. startOffset moves point1 toward the
          // clear edge, growing a fully-blurred plateau from the blurred edge
          // (Shader.TileMode.CLAMP keeps everything past point1 opaque) — the
          // same semantics as the iOS and Web backends (unified in 6.0, see
          // the docs' Platform differences).
          val (x0, y0, x1, y1) = when (currentDirection) {
            "bottomToTop" -> {
              // Blur at bottom, clear at top
              val offsetPixels = height * currentStartOffset
              floatArrayOf(0f, 0f, 0f, height - offsetPixels)
            }
            "topToBottom" -> {
              // Blur at top, clear at bottom (default)
              val offsetPixels = height * currentStartOffset
              floatArrayOf(0f, height.toFloat(), 0f, offsetPixels)
            }
            "leftToRight" -> {
              // Blur at left, clear at right
              val offsetPixels = width * currentStartOffset
              floatArrayOf(width.toFloat(), 0f, offsetPixels, 0f)
            }
            "rightToLeft" -> {
              // Blur at right, clear at left
              val offsetPixels = width * currentStartOffset
              floatArrayOf(0f, 0f, width - offsetPixels, 0f)
            }
            else -> floatArrayOf(0f, 0f, 0f, height.toFloat())
          }

          LinearGradient(
            x0, y0, x1, y1,
            RAMP_COLORS,
            RAMP_POSITIONS,
            Shader.TileMode.CLAMP
          )
        }
      }

      gradientPaint.shader = gradient

      logDebug("Updated gradient: direction=$currentDirection, offset=$currentStartOffset")
      invalidate()

    } catch (e: Exception) {
      logError("Failed to update gradient: ${e.message}", e)
    }
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
    // corner, only a negative sentinel falls back to baseRadius.
    val baseRadius = convertDpToPx(borderRadius)
    val topLeft = if (borderTopLeftRadius >= 0) convertDpToPx(borderTopLeftRadius) else baseRadius
    val topRight = if (borderTopRightRadius >= 0) convertDpToPx(borderTopRightRadius) else baseRadius
    val bottomLeft = if (borderBottomLeftRadius >= 0) convertDpToPx(borderBottomLeftRadius) else baseRadius
    val bottomRight = if (borderBottomRightRadius >= 0) convertDpToPx(borderBottomRightRadius) else baseRadius

    val isUniform = topLeft == topRight && topRight == bottomLeft && bottomLeft == bottomRight

    outlineProvider = if (isUniform) {
      object : ViewOutlineProvider() {
        override fun getOutline(view: View, outline: Outline?) {
          outline?.setRoundRect(0, 0, view.width, view.height, topLeft)
        }
      }
    } else {
      object : ViewOutlineProvider() {
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
  }

  override fun dispatchDraw(canvas: Canvas) {
    // A software canvas here means another blur surface is capturing the
    // screen (all captures in this library rasterize through software
    // canvases) — most importantly this view's OWN internal BlurView
    // capturing its backdrop. Contributing the blur layer and the React
    // children to that capture bakes them into the blurred backdrop, drawing
    // children twice (sharp on top of their own blurred ghost). Skip
    // entirely: the backdrop must only contain what is BEHIND this view.
    if (!canvas.isHardwareAccelerated) return

    val maskedChild = blurView
    if (width <= 0 || height <= 0 || maskedChild == null) {
      super.dispatchDraw(canvas)
      return
    }

    // Mask only the internal BlurView. Drawing ALL children into the layer
    // would fade any React children toward the clear edge along with the blur
    // (iOS renders children unmasked on top of the effect view). The JS
    // wrapper hoists children out of the native view, but direct native usage
    // can still put them here.
    val saveCount = canvas.saveLayer(0f, 0f, width.toFloat(), height.toFloat(), null)
    drawChild(canvas, maskedChild, drawingTime)

    // Apply gradient mask using DST_IN to make the blur gradually transparent.
    // The xfermode is already set on the paint (see setupView), so this draw
    // allocates nothing per frame.
    canvas.drawRect(0f, 0f, width.toFloat(), height.toFloat(), gradientPaint)
    canvas.restoreToCount(saveCount)

    // Draw the remaining children unmasked, preserving order.
    for (i in 0 until childCount) {
      val child = getChildAt(i)
      if (child !== maskedChild && child.visibility == View.VISIBLE) {
        drawChild(canvas, child, drawingTime)
      }
    }
  }

  /**
   * Called when the view is detached from a window.
   */
  override fun onDetachedFromWindow() {
    super.onDetachedFromWindow()
    cleanup()
  }

  /**
   * Cleanup method to prevent memory leaks.
   * Resets initialization state so blur is re-initialized on next attach.
   */
  fun cleanup() {
    isBlurInitialized = false
    initRunnable?.let { removeCallbacks(it) }
    initRunnable = null
    swapRootRunnable?.let { runnable ->
      blurView?.removeCallbacks(runnable)
    }
    swapRootRunnable = null

    // Unregister the OnPreDrawListener from whatever root it was moved to,
    // preventing callbacks into a detached BlurView and avoiding leaks.
    blurView?.let { bv ->
      val listener = bv.preDrawListener
      val decor = bv.mDecorView
      if (listener != null && decor != null) {
        try {
          decor.viewTreeObserver.removeOnPreDrawListener(listener)
        } catch (e: Exception) {
          logDebug("Could not remove pre-draw listener during cleanup: ${e.message}")
        }
      }
      bv.mDecorView = null
      bv.mDifferentRoot = false
    }

    logDebug("View cleaned up")
  }

  /**
   * Set the blur amount with cross-platform mapping.
   * @param amount The blur amount value (0-100), will be mapped to Android's 0-25 radius range
   */
  fun setBlurAmount(amount: Float) {
    currentBlurAmount = amount
    applyBlurRadius()
  }

  /**
   * Derives the effective blur radius from the raw amount and the current
   * direction, then applies it. Called from both setBlurAmount and setDirection
   * so the center-direction scale-down is applied regardless of the order in
   * which those two props arrive (the JS wrapper emits blurAmount before
   * direction, so applying the factor only inside setBlurAmount missed it).
   */
  private fun applyBlurRadius() {
    var radius = mapBlurAmountToRadius(currentBlurAmount)
    if (currentDirection == "center") {
      // Center direction tends to look stronger; scale it down for parity with iOS
      radius *= 0.35f
    }
    currentBlurRadius = radius
    logDebug("applyBlurRadius: amount=$currentBlurAmount -> $currentBlurRadius (direction=$currentDirection)")

    try {
      blurView?.setBlurRadius(currentBlurRadius)
      invalidate()
    } catch (e: Exception) {
      logError("Failed to set blur radius: ${e.message}", e)
    }
  }

  /**
   * Set the number of blur rounds.
   * @param rounds The number of blur rounds (1-15)
   */
  fun setRounds(rounds: Int) {
    val blurRounds = rounds.coerceIn(1, 15)
    currentBlurRounds = blurRounds
    logDebug("setRounds: $rounds -> $blurRounds")

    try {
      blurView?.blurRounds = blurRounds
    } catch (e: Exception) {
      logError("Failed to set blur rounds: ${e.message}", e)
    }
  }

  /**
   * Set the direction of the progressive blur gradient.
   * @param direction The direction string: "blurredTopClearBottom" or "blurredBottomClearTop"
   */
  fun setDirection(direction: String) {
    currentDirection = when (direction.lowercase()) {
      "blurredbottomcleartop", "bottomtotop", "bottom" -> "bottomToTop"
      "blurredtopclearbottom", "toptobottom", "top" -> "topToBottom"
      "blurredcentercleartopandbottom", "center" -> "center"
      "blurredlefttoclearright", "lefttoright", "left" -> "leftToRight"
      "blurredrighttoclearleft", "righttoleft", "right" -> "rightToLeft"
      else -> {
        logWarning("Unknown direction: $direction, defaulting to topToBottom")
        "topToBottom"
      }
    }
    logDebug("setDirection: $direction -> $currentDirection")

    try {
      // Recompute the radius: switching to/from center changes the scale factor.
      applyBlurRadius()
      updateGradient()
    } catch (e: Exception) {
      logError("Failed to set gradient direction: ${e.message}", e)
    }
  }

  /**
   * Set the start offset for the progressive blur.
   * Controls where the gradient transition begins.
   *
   * @param offset The offset value (0.0 to 1.0) - where 0 starts immediately, 1 delays to the end
   */
  fun setStartOffset(offset: Float) {
    currentStartOffset = offset.coerceIn(0.0f, 1.0f)
    logDebug("setStartOffset: $offset -> clamped to $currentStartOffset")

    try {
      updateGradient()
    } catch (e: Exception) {
      logError("Failed to update startOffset: ${e.message}", e)
    }
  }

  /**
   * Set the blur type which determines the overlay color.
   * @param type The blur type string (case-insensitive)
   */
  fun setBlurType(type: String) {
    currentBlurType = type
    val blurType = BlurType.fromString(type)
    currentOverlayColor = blurType.overlayColor
    logDebug("setBlurType: $type -> ${blurType.name} -> ${Integer.toHexString(currentOverlayColor)}")

    try {
      blurView?.setOverlayColor(currentOverlayColor)
      invalidate()
    } catch (e: Exception) {
      logError("Failed to set overlay color: ${e.message}", e)
    }
  }
}
