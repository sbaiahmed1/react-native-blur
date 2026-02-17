package com.sbaiahmed1.reactnativeblur

import android.content.Context
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.LinearGradient
import android.graphics.Paint
import android.graphics.PorterDuff
import android.graphics.PorterDuffXfermode
import android.graphics.Shader
import android.util.AttributeSet
import android.util.Log
import android.view.View
import android.view.ViewGroup
import android.widget.FrameLayout
import android.view.View.MeasureSpec
import com.qmdeve.blurview.widget.BlurView
import kotlin.math.max

/**
 * Android implementation of React Native ProgressiveBlurView component.
 * Uses a combination of normal blur (BlurView) + linear gradient mask to create
 * a progressive blur effect that transitions from blurred to clear.
 *
 * This approach is more reliable than using the library's ProgressiveBlurView,
 * which has limited control over gradient direction and appearance.
 */
class ReactNativeProgressiveBlurView : FrameLayout {
  private var blurView: BlurView? = null
  private val gradientPaint = Paint(Paint.ANTI_ALIAS_FLAG)

  private var currentBlurRadius = DEFAULT_BLUR_RADIUS
  private var currentOverlayColor = Color.TRANSPARENT
  private var currentDirection = "topToBottom"
  private var currentStartOffset = 0.0f
  private var hasExplicitBackground: Boolean = false
  private var isBlurInitialized: Boolean = false
  private var initRunnable: Runnable? = null
  private var swapRootRunnable: Runnable? = null

  companion object {
    private const val TAG = "ReactNativeProgressiveBlur"
    private const val MAX_BLUR_RADIUS = 100f
    private const val DEFAULT_BLUR_RADIUS = 10f
    private const val DEBUG = false

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
     * Maps blur amount (0-100) to Android blur radius (0-25).
     */
    private fun mapBlurAmountToRadius(amount: Float): Float {
      if (amount.isNaN() || amount.isInfinite()) {
        logWarning("Invalid blur amount: $amount, using default")
        return DEFAULT_BLUR_RADIUS
      }
      val clampedAmount = amount.coerceIn(MIN_BLUR_AMOUNT, MAX_BLUR_AMOUNT)
      return (clampedAmount / MAX_BLUR_RADIUS) * MAX_BLUR_RADIUS
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
    // Set up the gradient paint
    gradientPaint.style = Paint.Style.FILL
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
          setDownsampleFactor(6.0F)
          blurRounds = 5
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
   * BaseBlurView (QmBlurView 1.1.4) field visibility:
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
   * Returns the nearest react-native-screens Screen ancestor if found, which scopes
   * the blur to the current screen and prevents capturing navigation transitions.
   *
   * Returns null when no Screen ancestor exists (e.g. modals, standalone usage).
   * A null return means swapBlurRootToScreenAncestor() is a no-op and QmBlurView
   * keeps its default decor view as the blur root — this is correct for modals
   * because they need to blur the content behind them (in the main activity window).
   */
  private fun findOptimalBlurRoot(): ViewGroup? {
    return findNearestScreenAncestor()
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
          val startEdge = max(currentStartOffset, 0.01f)
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
        else -> {
          val (x0, y0, x1, y1) = when (currentDirection) {
            "bottomToTop" -> {
              // Blur at bottom, clear at top
              // point0 (TRANSPARENT/clear) at top, point1 (WHITE/blur) at bottom adjusted by offset
              val offsetPixels = height * currentStartOffset
              floatArrayOf(0f, 0f, 0f, height - offsetPixels)
            }
            "topToBottom" -> {
              // Blur at top, clear at bottom (default)
              // point0 (TRANSPARENT/clear) at bottom, point1 (WHITE/blur) at top adjusted by offset
              val offsetPixels = height * currentStartOffset
              floatArrayOf(0f, height.toFloat(), 0f, offsetPixels)
            }
            "leftToRight" -> {
              val offsetPixels = width * currentStartOffset
              floatArrayOf(offsetPixels, 0f, width.toFloat(), 0f)
            }
            "rightToLeft" -> {
              val offsetPixels = width * currentStartOffset
              floatArrayOf(width.toFloat(), 0f, offsetPixels, 0f)
            }
            else -> floatArrayOf(0f, 0f, 0f, height.toFloat())
          }

          LinearGradient(
            x0, y0, x1, y1,
            intArrayOf(Color.TRANSPARENT, Color.WHITE),
            floatArrayOf(0f, 1f),
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

  override fun dispatchDraw(canvas: Canvas) {
    if (width <= 0 || height <= 0) {
      super.dispatchDraw(canvas)
      return
    }

    // Use a layer to apply the gradient mask
    val saveCount = canvas.saveLayer(0f, 0f, width.toFloat(), height.toFloat(), null)

    // Draw the blur view
    super.dispatchDraw(canvas)

    // Apply gradient mask using DST_IN to make the blur gradually transparent
    gradientPaint.xfermode = PorterDuffXfermode(PorterDuff.Mode.DST_IN)
    canvas.drawRect(0f, 0f, width.toFloat(), height.toFloat(), gradientPaint)
    gradientPaint.xfermode = null

    canvas.restoreToCount(saveCount)
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
    hasExplicitBackground = false
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
    var radius = mapBlurAmountToRadius(amount)
    if (currentDirection == "center") {
      // Center direction tends to look stronger; scale it down for parity with iOS
      radius *= 0.35f
    }
    currentBlurRadius = radius
    logDebug("setBlurAmount: $amount -> $currentBlurRadius (direction=$currentDirection)")

    try {
      blurView?.setBlurRadius(currentBlurRadius)
      invalidate()
    } catch (e: Exception) {
      logError("Failed to set blur radius: ${e.message}", e)
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
