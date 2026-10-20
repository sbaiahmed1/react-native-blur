package com.sbaiahmed1.reactnativeblur

import android.content.Context
import android.graphics.Color
import android.graphics.Outline
import android.graphics.Path
import android.os.Build
import android.util.AttributeSet
import android.util.Log
import android.util.TypedValue
import android.view.View
import android.view.ViewGroup
import android.view.ViewOutlineProvider
import android.view.ViewTreeObserver
import com.qmdeve.blurview.widget.BlurViewGroup
import com.qmdeve.blurview.base.BaseBlurViewGroup

import android.view.View.MeasureSpec

/**
 * Android implementation of React Native BlurView component.
 * Provides cross-platform blur effects using the QmBlurView library.
 *
 * QmBlurView is a high-performance blur library that uses native blur algorithms
 * implemented with underlying Native calls for optimal performance.
 *
 * Uses reflection to redirect the blur capture root from the activity decor view
 * to the nearest react-native-screens Screen ancestor, preventing flickering and
 * wrong frame capture during navigation transitions.
 */
class ReactNativeBlurView : BlurViewGroup {
  private var currentBlurRadius = DEFAULT_BLUR_RADIUS
  private var currentOverlayColor = Color.TRANSPARENT
  private var currentBlurRounds = DEFAULT_BLUR_ROUNDS
  private var borderRadius = 0f
  private var borderTopLeftRadius = -1f
  private var borderTopRightRadius = -1f
  private var borderBottomLeftRadius = -1f
  private var borderBottomRightRadius = -1f
  private var glassTintColor: Int = Color.TRANSPARENT
  private var glassOpacity: Float = 1.0f
  private var viewType: String = "blur"
  private var glassType: String = "clear"
  private var currentBlurType: String = "xlight"
  private var isBlurInitialized: Boolean = false
  private var initRunnable: Runnable? = null
  // Guarded wrapper around QmBlurView's pre-draw listener, registered on the
  // swapped capture root (see swapBlurRootToScreenAncestor). Tracked so
  // cleanup() can unregister it: QmBlurView only knows the original listener.
  private var capturePreDrawListener: ViewTreeObserver.OnPreDrawListener? = null
  private var captureRoot: View? = null
  private var captureSettleFramesLeft = 0

  companion object {
    private const val TAG = "ReactNativeBlurView"
    private const val MAX_BLUR_RADIUS = 100f
    private const val DEFAULT_BLUR_RADIUS = 10f
    // Number of native box-blur passes. Each round is a full pass over the
    // downsampled capture bitmap, so it is a direct CPU cost multiplier. Kept
    // at 5 to match the JS wrapper and codegen default (one source of truth):
    // the wrapper always sends blurRounds, so a lower internal default was
    // never reachable. Fewer passes trade a little quality for less blur work
    // if a consumer lowers the prop explicitly.
    private const val DEFAULT_BLUR_ROUNDS = 5
    // Capture/blur bitmap is scaled down by this factor before the root is
    // drawn into it. A higher factor shrinks the raster area quadratically,
    // reducing both the software capture cost and the blur cost.
    private const val DEFAULT_DOWNSAMPLE_FACTOR = 8.0f
    private const val DEBUG = false
    // Pre-draws to keep skipping the backdrop capture after the last legacy
    // view animation in the capture root is gone. The frame that clears an
    // animation leaves the view's RenderNode alpha at its last animated value
    // and relies on the NEXT hardware draw to reset it to 1; a software
    // capture running first in that frame consumes the reset (see
    // swapBlurRootToScreenAncestor). One frame is enough, the second is margin.
    private const val ANIMATION_SETTLE_FRAMES = 2

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

    private fun mapBlurAmountToRadius(amount: Float): Float {
      val clampedAmount = amount.coerceIn(MIN_BLUR_AMOUNT, MAX_BLUR_AMOUNT)
      return (clampedAmount / MAX_BLUR_AMOUNT) * MAX_BLUR_RADIUS
    }
  }

  constructor(context: Context?) : super(context, null) {
    setupView()
  }

  constructor(context: Context?, attrs: AttributeSet?) : super(context, attrs) {
    setupView()
  }

  private fun setupView() {
    super.setBackgroundColor(currentOverlayColor)
    clipChildren = true
    clipToOutline = true
    blurRounds = currentBlurRounds
    super.setDownsampleFactor(DEFAULT_DOWNSAMPLE_FACTOR)
  }

  override fun onAttachedToWindow() {
    super.onAttachedToWindow()

    if (isBlurInitialized) return

    // Defer the root swap and blur init to the next frame rather than running
    // them synchronously here. On a re-attach during navigation (react-native
    // -screens detaches inactive screens), the parent chain up to the Screen
    // ancestor and the QmBlurView library's own decor-view registration are
    // not always settled at onAttachedToWindow time, so a synchronous swap
    // could miss the Screen root and fall back to whole-screen blur. Posting
    // lets both settle first, matching ReactNativeProgressiveBlurView. The
    // runnable is tracked so cleanup() can cancel it if the view detaches
    // again before it runs.
    val runnable = Runnable {
      initRunnable = null
      swapBlurRootToScreenAncestor()
      initializeBlur()
    }
    initRunnable = runnable
    post(runnable)
  }

  private fun swapBlurRootToScreenAncestor() {
    val newRoot = findOptimalBlurRoot() ?: return

    try {
      val blurViewGroupClass = BlurViewGroup::class.java
      val baseField = blurViewGroupClass.getDeclaredField("mBaseBlurViewGroup")
      baseField.isAccessible = true
      val baseBlurViewGroup = baseField.get(this) ?: return

      val baseClass = BaseBlurViewGroup::class.java

      val decorViewField = baseClass.getDeclaredField("mDecorView")
      decorViewField.isAccessible = true
      val oldDecorView = decorViewField.get(baseBlurViewGroup) as? View

      val preDrawListenerField = baseClass.getDeclaredField("preDrawListener")
      preDrawListenerField.isAccessible = true
      val preDrawListener = preDrawListenerField.get(baseBlurViewGroup) as? ViewTreeObserver.OnPreDrawListener

      if (oldDecorView == null) {
        logWarning("swapBlurRootToScreenAncestor: oldDecorView is null, skipping swap – falling back to decor view")
      }
      if (preDrawListener == null) {
        logWarning("swapBlurRootToScreenAncestor: preDrawListener is null, skipping swap – falling back to decor view")
      }

      if (preDrawListener != null && oldDecorView != null) {
        try {
          oldDecorView.viewTreeObserver.removeOnPreDrawListener(preDrawListener)
        } catch (e: Exception) {
          logDebug("Could not remove old pre-draw listener: ${e.message}")
        }

        decorViewField.set(baseBlurViewGroup, newRoot)

        newRoot.viewTreeObserver.addOnPreDrawListener(preDrawListener)
        // QmBlurView's listener rasterizes the capture root into a software
        // canvas on every pre-draw. That software pass runs before the frame's
        // hardware draw, with a stale drawing time, and evaluates any legacy
        // view Animation in the subtree (react-native-screens' stack
        // transitions). It starts the animation with a stale start time and
        // consumes its alpha/end bookkeeping off the hardware path, so the
        // pushed screen's RenderNode is left at ~0 alpha and the screen stays
        // blank until reload (react-native-blur#167). Skip the capture while
        // such an animation is attached, plus a few settle frames after it is
        // cleared, and keep showing the last blurred frame meanwhile.
        val guardedListener = ViewTreeObserver.OnPreDrawListener {
          if (hasPendingViewAnimation(newRoot)) {
            captureSettleFramesLeft = ANIMATION_SETTLE_FRAMES
            // Keep frames coming so the capture resumes once the animation
            // is cleared, even if nothing else invalidates.
            postInvalidateOnAnimation()
            true
          } else if (captureSettleFramesLeft > 0) {
            captureSettleFramesLeft--
            postInvalidateOnAnimation()
            true
          } else {
            preDrawListener.onPreDraw()
          }
        }
        newRoot.viewTreeObserver.addOnPreDrawListener(guardedListener)
        capturePreDrawListener = guardedListener
        captureRoot = newRoot

        val differentRootField = baseClass.getDeclaredField("mDifferentRoot")
        differentRootField.isAccessible = true
        differentRootField.setBoolean(baseBlurViewGroup, newRoot.rootView != this.rootView)

        val forceRedrawField = baseClass.getDeclaredField("mForceRedraw")
        forceRedrawField.isAccessible = true
        forceRedrawField.setBoolean(baseBlurViewGroup, true)

        logDebug("Swapped blur root to: ${newRoot.javaClass.simpleName} (was: ${oldDecorView.javaClass.simpleName})")
      }
    } catch (e: NoSuchFieldException) {
      logWarning("Reflection failed - QmBlurView field not found: ${e.message}. Falling back to decor view.")
    } catch (e: Exception) {
      logWarning("Failed to swap blur root: ${e.message}. Falling back to decor view.")
    }
  }

  /**
   * True if [view] or any descendant has a legacy view Animation attached that
   * a draw would still evaluate, including one started but not drawn yet.
   * hasEnded() alone is not enough: AndroidX Fragment's
   * EndViewTransitionAnimation reports ended but stays attached, returning
   * "more" with a stale transformation until the fragment transition ends.
   * Only an ended fillAfter animation, held on purpose, is ignored so it
   * cannot freeze the backdrop forever. The walk is cheap next to the full
   * software draw of the same tree that it guards.
   */
  private fun hasPendingViewAnimation(view: View): Boolean {
    val animation = view.animation
    if (animation != null && !(animation.hasEnded() && animation.fillAfter)) return true
    if (view is ViewGroup) {
      for (i in 0 until view.childCount) {
        if (hasPendingViewAnimation(view.getChildAt(i))) return true
      }
    }
    return false
  }

  private fun findOptimalBlurRoot(): ViewGroup? {
    return findNearestScreenAncestor() ?: findNearestReactRootView()
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

  private fun initializeBlur() {
    if (isBlurInitialized) return

    try {
      super.setBlurRadius(currentBlurRadius)
      super.setOverlayColor(currentOverlayColor)
      updateCornerRadius()
      isBlurInitialized = true

      logDebug("QmBlurView initialized with blurRadius: $currentBlurRadius, overlayColor: $currentOverlayColor")
    } catch (e: Exception) {
      logError("Failed to initialize blur view: ${e.message}", e)
    }
  }

  override fun onDetachedFromWindow() {
    super.onDetachedFromWindow()
    cleanup()
  }

  fun cleanup() {
    isBlurInitialized = false
    initRunnable?.let { removeCallbacks(it) }
    initRunnable = null
    capturePreDrawListener?.let { listener ->
      try {
        captureRoot?.viewTreeObserver?.removeOnPreDrawListener(listener)
      } catch (e: Exception) {
        logDebug("Could not remove guarded pre-draw listener: ${e.message}")
      }
    }
    capturePreDrawListener = null
    captureRoot = null
    captureSettleFramesLeft = 0
    logDebug("View cleaned up")
  }

  fun setBlurAmount(amount: Float) {
    currentBlurRadius = mapBlurAmountToRadius(amount)
    logDebug("setBlurAmount: $amount -> $currentBlurRadius")

    try {
      super.setBlurRadius(currentBlurRadius)
    } catch (e: Exception) {
      logError("Failed to set blur radius: ${e.message}", e)
    }
  }

  fun setRounds(rounds: Int) {
    val blurRounds = rounds.coerceIn(1, 15)
    currentBlurRounds = blurRounds
    logDebug("setRounds: $rounds -> $blurRounds")

    try {
      super.setBlurRounds(blurRounds)
    } catch (e: Exception) {
      logError("Failed to set blur rounds: ${e.message}", e)
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
    logDebug("setBlurType: $type -> ${blurType.name}")

    try {
      super.setBackgroundColor(currentOverlayColor)
      super.setOverlayColor(currentOverlayColor)
    } catch (e: Exception) {
      logError("Failed to set overlay color: ${e.message}", e)
    }
  }

  /**
   * Set the glass tint color for liquid glass effect.
   * @param color React Native color int, or null to clear
   */
  fun setGlassTintColor(color: Int?) {
    glassTintColor = color ?: Color.TRANSPARENT
    logDebug("setGlassTintColor: $glassTintColor")
    updateGlassEffect()
  }

  fun setGlassOpacity(opacity: Float) {
    glassOpacity = opacity.coerceIn(0.0f, 1.0f)
    logDebug("setGlassOpacity: $opacity")
    updateGlassEffect()
  }

  fun setType(type: String) {
    viewType = type
    logDebug("setType: $type")
    updateViewType()
  }

  fun setIsInteractive(isInteractive: Boolean) {
    logDebug("setType: $isInteractive")
  }

  fun setGlassType(type: String) {
    glassType = type
    logDebug("setGlassType: $type")
    updateGlassEffect()
  }

  private fun updateGlassEffect() {
    if (viewType == "liquidGlass") {
      try {
        val glassColor = Color.argb(
          (glassOpacity * 255).toInt(),
          Color.red(glassTintColor),
          Color.green(glassTintColor),
          Color.blue(glassTintColor)
        )
        super.setOverlayColor(glassColor)
        logDebug("Applied glass effect: color=$glassColor, opacity=$glassOpacity")
      } catch (e: Exception) {
        logError("Failed to update glass effect: ${e.message}", e)
      }
    }
  }

  private fun updateViewType() {
    when (viewType) {
      "liquidGlass" -> {
        updateGlassEffect()
      }
      "blur" -> {
        try {
          super.setBackgroundColor(currentOverlayColor)
          super.setOverlayColor(currentOverlayColor)
        } catch (e: Exception) {
          logError("Failed to restore blur overlay: ${e.message}", e)
        }
      }
    }
  }

  fun setBorderRadius(radius: Float) {
    borderRadius = radius
    logDebug("setBorderRadius: $radius dp")
    updateCornerRadius()
  }

  fun setBorderTopLeftRadius(radius: Float) {
    borderTopLeftRadius = radius
    logDebug("setBorderTopLeftRadius: $radius dp")
    updateCornerRadius()
  }

  fun setBorderTopRightRadius(radius: Float) {
    borderTopRightRadius = radius
    logDebug("setBorderTopRightRadius: $radius dp")
    updateCornerRadius()
  }

  fun setBorderBottomLeftRadius(radius: Float) {
    borderBottomLeftRadius = radius
    logDebug("setBorderBottomLeftRadius: $radius dp")
    updateCornerRadius()
  }

  fun setBorderBottomRightRadius(radius: Float) {
    borderBottomRightRadius = radius
    logDebug("setBorderBottomRightRadius: $radius dp")
    updateCornerRadius()
  }

  private fun convertDpToPx(dp: Float): Float {
    val displayMetrics = context.resources.displayMetrics
    return TypedValue.applyDimension(TypedValue.COMPLEX_UNIT_DIP, dp, displayMetrics)
  }

  private fun updateCornerRadius() {
    try {
      // Unset per-corner radii use the sentinel -1f (see the field defaults), so
      // test >= 0: an explicit 0 must override the base radius to square that
      // corner, only a negative sentinel falls back to baseRadius.
      val baseRadius = convertDpToPx(borderRadius)
      val topLeft = if (borderTopLeftRadius >= 0) convertDpToPx(borderTopLeftRadius) else baseRadius
      val topRight = if (borderTopRightRadius >= 0) convertDpToPx(borderTopRightRadius) else baseRadius
      val bottomLeft = if (borderBottomLeftRadius >= 0) convertDpToPx(borderBottomLeftRadius) else baseRadius
      val bottomRight = if (borderBottomRightRadius >= 0) convertDpToPx(borderBottomRightRadius) else baseRadius

      // QmBlurView's uniform setter resets all four individual radii.
      super.setCornerRadius(baseRadius)
      super.setTopLeftCornerRadius(topLeft)
      super.setTopRightCornerRadius(topRight)
      super.setBottomLeftCornerRadius(bottomLeft)
      super.setBottomRightCornerRadius(bottomRight)

      val isUniform = topLeft == topRight && topRight == bottomLeft && bottomLeft == bottomRight

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
      logDebug("Updated corner radius: topLeft=$topLeft, topRight=$topRight, bottomLeft=$bottomLeft, bottomRight=$bottomRight (px)")
    } catch (e: Exception) {
      logError("Failed to update corner radius: ${e.message}", e)
    }
  }

  override fun generateDefaultLayoutParams(): BlurViewGroup.LayoutParams {
    return BlurViewGroup.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT)
  }

  override fun generateLayoutParams(attrs: AttributeSet?): BlurViewGroup.LayoutParams {
    return BlurViewGroup.LayoutParams(context, attrs)
  }

  override fun generateLayoutParams(p: ViewGroup.LayoutParams?): ViewGroup.LayoutParams {
    return ViewGroup.MarginLayoutParams(p)
  }

  override fun checkLayoutParams(p: ViewGroup.LayoutParams?): Boolean {
    return p is ViewGroup.MarginLayoutParams
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
