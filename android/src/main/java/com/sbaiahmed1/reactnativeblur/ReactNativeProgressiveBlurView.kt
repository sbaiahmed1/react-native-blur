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
import android.widget.FrameLayout
import com.qmdeve.blurview.widget.BlurView
import androidx.core.graphics.toColorInt

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

  companion object {
    private const val TAG = "ReactNativeProgressiveBlur"
    private const val MAX_BLUR_RADIUS = 25f
    private const val DEFAULT_BLUR_RADIUS = 10f
    private const val DEBUG = true

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
    initializeProgressiveBlur()
  }

  constructor(context: Context, attrs: AttributeSet?) : super(context, attrs) {
    initializeProgressiveBlur()
  }

  /**
   * Initialize the progressive blur view with blur + gradient approach.
   */
  private fun initializeProgressiveBlur() {
    try {
      // Create and add the blur view as a child
      blurView = BlurView(context, null).apply {
        layoutParams = LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT)
        setBlurRadius(currentBlurRadius)
        setOverlayColor(currentOverlayColor)
        setBackgroundColor(Color.TRANSPARENT)
      }
      addView(blurView)

      // Set up the gradient paint
      gradientPaint.style = Paint.Style.FILL
      setWillNotDraw(false) // Enable onDraw for gradient overlay
      
      // Set transparent background for the container
      super.setBackgroundColor(Color.TRANSPARENT)

      logDebug("Initialized progressive blur with blur + gradient approach")
      updateGradient()

    } catch (e: Exception) {
      logError("Failed to initialize progressive blur view: ${e.message}", e)
    }
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
      val (x0, y0, x1, y1) = when (currentDirection) {
        "bottomToTop" -> {
          // Blur at bottom, clear at top
          val offsetPixels = height * currentStartOffset
          floatArrayOf(0f, height.toFloat(), 0f, offsetPixels)
        }
        "topToBottom" -> {
          // Blur at top, clear at bottom (default)
          val offsetPixels = height * currentStartOffset
          floatArrayOf(0f, offsetPixels, 0f, height.toFloat())
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

      // Create gradient: fully transparent -> fully opaque
      // This masks the blur: opaque = blur visible, transparent = blur hidden (clear)
      val gradient = LinearGradient(
        x0, y0, x1, y1,
        intArrayOf(Color.TRANSPARENT, Color.WHITE),
        floatArrayOf(0f, 1f),
        Shader.TileMode.CLAMP
      )
      
      gradientPaint.shader = gradient
      
      logDebug("Updated gradient: direction=$currentDirection, start=($x0,$y0), end=($x1,$y1), offset=$currentStartOffset")
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
   * Override setBackgroundColor to handle background preservation.
   */
  override fun setBackgroundColor(color: Int) {
    logDebug("setBackgroundColor called: $color")
    
    if (color != Color.TRANSPARENT) {
      hasExplicitBackground = true
      logDebug("Stored explicit background color: $color")
    }

    if (hasExplicitBackground && color != Color.TRANSPARENT) {
      logDebug("Applying background color: $color")
      super.setBackgroundColor(color)
    } else {
      logDebug("Keeping transparent background for blur effect")
      super.setBackgroundColor(Color.TRANSPARENT)
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
   */
  fun cleanup() {
    hasExplicitBackground = false
    removeCallbacks(null)
    blurView = null
    logDebug("View cleaned up")
  }

  /**
   * Set the blur amount with cross-platform mapping.
   * @param amount The blur amount value (0-100), will be mapped to Android's 0-25 radius range
   */
  fun setBlurAmount(amount: Float) {
    currentBlurRadius = mapBlurAmountToRadius(amount)
    logDebug("setBlurAmount: $amount -> $currentBlurRadius")

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
      "blurredlefttoclearright", "lefttoright", "left" -> "leftToRight"
      "blurredrightoclearleft", "righttoleft", "right" -> "rightToLeft"
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

  /**
   * Set the fallback color for reduced transparency accessibility mode.
   * @param color The color string in hex format (e.g., "#FF0000") or null to clear
   */
  fun setReducedTransparencyFallbackColor(color: String?) {
    if (color.isNullOrBlank()) {
      logDebug("Cleared reduced transparency fallback color")
      return
    }
    
    try {
      val fallbackColor = color.toColorInt()
      logDebug("setReducedTransparencyFallbackColor: $color -> ${Integer.toHexString(fallbackColor)}")
      // Android doesn't have a direct equivalent to iOS's "Reduce Transparency" setting
    } catch (e: IllegalArgumentException) {
      logWarning("Invalid color format for reduced transparency fallback: $color - ${e.message}")
    } catch (e: Exception) {
      logError("Error parsing reduced transparency fallback color: $color", e)
    }
  }
}
