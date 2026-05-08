package com.sbaiahmed1.reactnativeblur

import android.content.Context
import android.util.AttributeSet
import android.util.Log
import android.util.TypedValue
import android.view.View
import android.view.ViewGroup
import android.widget.FrameLayout
import androidx.core.graphics.toColorInt
import com.qmdeve.liquidglass.widget.LiquidGlassView

class ReactNativeLiquidGlassView : FrameLayout {

  private var liquidGlassView: LiquidGlassView? = null
  private val contentContainer: FrameLayout

  private var glassType: String = "clear"
  private var glassTintColor: Int = android.graphics.Color.TRANSPARENT
  private var glassOpacity: Float = 1.0f
  private var currentCornerRadius: Float = 0f
  private var isInteractive: Boolean = true

  companion object {
    private const val TAG = "ReactNativeLiquidGlass"
    private const val CLEAR_REFRACTION_HEIGHT_DP = 14f
    private const val CLEAR_REFRACTION_OFFSET_DP = 42f
    private const val CLEAR_BLUR_RADIUS = 3f
    private const val CLEAR_DISPERSION = 0.18f
    private const val REGULAR_REFRACTION_HEIGHT_DP = 24f
    private const val REGULAR_REFRACTION_OFFSET_DP = 70f
    private const val REGULAR_BLUR_RADIUS = 14f
    private const val REGULAR_DISPERSION = 0.55f
  }

  constructor(context: Context) : super(context) {
    contentContainer = FrameLayout(context)
    setupView()
  }

  constructor(context: Context, attrs: AttributeSet?) : super(context, attrs) {
    contentContainer = FrameLayout(context)
    setupView()
  }

  private fun setupView() {
    setWillNotDraw(false)

    // Add content container first (React Native children go here)
    contentContainer.layoutParams = LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT)
    addView(contentContainer)

    // Add liquid glass view on top
    liquidGlassView = LiquidGlassView(context).apply {
      layoutParams = LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT)
      setLayerType(View.LAYER_TYPE_HARDWARE, null)
    }
    addView(liquidGlassView)
  }

  fun addReactSubview(child: View, index: Int) {
    contentContainer.addView(child, index)
  }

  fun removeReactSubviewAt(index: Int) {
    contentContainer.removeViewAt(index)
  }

  fun removeAllReactSubviews() {
    contentContainer.removeAllViews()
  }

  fun getReactSubviewAt(index: Int): View {
    return contentContainer.getChildAt(index)
  }

  fun getReactSubviewCount(): Int {
    return contentContainer.childCount
  }

  override fun onAttachedToWindow() {
    super.onAttachedToWindow()

    postDelayed({
      try {
        liquidGlassView?.bind(contentContainer)
        Log.d(TAG, "bindGlassSource: Bind complete")
      } catch (e: Exception) {
        Log.e(TAG, "bindGlassSource: Exception", e)
      }
    }, 300)
  }

  override fun onDetachedFromWindow() {
    liquidGlassView = null
    super.onDetachedFromWindow()
  }

  fun setGlassType(type: String) {
    glassType = type
    updateGlassEffect()
  }

  fun setGlassTintColor(color: String?) {
    glassTintColor = try {
      color?.takeIf { it.isNotEmpty() && it != "clear" }?.toColorInt()
        ?: android.graphics.Color.TRANSPARENT
    } catch (e: IllegalArgumentException) {
      android.graphics.Color.TRANSPARENT
    }
    updateGlassEffect()
  }

  fun setGlassOpacity(opacity: Float) {
    glassOpacity = opacity.coerceIn(0.0f, 1.0f)
    updateGlassEffect()
  }

  fun setIsInteractive(interactive: Boolean) {
    isInteractive = interactive
    liquidGlassView?.setTouchEffectEnabled(interactive)
  }

  fun setBorderRadius(radius: Float) {
    currentCornerRadius = radius
    updateCornerRadius()
  }

  private fun updateGlassEffect() {
    val glassView = liquidGlassView ?: return

    val isRegular = glassType == "regular"

    glassView.setRefractionHeight(dpToPx(if (isRegular) REGULAR_REFRACTION_HEIGHT_DP else CLEAR_REFRACTION_HEIGHT_DP))
    glassView.setRefractionOffset(dpToPx(if (isRegular) REGULAR_REFRACTION_OFFSET_DP else CLEAR_REFRACTION_OFFSET_DP))
    glassView.setBlurRadius(if (isRegular) REGULAR_BLUR_RADIUS else CLEAR_BLUR_RADIUS)
    glassView.setDispersion(if (isRegular) REGULAR_DISPERSION else CLEAR_DISPERSION)
    glassView.setTintColorRed(android.graphics.Color.red(glassTintColor) / 255f)
    glassView.setTintColorGreen(android.graphics.Color.green(glassTintColor) / 255f)
    glassView.setTintColorBlue(android.graphics.Color.blue(glassTintColor) / 255f)
    glassView.setTintAlpha(glassOpacity * (android.graphics.Color.alpha(glassTintColor) / 255f))
    glassView.setTouchEffectEnabled(isInteractive)
    glassView.setElasticEnabled(false)
    glassView.setDraggableEnabled(false)

    updateCornerRadius()
  }

  private fun updateCornerRadius() {
    val glassView = liquidGlassView ?: return
    val radiusInPixels = dpToPx(currentCornerRadius)
    glassView.setCornerRadius(radiusInPixels)
  }

  private fun dpToPx(value: Float): Float {
    return android.util.TypedValue.applyDimension(
      android.util.TypedValue.COMPLEX_UNIT_DIP,
      value,
      context.resources.displayMetrics
    )
  }
}
