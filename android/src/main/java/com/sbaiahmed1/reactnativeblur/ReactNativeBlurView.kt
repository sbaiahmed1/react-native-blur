package com.sbaiahmed1.reactnativeblur

import android.content.Context
import android.graphics.Color
import android.os.Build
import android.util.AttributeSet
import android.util.Log
import android.view.ViewGroup
import androidx.appcompat.app.AppCompatActivity
import androidx.core.graphics.drawable.toDrawable
import eightbitlab.com.blurview.BlurTarget

/**
 * Android implementation of React Native BlurView component.
 * Uses Dimezis BlurView v3 with BlurTarget approach.
 */
class ReactNativeBlurView : eightbitlab.com.blurview.BlurView {
  private var targetId: String? = null
  private var overlayColor: OverlayColor = OverlayColor.fromString("light")
  private var radius: Float = 10f * INTENSITY
  private var isInitialized: Boolean = false
  private var rootView: BlurTarget? = null

  companion object {
    private const val TAG: String = "ReactNativeBlurView"
    private const val INTENSITY: Float = 0.675f
  }

  private enum class OverlayColor(val color: Int) {
    X_LIGHT(Color.argb(140, 240, 240, 240)),
    LIGHT(Color.argb(42, 255, 255, 255)),
    DARK(Color.argb(120, 26, 22, 22)),
    REGULAR(Color.argb(35, 255, 255, 255)),
    PROMINENT(Color.argb(140, 240, 240, 240)),
    ULTRA_THIN_MATERIAL(Color.argb(75, 240, 240, 240)),
    ULTRA_THIN_MATERIAL_LIGHT(Color.argb(77, 240, 240, 240)),
    ULTRA_THIN_MATERIAL_DARK(Color.argb(65, 40, 40, 40)),
    THIN_MATERIAL(Color.argb(102, 240, 240, 240)),
    THIN_MATERIAL_LIGHT(Color.argb(105, 240, 240, 240)),
    THIN_MATERIAL_DARK(Color.argb(102, 35, 35, 35)),
    MATERIAL(Color.argb(140, 245, 245, 245)),
    MATERIAL_LIGHT(Color.argb(140, 248, 248, 248)),
    MATERIAL_DARK(Color.argb(215, 65, 60, 60)),
    THICK_MATERIAL(Color.argb(210, 248, 248, 248)),
    THICK_MATERIAL_LIGHT(Color.argb(212, 248, 248, 248)),
    THICK_MATERIAL_DARK(Color.argb(165, 35, 35, 35)),
    CHROME_MATERIAL(Color.argb(165, 248, 248, 248)),
    CHROME_MATERIAL_LIGHT(Color.argb(167, 248, 248, 248)),
    CHROME_MATERIAL_DARK(Color.argb(100, 32, 32, 32));

    companion object {
      fun fromString(color: String): OverlayColor {
        return when (color.lowercase()) {
          "xlight", "x-light" -> X_LIGHT
          "light" -> LIGHT
          "dark" -> DARK
          "extradark", "extra-dark" -> DARK
          "regular" -> REGULAR
          "prominent" -> PROMINENT
          "systemultrathinmaterial", "ultra-thin-material" -> ULTRA_THIN_MATERIAL
          "ultra-thin-material-light" -> ULTRA_THIN_MATERIAL_LIGHT
          "ultra-thin-material-dark" -> ULTRA_THIN_MATERIAL_DARK
          "systemthinmaterial", "thin-material" -> THIN_MATERIAL
          "thin-material-light" -> THIN_MATERIAL_LIGHT
          "thin-material-dark" -> THIN_MATERIAL_DARK
          "systemmaterial", "material" -> MATERIAL
          "material-light" -> MATERIAL_LIGHT
          "material-dark" -> MATERIAL_DARK
          "systemthickmaterial", "thick-material" -> THICK_MATERIAL
          "thick-material-light" -> THICK_MATERIAL_LIGHT
          "thick-material-dark" -> THICK_MATERIAL_DARK
          "systemchromematerial", "chrome-material" -> CHROME_MATERIAL
          "chrome-material-light" -> CHROME_MATERIAL_LIGHT
          "chrome-material-dark" -> CHROME_MATERIAL_DARK
          else -> LIGHT
        }
      }
    }
  }

  constructor(context: Context?) : super(context) {
    this.setupBlurView()
  }

  constructor(context: Context?, attrs: AttributeSet?) : super(context, attrs) {
    this.setupBlurView()
  }

  constructor(context: Context?, attrs: AttributeSet?, defStyleAttr: Int) : super(
    context,
    attrs,
    defStyleAttr
  ) {
    this.setupBlurView()
  }

  override fun onAttachedToWindow() {
    super.onAttachedToWindow()

    if (!this.isInitialized) {
      this.reinitialize()
    }
  }

  override fun onDetachedFromWindow() {
    super.onDetachedFromWindow()

    this.rootView = null
    this.isInitialized = false
    this.removeCallbacks(null)
  }

  private fun setupBlurView() {
    super.setBackgroundColor(this.overlayColor.color)
    super.clipChildren = true
    super.clipToOutline = true
    // Note: Do not set layoutParams here to avoid overriding React Native constraints
    // React Native will handle the layout parameters through its layout system
  }

  // Wait all views are mounted in interface
  private fun reinitialize() {
    post {
      this.initialize()
    }
  }

  private fun initialize() {
    // Find rootView only on first mount (when the initialization is false)
    if (!this.isInitialized) {
      this.rootView = this.findRootTargetView()

      if (this.rootView == null) {
        super.setBackgroundColor(this.overlayColor.color)
        super.setOverlayColor(this.overlayColor.color)
        super.setBlurEnabled(false)

        Log.w(TAG, "Target view not found: $targetId")
        return
      }
    }

    val drawable = this.getAppropriateBackground()
    super.setupWith(this.rootView!!, 6f, false)
      .setBlurRadius(this.radius)
      .setOverlayColor(this.overlayColor.color)
      .setBlurAutoUpdate(true)
      .setBlurEnabled(true)
      .setFrameClearDrawable(drawable)

    this.isInitialized = true
  }

  private fun findRootTargetView(): BlurTarget? {
    if (this.targetId == null) {
      Log.w(TAG, "TargetId is null")

      return null
    }

    val activityRoot = this.getRootView()
    activityRoot?.let { root ->
      val target = findViewWithTagInViewGroup(root as? ViewGroup, targetId!!)
      if (target != null) return target
    }

    var parent = this.parent
    while (parent != null) {
      if (parent is ViewGroup) {
        val target = findViewWithTagInViewGroup(parent, targetId!!)
        if (target != null) return target
      }
      parent = parent.parent
    }

    Log.w(TAG, "Target not found anywhere: $targetId")
    return null
  }

  private fun findViewWithTagInViewGroup(viewGroup: ViewGroup?, tag: String): BlurTarget? {
    if (viewGroup == null) return null

    if (viewGroup.tag == tag && viewGroup is BlurTarget) {
      return viewGroup
    }

    for (i in 0 until viewGroup.childCount) {
      val child = viewGroup.getChildAt(i)
      if (child.tag == tag && child is BlurTarget) {
        return child
      }

      if (child is ViewGroup) {
        val found = this.findViewWithTagInViewGroup(child, tag)
        if (found != null) return found
      }
    }

    return null
  }

  /**
   * This method attempts to obtain a background in the following priority order:
   * 1. The current window's decor view background (if available)
   * 2. A fallback overlay color converted to a drawable
   */
  private fun getAppropriateBackground(): android.graphics.drawable.Drawable {
    try {
      val activity = this.getActivityFromContext()
      activity?.window?.decorView?.background?.let {
        return it
      }

      activity?.window?.let { window ->
        val windowBackground = window.decorView.background
        windowBackground?.let {
          return it
        }
      }

      return this.overlayColor.color.toDrawable()
    } catch (e: Exception) {
      Log.e(TAG, "Error getting background: ${e.message}")

      return this.overlayColor.color.toDrawable()
    }
  }

  /**
   * Traverses the context hierarchy to find the associated AppCompatActivity.
   * This method unwraps the context chain by checking each context in the hierarchy.
   * It handles ContextWrapper instances by accessing their base context recursively
   * until it either finds an AppCompatActivity or reaches the end of the chain.
   */
  private fun getActivityFromContext(): AppCompatActivity? {
    var context = this.context

    while (context != null) {
      when (context) {
        is AppCompatActivity -> return context
        is android.content.ContextWrapper -> {
          context = context.baseContext
        }
        else -> break
      }
    }

    return null
  }

  private fun clipRadius(radius: Float): Float {
    val maxRadius = if (Build.VERSION.SDK_INT > 31) 67.5f else 25f

    return if (radius <= 0) 0f
    else if (radius >= maxRadius) maxRadius
    else radius
  }

  /**
   * Maps blur amount (0-100) to blur radius with intensity factor
   */
  private fun mapBlurAmountToRadius(amount: Float): Float {
    return this.clipRadius(amount * INTENSITY)
  }

  fun setBlurType(type: String) {
    val overlay = OverlayColor.fromString(type)
    this.overlayColor = overlay
    super.setBackgroundColor(overlay.color)

    if (this.isInitialized) {
      super.setOverlayColor(overlay.color)
      this.isInitialized = false
      this.reinitialize()
    }
  }

  fun setBlurAmount(amount: Float) {
    val radiusValue = mapBlurAmountToRadius(amount)
    this.radius = radiusValue

    if (this.isInitialized) {
      super.setBlurRadius(radiusValue)
      this.isInitialized = false
      this.reinitialize()
    }
  }

  fun setTargetId(targetId: String?) {
    val oldTargetId = this.targetId
    this.targetId = targetId

    if (oldTargetId != targetId && this.isAttachedToWindow) {
      this.isInitialized = false
      this.reinitialize()
    }
  }

  fun setReducedTransparencyFallbackColor(color: String?) {
    // No-op for Android - iOS only feature
  }

  fun setGlassTintColor(color: String?) {
    // No-op for Android - iOS only feature
  }

  fun setGlassOpacity(opacity: Float) {
    // No-op for Android - iOS only feature
  }

  fun setType(type: String) {
    // No-op for Android - iOS only feature
  }

  fun setIsInteractive(isInteractive: Boolean) {
    // No-op for Android - iOS only feature
  }

  fun setGlassType(type: String) {
    // No-op for Android - iOS only feature
  }
}
