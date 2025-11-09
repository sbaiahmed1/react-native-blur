package com.sbaiahmed1.reactnativeblur

import android.content.Context
import android.graphics.Color
import android.util.AttributeSet
import android.util.Log
import com.qmdeve.blurview.widget.ProgressiveBlurView
import androidx.core.graphics.toColorInt

/**
 * Android implementation of React Native ProgressiveBlurView component.
 * Provides progressive/gradient blur effects using the QmBlurView library's ProgressiveBlurView.
 *
 * ProgressiveBlurView creates a gradient blur effect that transitions from blurred to clear,
 * similar to iOS's variable blur using Core Animation filters.
 */
class ReactNativeProgressiveBlurView : ProgressiveBlurView {
  private var currentBlurRadius = DEFAULT_BLUR_RADIUS
  private var currentOverlayColor = Color.TRANSPARENT
  private var currentDirection = "topToBottom"
  private var hasExplicitBackground: Boolean = false

  companion object {
    private const val TAG = "ReactNativeProgressiveBlur"
    // QmBlurView's practical maximum blur radius is 25
    private const val MAX_BLUR_RADIUS = 25f
    private const val DEFAULT_BLUR_RADIUS = 10f
    private const val DEBUG = true // Set to true for debug builds

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
      if (amount.isNaN() || amount.isInfinite()) {
        logWarning("Invalid blur amount: $amount, using default")
        return DEFAULT_BLUR_RADIUS
      }
      val clampedAmount = amount.coerceIn(MIN_BLUR_AMOUNT, MAX_BLUR_AMOUNT)
      return (clampedAmount / MAX_BLUR_AMOUNT) * MAX_BLUR_RADIUS
    }
  }

  constructor(context: Context?) : super(context, null) {
    initializeProgressiveBlur()
  }

  constructor(context: Context?, attrs: AttributeSet?) : super(context, attrs) {
    initializeProgressiveBlur()
  }

  /**
   * Initialize the progressive blur view with default settings.
   * Uses reflection to work around QmBlurView library limitations.
   */
  private fun initializeProgressiveBlur() {
    try {
      // CRITICAL FINDINGS from decompiled source:
      // 1. setOverlayColor() is a NO-OP (empty method) - must use reflection!
      // 2. setGradientDirection() only accepts values 1-2, rejects 0 and 3
      // 3. Direction constants: BOTTOM_TO_TOP=0, TOP_TO_BOTTOM=1, RIGHT_TO_LEFT=2, LEFT_TO_RIGHT=3
      //
      // We MUST use reflection to set mOverlayColor and mGradientDirection

      val initialRadius = DEFAULT_BLUR_RADIUS
      // Use BOTTOM_TO_TOP (0) to get blur at top (QmBlurView behavior is inverted)
      val initialDirection = 0 // BOTTOM_TO_TOP constant -> produces blur at top (blurredTopClearBottom)
      val initialOverlay = BlurType.REGULAR.overlayColor

      // setBlurRadius works correctly
      super.setBlurRadius(initialRadius)

      // MUST use reflection for these since public setters are broken:
      setFieldViaReflection("mGradientDirection", initialDirection)
      setFieldViaReflection("mOverlayColor", initialOverlay)
      setFieldViaReflection("mBlurRadius", initialRadius) // Double-check

      // Store current values
      currentBlurRadius = initialRadius
      currentOverlayColor = initialOverlay
      currentDirection = "topToBottom"

      logDebug("Initialized: radius=$initialRadius, direction=$initialDirection, overlay=${Integer.toHexString(initialOverlay)}")

      // Trigger initial draw
      invalidate()

    } catch (e: Exception) {
      logError("Failed to initialize progressive blur view: ${e.message}", e)
      // View will still be created but may not render correctly
    }
  }

  /**
   * Set a private field via reflection.
   * REQUIRED because ProgressiveBlurView's setOverlayColor() is a NO-OP
   * and setGradientDirection() rejects valid direction values!
   * 
   * @param fieldName The name of the private field to set
   * @param value The value to assign to the field
   */
  @Synchronized
  private fun setFieldViaReflection(fieldName: String, value: Any) {
    try {
      val field = this.javaClass.superclass?.getDeclaredField(fieldName)
      if (field == null) {
        logError("Field $fieldName not found in superclass")
        return
      }
      field.isAccessible = true
      field.set(this, value)
      logDebug("✓ Set $fieldName = $value via reflection")
    } catch (e: NoSuchFieldException) {
      logError("✗ Field $fieldName does not exist: ${e.message}", e)
    } catch (e: IllegalAccessException) {
      logError("✗ Cannot access field $fieldName: ${e.message}", e)
    } catch (e: Exception) {
      logError("✗ Could not set $fieldName via reflection: ${e.message}", e)
    }
  }

  override fun onAttachedToWindow() {
    super.onAttachedToWindow()
    // Re-apply settings when attached
    post {
      try {
        super.setBlurRadius(currentBlurRadius)
        setFieldViaReflection("mBlurRadius", currentBlurRadius)
        setFieldViaReflection("mGradientDirection", mapDirectionToConstant(currentDirection))
        setFieldViaReflection("mOverlayColor", currentOverlayColor)
        invalidate()
        logDebug("Reapplied settings after attach")
      } catch (e: Exception) {
        logError("Failed to reapply settings: ${e.message}", e)
      }
    }
  }

  override fun onLayout(changed: Boolean, left: Int, top: Int, right: Int, bottom: Int) {
    super.onLayout(changed, left, top, right, bottom)
    logDebug("onLayout: changed=$changed, dimensions=${right-left}x${bottom-top}")

    if (changed && width > 0 && height > 0) {
      // View has dimensions now, force redraw
      post {
        invalidate()
        logDebug("Invalidated after layout")
      }
    }
  }

  override fun onDraw(canvas: android.graphics.Canvas) {
    logDebug("onDraw called! canvas=$canvas, width=$width, height=$height")
    super.onDraw(canvas)
    logDebug("onDraw completed")
  }

  override fun draw(canvas: android.graphics.Canvas) {
    logDebug("draw called! canvas=$canvas")
    super.draw(canvas)
  }

  /**
   * Override setBackgroundColor to handle background preservation.
   * @param color The background color to apply
   */
  override fun setBackgroundColor(color: Int) {
    logDebug("setBackgroundColor called: $color")

    // Store flag if background is explicitly set
    if (color != Color.TRANSPARENT) {
      hasExplicitBackground = true
      logDebug("Stored explicit background color: $color")
    }

    // Apply background color over blur if explicitly set
    if (hasExplicitBackground && color != Color.TRANSPARENT) {
      logDebug("Applying background color over blur: $color")
      super.setBackgroundColor(color)
    } else {
      logDebug("Keeping transparent background for blur effect")
      super.setBackgroundColor(Color.TRANSPARENT)
    }
  }

  /**
   * Called when the view is detached from a window.
   * Performs cleanup to prevent memory leaks.
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
    hasExplicitBackground = false
    removeCallbacks(null)
    logDebug("View cleaned up")
  }

  /**
   * Maps direction string to ProgressiveBlurView direction constant.
   * Based on empirical testing with QmBlurView:
   * - BOTTOM_TO_TOP = 0: Produces blur at TOP, clear at bottom (inverted from name!)
   * - TOP_TO_BOTTOM = 1: Produces blur at BOTTOM, clear at top (inverted from name!)
   * - RIGHT_TO_LEFT = 2
   * - LEFT_TO_RIGHT = 3
   * 
   * CRITICAL: QmBlurView's gradient mask behavior is INVERTED from its constant names!
   * To match iOS behavior, we must swap the mapping.
   * 
   * Note: Only directions 0 and 1 are reliably supported by the library.
   */
  private fun mapDirectionToConstant(direction: String): Int {
    return when (direction.lowercase()) {
      // SWAPPED to match iOS behavior (QmBlurView's constants are inverted)
      "bottomtotop" -> 1 // Want blur at bottom? Use TOP_TO_BOTTOM constant!
      "toptobottom" -> 0 // Want blur at top? Use BOTTOM_TO_TOP constant!
      "lefttoright" -> 3 // DIRECTION_LEFT_TO_RIGHT (may not work correctly)
      "righttoleft" -> 2 // DIRECTION_RIGHT_TO_LEFT (may not work correctly)
      else -> {
        logWarning("Unknown direction constant: $direction, using default TOP_TO_BOTTOM")
        1 // default: DIRECTION_TOP_TO_BOTTOM
      }
    }
  }

  /**
   * Set the blur amount with cross-platform mapping.
   * @param amount The blur amount value (0-100), will be mapped to Android's 0-25 radius range
   */
  fun setBlurAmount(amount: Float) {
    currentBlurRadius = mapBlurAmountToRadius(amount)
    logDebug("setBlurAmount: $amount -> $currentBlurRadius")

    try {
      super.setBlurRadius(currentBlurRadius)
      setFieldViaReflection("mBlurRadius", currentBlurRadius)
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
    // CRITICAL: Map React Native direction strings to QmBlurView constants
    // React Native prop naming: "blurred[POSITION]Clear[POSITION]" - WHERE the blur IS
    // QmBlurView constants: "[FROM]_TO_[TO]" - WHERE the gradient GOES
    //
    // "blurredTopClearBottom" = blur IS at top -> use TOP_TO_BOTTOM (1)
    // "blurredBottomClearTop" = blur IS at bottom -> use BOTTOM_TO_TOP (0)
    currentDirection = when (direction.lowercase()) {
      "blurredbottomcleartop", "bottomtotop", "bottom" -> "bottomToTop"
      "blurredtopclearbottom", "toptobottom", "top" -> "topToBottom"
      else -> {
        logWarning("Unknown direction: $direction, defaulting to topToBottom")
        "topToBottom"
      }
    }
    val directionConstant = mapDirectionToConstant(currentDirection)
    logDebug("setDirection: $direction -> $currentDirection -> constant=$directionConstant")

    try {
      // MUST use reflection - setGradientDirection() rejects values 0 and 3!
      setFieldViaReflection("mGradientDirection", directionConstant)
      invalidate()
    } catch (e: Exception) {
      logError("Failed to set gradient direction: ${e.message}", e)
    }
  }

  /**
   * Set the start offset for the progressive blur.
   * Note: QmBlurView's ProgressiveBlurView doesn't support startOffset natively.
   * This is a no-op for Android compatibility with iOS API.
   * @param offset The offset value (0.0 to 1.0) - ignored on Android
   */
  fun setStartOffset(offset: Float) {
    // QmBlurView's ProgressiveBlurView doesn't have a layers or offset API
    // The gradient is always applied across the full view
    logDebug("setStartOffset: $offset (no-op on Android - ProgressiveBlurView always uses full view)")
  }

  /**
   * Enum representing different blur types with their corresponding overlay colors.
   * Maps iOS blur types to Android overlay colors to approximate the visual appearance.
   */
  enum class BlurType(val overlayColor: Int) {
    XLIGHT(Color.argb(25, 255, 255, 255)),
    LIGHT(Color.argb(40, 255, 255, 255)),
    DARK(Color.argb(60, 0, 0, 0)),
    EXTRA_DARK(Color.argb(80, 0, 0, 0)),
    REGULAR(Color.argb(50, 255, 255, 255)),
    PROMINENT(Color.argb(70, 255, 255, 255)),
    SYSTEM_ULTRA_THIN_MATERIAL(Color.argb(20, 255, 255, 255)),
    SYSTEM_THIN_MATERIAL(Color.argb(35, 255, 255, 255)),
    SYSTEM_MATERIAL(Color.argb(50, 255, 255, 255)),
    SYSTEM_THICK_MATERIAL(Color.argb(65, 255, 255, 255)),
    SYSTEM_CHROME_MATERIAL(Color.argb(45, 240, 240, 240));

    companion object {
      /**
       * Get BlurType from string, with fallback to LIGHT for unknown types.
       */
      fun fromString(type: String): BlurType {
        return when (type.lowercase()) {
          "xlight" -> XLIGHT
          "light" -> LIGHT
          "dark" -> DARK
          "extradark" -> EXTRA_DARK
          "regular" -> REGULAR
          "prominent" -> PROMINENT
          "systemultrathinmaterial" -> SYSTEM_ULTRA_THIN_MATERIAL
          "systemthinmaterial" -> SYSTEM_THIN_MATERIAL
          "systemmaterial" -> SYSTEM_MATERIAL
          "systemthickmaterial" -> SYSTEM_THICK_MATERIAL
          "systemchromematerial" -> SYSTEM_CHROME_MATERIAL
          else -> LIGHT // default fallback
        }
      }
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
      // MUST use reflection - setOverlayColor() is a NO-OP!
      setFieldViaReflection("mOverlayColor", currentOverlayColor)
      invalidate()
    } catch (e: Exception) {
      logError("Failed to set overlay color: ${e.message}", e)
    }
  }

  /**
   * Set the fallback color for reduced transparency accessibility mode.
   * Note: Android doesn't have a direct equivalent to iOS's "Reduce Transparency" setting,
   * so this is stored for future use but not currently applied.
   * 
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
      
      // Store the fallback color but don't apply it unless accessibility settings require it
      // Android doesn't have a direct equivalent to iOS's "Reduce Transparency" setting
      // that we can easily check. The blur effect should remain the primary visual.
      // Future enhancement: Check Android accessibility settings and apply fallback if needed
      
    } catch (e: IllegalArgumentException) {
      logWarning("Invalid color format for reduced transparency fallback: $color - ${e.message}")
    } catch (e: Exception) {
      logError("Error parsing reduced transparency fallback color: $color", e)
    }
  }
}
