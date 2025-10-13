package com.sbaiahmed1.reactnativeblur

import android.content.Context
import android.graphics.Color
import android.graphics.drawable.ColorDrawable
import android.os.Build
import android.util.AttributeSet
import android.util.Log
import android.view.ViewGroup
import eightbitlab.com.blurview.BlurView
import eightbitlab.com.blurview.RenderEffectBlur
import eightbitlab.com.blurview.RenderScriptBlur

/**
 * Android implementation of React Native BlurView component.
 * Provides cross-platform blur effects using the BlurView library.
 */
class ReactNativeBlurView : BlurView {
  private var blurRadius = mapBlurAmountToRadius(DEFAULT_BLUR_AMOUNT)
  private var overlayColor = Color.TRANSPARENT
  private var isSetup = false
  private var isConfigured = false
  private var pendingStyleUpdate: Boolean = false
  private var originalBackgroundColor: Int? = null
  private var hasExplicitBackground: Boolean = false
  private var glassTintColor: Int = Color.TRANSPARENT
  private var glassOpacity: Float = 1.0f
  private var viewType: String = "blur"
  private var glassType: String = "clear"

  companion object {
    private const val TAG = "ReactNativeBlurView"
    private const val MIN_BLUR_RADIUS = 0f
    private const val MAX_BLUR_RADIUS = 25f
    private const val DEFAULT_BLUR_RADIUS = 10f
    private const val DEBUG = false // Set to true for debug builds

    // Cross-platform blur amount constants
    private const val MIN_BLUR_AMOUNT = 0f
    private const val MAX_BLUR_AMOUNT = 100f
    private const val DEFAULT_BLUR_AMOUNT = 10f

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

  constructor(context: Context?) : super(context) {
    initializeBlur()
  }

  constructor(context: Context?, attrs: AttributeSet?) : super(context, attrs) {
    initializeBlur()
  }

  constructor(context: Context?, attrs: AttributeSet?, defStyleAttr: Int) : super(
    context,
    attrs,
    defStyleAttr
  ) {
    initializeBlur()
  }

  /**
   * Initialize the blur view with default settings.
   * Sets transparent background to prevent visual artifacts.
   */
  private fun initializeBlur() {
    // Set transparent background initially to avoid yellow tint - use super to avoid recursion
    super.setBackgroundColor(Color.TRANSPARENT)
    logDebug("ReactNativeBlurView initialized")
  }

  /**
   * Override setBackgroundColor to handle blur setup timing and background preservation.
   * @param color The background color to apply
   */
  override fun setBackgroundColor(color: Int) {
    logDebug("setBackgroundColor called: $color (isSetup: $isSetup)")

    // Store the original background color if it's not transparent
    if (color != Color.TRANSPARENT) {
      originalBackgroundColor = color
      hasExplicitBackground = true
      logDebug("Stored explicit background color: $color")
    }

    // If blur is not setup yet, defer setting the background
    if (!isSetup) {
      logDebug("Blur not setup, deferring background color")
      pendingStyleUpdate = true
      // Post a setup attempt
      post {
        if (!isSetup && isAttachedToWindow) {
          logDebug("Attempting deferred blur setup from setBackgroundColor")
          setupBlurView()
        }
      }
      return
    }

    // If blur is setup and we have an explicit background, apply it carefully
     if (hasExplicitBackground && color != Color.TRANSPARENT) {
       logDebug("Applying background color over blur: $color")
       super.setBackgroundColor(color)
     } else {
       logDebug("Keeping transparent background for blur effect")
       super.setBackgroundColor(Color.TRANSPARENT)
     }
   }

   /**
    * Override setAlpha to handle blur setup timing.
    * @param alpha The alpha value to apply
    */
   override fun setAlpha(alpha: Float) {
     logDebug("setAlpha called: $alpha (isSetup: $isSetup)")

     // Always apply alpha changes immediately as they don't interfere with blur setup
     super.setAlpha(alpha)

     // If blur is not setup yet, trigger setup attempt
     if (!isSetup && isAttachedToWindow) {
       pendingStyleUpdate = true
       post {
         if (!isSetup && isAttachedToWindow) {
           logDebug("Attempting deferred blur setup from setAlpha")
           setupBlurView()
         }
       }
     }
   }

   /**
    * Override setElevation to handle blur setup timing.
    * @param elevation The elevation value to apply
    */
   override fun setElevation(elevation: Float) {
     logDebug("setElevation called: $elevation (isSetup: $isSetup)")

     // Always apply elevation changes immediately
     super.setElevation(elevation)

     // If blur is not setup yet, trigger setup attempt
     if (!isSetup && isAttachedToWindow) {
       pendingStyleUpdate = true
       post {
         if (!isSetup && isAttachedToWindow) {
           logDebug("Attempting deferred blur setup from setElevation")
           setupBlurView()
         }
       }
     }
   }

  /**
   * Called when the view is attached to a window.
   * Triggers blur setup if not already configured.
   */
  override fun onAttachedToWindow() {
    super.onAttachedToWindow()
    
    // Now we can safely walk the parent hierarchy
    if (!this.isConfigured) {
      this.isConfigured = true
      setupBlurView()
    }
  }

  /**
   * Called when the view is detached from a window.
   * Performs cleanup to prevent memory leaks and navigation transition issues.
   */
  override fun onDetachedFromWindow() {
    super.onDetachedFromWindow()
    
    this.isConfigured = false
    this.removeCallbacks(null)
    cleanup()
  }

  /**
   * Cleanup method to reset state and remove pending callbacks.
   * Helps prevent memory leaks and ensures clean state.
   */
  fun cleanup() {
    isSetup = false
    hasExplicitBackground = false
    originalBackgroundColor = null
    pendingStyleUpdate = false
    // Clear any pending runnables to prevent memory leaks
    removeCallbacks(null)
    logDebug("View detached, reset state")
  }

  /**
   * Setup the blur view with multiple fallback strategies for finding the root view.
   * Uses RenderEffectBlur for optimal performance on modern Android versions.
   */
  private fun setupBlurView() {
    if (isSetup) return

    try {
      val rootView = findOptimalBlurRoot()

      rootView?.let { root ->
        try {
          // Choose blur algorithm based on Android API level
          val blurAlgorithm = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            // Android 12+ (API 31+): Use RenderEffectBlur for better performance
            logDebug("Using RenderEffectBlur for API ${Build.VERSION.SDK_INT}")
            RenderEffectBlur()
          } else {
            // Android 10-11 (API < 31): Use RenderScriptBlur for compatibility
            logDebug("Using RenderScriptBlur for API ${Build.VERSION.SDK_INT}")
            try {
              RenderScriptBlur(context)
            } catch (e: Exception) {
              logWarning("RenderScriptBlur not supported on this device: ${e.message}")
              // Fallback: return null to trigger transparent background fallback
              throw UnsupportedOperationException("Blur not supported on this device", e)
            }
          }

          // Setup the blur view with the appropriate algorithm
          this.setupWith(root, blurAlgorithm)
          .setBlurRadius(blurRadius)
          .setOverlayColor(overlayColor)

        isSetup = true
        pendingStyleUpdate = false

        // Apply any pending background color after blur setup
        if (hasExplicitBackground && originalBackgroundColor != null) {
          logDebug("Applying pending background color: $originalBackgroundColor")
          super.setBackgroundColor(originalBackgroundColor!!)
        }

        logDebug("Blur setup successful with root: ${root.javaClass.simpleName}")
        } catch (e: Exception) {
          logWarning("Failed to setup blur algorithm: ${e.message}")
          // Fallback: use semi-transparent overlay when blur is unsupported
          super.setBackgroundColor(overlayColor)
          isSetup = true // Mark as setup to prevent retry loops
        }
      } ?: run {
        logWarning("No suitable root view found for blur setup")
        // Use semi-transparent overlay when no root view is available
        super.setBackgroundColor(overlayColor)
        isSetup = true
      }
    } catch (e: Exception) {
      // Final fallback: set transparent background to prevent visual artifacts
      super.setBackgroundColor(overlayColor)
      logError("Failed to setup blur: ${e.message}", e)
    }
  }

  /**
   * Find the optimal blur root view by walking up the parent hierarchy.
   * This method is crucial for proper blur rendering during navigation transitions.
   * @return The optimal ViewGroup to use as blur root or null if not found
   */
  private fun findOptimalBlurRoot(): ViewGroup? {
    var current = this.parent
    
    // Walk up the parent hierarchy to find the best blur root
    while (current != null) {
      if (current is ViewGroup) {
        // Prefer content view as it's the most stable during transitions
        if (current.id == android.R.id.content) {
          return current
        }
        
        // Look for other suitable container views
        val className = current.javaClass.simpleName
        if (className.contains("DecorView") ||
            className.contains("ContentFrameLayout") ||
            (className.contains("LinearLayout") && current.parent == null)) {
          // For LinearLayout, only consider it if it's the root of the hierarchy (parent == null)
          // This avoids misidentifying containers in complex layouts
          return current
        }
      }
      current = current.parent
    }
    
    // Fallback: try to get activity's content view
    return findRootView()
  }

  /**
   * Find the root view using multiple strategies.
   * @return The root ViewGroup or null if not found
   */
  private fun findRootView(): ViewGroup? {
    // Strategy 1: Look for the content view (most reliable)
    var parent = this.parent
    while (parent != null) {
      if (parent is ViewGroup && parent.id == android.R.id.content) {
        return parent
      }
      parent = parent.parent
    }

    // Strategy 2: If content view not found, use the activity's root view
    try {
      val activity = context as? android.app.Activity
      activity?.findViewById<ViewGroup>(android.R.id.content)?.let {
        return it
      }
    } catch (e: Exception) {
      logDebug("Could not access activity root view: ${e.message}")
    }

    // Strategy 3: Fallback to immediate parent
    return this.parent as? ViewGroup
  }

  /**
   * Set the blur amount with cross-platform mapping.
   * @param amount The blur amount value (0-100), will be mapped to Android's 0-25 radius range
   */
  fun setBlurAmount(amount: Float) {
    blurRadius = mapBlurAmountToRadius(amount)
    logDebug("setBlurAmount: $amount -> $blurRadius (mapped from 0-100 to 0-25 range, isSetup: $isSetup)")

    if (isSetup) {
      try {
        setBlurRadius(blurRadius)
      } catch (e: Exception) {
        logError("Failed to set blur radius: ${e.message}", e)
      }
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
    overlayColor = blurType.overlayColor
    logDebug("setBlurType: $type -> ${blurType.name} (isSetup: $isSetup)")

    if (isSetup) {
      try {
        setOverlayColor(overlayColor)
      } catch (e: Exception) {
        logError("Failed to set overlay color: ${e.message}", e)
      }
    }
  }

  /**
   * Set the fallback color for reduced transparency accessibility mode.
   * @param color The color string in hex format (e.g., "#FF0000") or null to clear
   */
  fun setReducedTransparencyFallbackColor(color: String?) {
    color?.let {
      try {
        val fallbackColor = Color.parseColor(it)
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
        glassTintColor = Color.parseColor(it)
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
   * @param type The view type string
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
    if (viewType == "liquidGlass" && isSetup) {
      try {
        // Apply glass tint with opacity
        val glassColor = Color.argb(
          (glassOpacity * 255).toInt(),
          Color.red(glassTintColor),
          Color.green(glassTintColor),
          Color.blue(glassTintColor)
        )
        setOverlayColor(glassColor)
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
        if (isSetup) {
          try {
            setOverlayColor(overlayColor)
          } catch (e: Exception) {
            logError("Failed to restore blur overlay: ${e.message}", e)
          }
        }
      }
    }
  }
}
