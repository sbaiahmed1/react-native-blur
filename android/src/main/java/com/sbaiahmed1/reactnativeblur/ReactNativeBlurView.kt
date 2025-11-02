package com.sbaiahmed1.reactnativeblur

import android.content.Context
import android.graphics.Color
import android.util.AttributeSet
import android.util.Log
import com.qmdeve.blurview.widget.BlurView
import androidx.core.graphics.toColorInt

/**
 * Android implementation of React Native BlurView component.
 * Provides cross-platform blur effects using the QmBlurView library.
 *
 * QmBlurView is a high-performance blur library that uses native blur algorithms
 * implemented with underlying Native calls for optimal performance.
 */
class ReactNativeBlurView : BlurView {
  private var currentBlurRadius = DEFAULT_BLUR_RADIUS
  private var currentOverlayColor = Color.TRANSPARENT
  private var currentCornerRadius = 0f
  private var originalBackgroundColor: Int? = null
  private var hasExplicitBackground: Boolean = false
  private var glassTintColor: Int = Color.TRANSPARENT
  private var glassOpacity: Float = 1.0f
  private var viewType: String = "blur"
  private var glassType: String = "clear"

  companion object {
    private const val TAG = "ReactNativeBlurView"
    private const val MAX_BLUR_RADIUS = 25f
    private const val DEFAULT_BLUR_RADIUS = 10f
    private const val DEBUG = false // Set to true for debug builds

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
    initializeBlur()
  }

  constructor(context: Context?, attrs: AttributeSet?) : super(context, attrs) {
    initializeBlur()
  }

  /**
   * Initialize the blur view with default settings.
   * QmBlurView automatically handles blur rendering without needing setupWith() calls.
   */
  private fun initializeBlur() {
    try {
      // Set initial blur properties using QmBlurView's API
      // setBlurRadius takes Float, setOverlayColor takes Int, setCornerRadius takes Float (in dp)
      super.setBlurRadius(currentBlurRadius)
      super.setOverlayColor(currentOverlayColor)
      super.setCornerRadius(currentCornerRadius)

      // Set transparent background to prevent visual artifacts
      super.setBackgroundColor(Color.TRANSPARENT)

      logDebug("QmBlurView initialized with blurRadius: $currentBlurRadius, overlayColor: $currentOverlayColor")
    } catch (e: Exception) {
      logError("Failed to initialize blur view: ${e.message}", e)
    }
  }

  /**
   * Override setBackgroundColor to handle background preservation.
   * @param color The background color to apply
   */
  override fun setBackgroundColor(color: Int) {
    logDebug("setBackgroundColor called: $color")

    // Store the original background color if it's not transparent
    if (color != Color.TRANSPARENT) {
      originalBackgroundColor = color
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
    originalBackgroundColor = null
    removeCallbacks(null)
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
      // QmBlurView uses setBlurRadius() to set blur intensity
      super.setBlurRadius(currentBlurRadius)
    } catch (e: Exception) {
      logError("Failed to set blur radius: ${e.message}", e)
    }
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
    logDebug("setBlurType: $type -> ${blurType.name}")

    try {
      // QmBlurView uses setOverlayColor() to set the tint/overlay color
      super.setOverlayColor(currentOverlayColor)
    } catch (e: Exception) {
      logError("Failed to set overlay color: ${e.message}", e)
    }
  }

  /**
   * Set the fallback color for reduced transparency accessibility mode.
   * @param color The color string in hex format (e.g., "#FF0000") or null to clear
   */
  fun setReducedTransparencyFallbackColor(color: String?) {
    color?.let {
      try {
        val fallbackColor = it.toColorInt()
        logDebug("setReducedTransparencyFallbackColor: $color -> $fallbackColor (stored but not applied unless accessibility requires it)")

        // Store the fallback color but don't apply it unless accessibility settings require it
        // For now, we'll just log it since Android doesn't have a direct equivalent to iOS's
        // "Reduce Transparency" setting that we can easily check
        // The blur effect should remain the primary visual

      } catch (e: Exception) {
        logWarning("Invalid color format for reduced transparency fallback: $color")
      }
    } ?: run {
      logDebug("Cleared reduced transparency fallback color")
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
          super.setOverlayColor(currentOverlayColor)
        } catch (e: Exception) {
          logError("Failed to restore blur overlay: ${e.message}", e)
        }
      }
    }
  }
}
