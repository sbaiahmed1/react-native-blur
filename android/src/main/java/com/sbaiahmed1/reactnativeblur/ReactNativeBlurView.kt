package com.sbaiahmed1.reactnativeblur

import android.content.Context
import android.graphics.Color
import android.graphics.Outline
import android.util.AttributeSet
import android.util.Log
import android.util.TypedValue
import android.view.View
import android.view.ViewGroup
import android.view.ViewOutlineProvider
import android.view.ViewTreeObserver
import com.qmdeve.blurview.widget.BlurViewGroup
import com.qmdeve.blurview.base.BaseBlurViewGroup
import androidx.core.graphics.toColorInt

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
  private var currentCornerRadius = 0f
  private var glassTintColor: Int = Color.TRANSPARENT
  private var glassOpacity: Float = 1.0f
  private var viewType: String = "blur"
  private var glassType: String = "clear"
  private var isBlurInitialized: Boolean = false
  private var initRunnable: Runnable? = null

  companion object {
    private const val TAG = "ReactNativeBlurView"
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
     * This ensures cross-platform consistency while respecting Android's limitations.
     * @param amount The blur amount from 0-100
     * @return The corresponding blur radius from 0-25
     */
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

  /**
   * Initial view setup in constructor - only sets up visual defaults.
   * Blur initialization is deferred to onAttachedToWindow to ensure the
   * view hierarchy is fully mounted, preventing flickering and wrong frame capture.
   */
  private fun setupView() {
    super.setBackgroundColor(currentOverlayColor)
    clipChildren = true
    clipToOutline = true
    super.setDownsampleFactor(6.0F)
  }

  /**
   * Called when the view is attached to a window.
   * After QmBlurView's onAttachedToWindow sets the decor view as blur root,
   * we use reflection to redirect it to the nearest Screen ancestor.
   * This scopes the blur capture to just the current screen, preventing
   * navigation transition artifacts.
   */
  override fun onAttachedToWindow() {
    super.onAttachedToWindow()

    if (isBlurInitialized) return

    // Defer the blur root swap to next frame so the view tree is fully mounted
    val runnable = Runnable {
      initRunnable = null
      if (isBlurInitialized) return@Runnable
      swapBlurRootToScreenAncestor()
      initializeBlur()
    }
    initRunnable = runnable
    post(runnable)
  }

  /**
   * Uses reflection to redirect QmBlurView's internal blur capture root
   * from the activity decor view to the nearest react-native-screens Screen ancestor.
   *
   * Reflection path: BlurViewGroup.mBaseBlurViewGroup -> BaseBlurViewGroup.mDecorView
   * Also moves the OnPreDrawListener from the old root to the new one.
   */
  private fun swapBlurRootToScreenAncestor() {
    // Pinned to QmBlurView 1.1.4 – depends on: mBaseBlurViewGroup, mDecorView, preDrawListener, mDifferentRoot, mForceRedraw
    val newRoot = findOptimalBlurRoot() ?: return

    try {
      // Step 1: Get BlurViewGroup's private mBaseBlurViewGroup field
      val blurViewGroupClass = BlurViewGroup::class.java
      val baseField = blurViewGroupClass.getDeclaredField("mBaseBlurViewGroup")
      baseField.isAccessible = true
      val baseBlurViewGroup = baseField.get(this) ?: return

      // Step 2: Get BaseBlurViewGroup's private fields
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
        // Step 3: Remove listener from old root's ViewTreeObserver
        try {
          oldDecorView.viewTreeObserver.removeOnPreDrawListener(preDrawListener)
        } catch (e: Exception) {
          logDebug("Could not remove old pre-draw listener: ${e.message}")
        }

        // Step 4: Set new root as mDecorView
        decorViewField.set(baseBlurViewGroup, newRoot)

        // Step 5: Add listener to new root's ViewTreeObserver
        newRoot.viewTreeObserver.addOnPreDrawListener(preDrawListener)

        // Step 6: Update mDifferentRoot flag
        val differentRootField = baseClass.getDeclaredField("mDifferentRoot")
        differentRootField.isAccessible = true
        differentRootField.setBoolean(baseBlurViewGroup, newRoot.rootView != this.rootView)

        // Step 7: Force a redraw
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
   * Walks up the view hierarchy looking for react-native-screens Screen components
   * using class name detection to avoid hard dependencies on react-native-screens.
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
   * Initialize the blur view with current settings.
   * Called after the view is attached and the blur root has been swapped.
   * Guarded by isBlurInitialized to prevent duplicate setup.
   */
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

  /**
   * Called when the view is detached from a window.
   * Performs cleanup to prevent memory leaks and resets initialization state
   * so blur is re-initialized on next attach (e.g. navigation transitions).
   */
  override fun onDetachedFromWindow() {
    super.onDetachedFromWindow()
    cleanup()
  }

  /**
   * Cleanup method to reset state.
   * Helps prevent memory leaks and ensures clean state.
   */
  fun cleanup() {
    isBlurInitialized = false
    initRunnable?.let { removeCallbacks(it) }
    initRunnable = null
    logDebug("View cleaned up")
  }

  /**
   * Set the blur amount with cross-platform mapping.
   * @param amount The blur amount value (0-100), will be mapped to Android's 0-25 radius range
   */
  fun setBlurAmount(amount: Float) {
    currentBlurRadius = mapBlurAmountToRadius(amount)
    logDebug("setBlurAmount: $amount -> $currentBlurRadius (mapped from 0-100 to 0-25 range)")

    try {
      super.setBlurRadius(currentBlurRadius)
    } catch (e: Exception) {
      logError("Failed to set blur radius: ${e.message}", e)
    }
  }

  /**
   * Set the blur type which determines the overlay color.
   * @param type The blur type string (case-insensitive)
   */
  fun setBlurType(type: String) {
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
   * @param color The color string in hex format (e.g., "#FF0000") or null to clear
   */
  fun setGlassTintColor(color: String?) {
    color?.let {
      try {
        glassTintColor = it.toColorInt()
        logDebug("setGlassTintColor: $color -> $glassTintColor")
        updateGlassEffect()
      } catch (e: Exception) {
        logWarning("Invalid color format for glass tint: $color")
        glassTintColor = Color.TRANSPARENT
      }
    } ?: run {
      glassTintColor = Color.TRANSPARENT
      logDebug("Cleared glass tint color")
      updateGlassEffect()
    }
  }

  /**
   * Set the glass opacity for liquid glass effect.
   * @param opacity The opacity value (0.0 to 1.0)
   */
  fun setGlassOpacity(opacity: Float) {
    glassOpacity = opacity.coerceIn(0.0f, 1.0f)
    logDebug("setGlassOpacity: $opacity")
    updateGlassEffect()
  }

  /**
   * Set the view type (blur or liquidGlass).
   * @param type The view type string
   */
  fun setType(type: String) {
    viewType = type
    logDebug("setType: $type")
    updateViewType()
  }

    /**
   * Set the view type (blur or liquidGlass).
   * @param isInteractive The view type string
   */
  fun setIsInteractive(isInteractive: Boolean) {
    logDebug("setType: $isInteractive")
  }

  /**
   * Set the glass type for liquid glass effect.
   * @param type The glass type string
   */
  fun setGlassType(type: String) {
    glassType = type
    logDebug("setGlassType: $type")
    updateGlassEffect()
  }

  /**
   * Update the glass effect based on current glass properties.
   */
  private fun updateGlassEffect() {
    if (viewType == "liquidGlass") {
      try {
        // Apply glass tint with opacity
        val glassColor = Color.argb(
          (glassOpacity * 255).toInt(),
          Color.red(glassTintColor),
          Color.green(glassTintColor),
          Color.blue(glassTintColor)
        )
        // Use QmBlurView's setOverlayColor method
        super.setOverlayColor(glassColor)
        logDebug("Applied glass effect: color=$glassColor, opacity=$glassOpacity")
      } catch (e: Exception) {
        logError("Failed to update glass effect: ${e.message}", e)
      }
    }
  }

  /**
   * Update the view type and apply appropriate effects.
   */
  private fun updateViewType() {
    when (viewType) {
      "liquidGlass" -> {
        updateGlassEffect()
      }
      "blur" -> {
        // Restore original blur overlay color
        try {
          super.setBackgroundColor(currentOverlayColor)
          super.setOverlayColor(currentOverlayColor)
        } catch (e: Exception) {
          logError("Failed to restore blur overlay: ${e.message}", e)
        }
      }
    }
  }

  /**
   * Set the border radius from React Native StyleSheet.
   * React Native provides values in logical pixels (dp), which we convert for the native view.
   * @param radius The border radius value in dp
   */
  fun setBorderRadius(radius: Float) {
    currentCornerRadius = radius
    logDebug("setBorderRadius: $radius dp")
    updateCornerRadius()
  }

  /**
   * Convert pixels to density-independent pixels and update the corner radius.
   * QmBlurView's setCornerRadius expects values in pixels, and React Native already
   * provides values in dp, so we need to convert from dp to pixels.
   */
  private fun updateCornerRadius() {
    try {
      // Convert from dp (React Native) to pixels (Android)
      val radiusInPixels = TypedValue.applyDimension(
        TypedValue.COMPLEX_UNIT_DIP,
        currentCornerRadius,
        context.resources.displayMetrics
      )

      outlineProvider = object : ViewOutlineProvider() {
        override fun getOutline(view: View, outline: Outline?) {
          outline?.setRoundRect(0, 0, view.width, view.height, radiusInPixels)
        }
      }
      clipToOutline = true

      super.setCornerRadius(radiusInPixels)
      logDebug("Updated corner radius: ${currentCornerRadius}dp -> ${radiusInPixels}px")
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
    // We override this to prevent the superclass (BlurViewGroup/FrameLayout) from
    // re-positioning children based on its own logic (e.g. gravity), which would
    // conflict with React Native's layout.
  }
}
