package com.sbaiahmed1.reactnativeblur

import android.content.Context
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.graphics.RenderEffect
import android.graphics.RenderNode
import android.graphics.RuntimeShader
import android.graphics.Shader
import android.os.Build
import android.util.Log
import android.util.TypedValue
import android.view.MotionEvent
import androidx.annotation.RequiresApi

/** LiquidGlassView on Android 13+: the AndroidLiquidGlassView AGSL shader over the backdrop [BackdropSources] picks, the views behind it or the software capture. */
class ReactNativeLiquidGlassView(context: Context) : BackdropHostView(context) {

  private var glassType: String = "clear"
  private var glassTintColor: Int = Color.TRANSPARENT
  private var glassOpacity: Float = 1.0f
  private val flatPaint = Paint()
  private var interactive: Boolean = true

  // Only touched on API 33+.
  private var liquidShader: RuntimeShader? = null
  private var shaderFailed = false

  override val downsample: Int = BackdropScale.GLASS
  override val throttlesSoftwareCapture: Boolean = true
  override val engineEnabled: Boolean
    get() = isSupported
  // The shader's geometry uniforms are in view px.
  override val nodeAtCaptureScale: Boolean
    get() = false
  override val effect = BackdropEffect { createGlassEffect() }

  companion object {
    private const val TAG = "RNLiquidGlassView"

    // Shader parameters, softened from the library widget's own defaults
    // (refractionHeight 20dp, refractionOffset -70dp, dispersion 0.5): the
    // full-strength edge bend reads too aggressive over typical RN content.
    // DEPTH_EFFECT matches Config.DEPTH_EFFECT. contrast/whitePoint/chroma
    // keep the widget's noFilter() preset (0, 0, 1).
    private const val REFRACTION_HEIGHT_DP = 16f
    private const val REFRACTION_OFFSET_DP = 40f
    private const val DISPERSION = 0.35f
    private const val DEPTH_EFFECT = 0.3f

    // The library leaves blur to the caller (widget default is ~0). Map the
    // two iOS materials to a light and a frosty backdrop blur respectively.
    private const val CLEAR_BLUR_RADIUS = 4f
    private const val REGULAR_BLUR_RADIUS = 18f

    // iOS-style press feedback for isInteractive (the library widget uses the
    // same scale in its touch effect).
    private const val PRESS_SCALE = 1.02f

    private val isSupported = Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU
  }

  override fun drawBackdrop(canvas: Canvas, node: RenderNode) {
    // Without a compiled shader the node would draw a raw copy of the backdrop over the content.
    if (!shaderFailed) canvas.drawRenderNode(node)
  }

  override fun drawSoftwareFallback(canvas: Canvas) = Unit

  // The tint lives in the shader, so a flat glass fills it with the shader's alpha formula.
  override fun drawFlat(canvas: Canvas) {
    val alpha = Color.alpha(glassTintColor) / 255f * glassOpacity
    if (alpha <= 0f) return
    flatPaint.color = glassTintColor
    flatPaint.alpha = Math.round(alpha.coerceAtMost(1f) * 255f)
    canvas.drawRect(0f, 0f, width.toFloat(), height.toFloat(), flatPaint)
  }

  private fun createGlassEffect(): RenderEffect {
    if (!isSupported) return RenderEffect.createOffsetEffect(0f, 0f)
    return createGlassEffect33()
  }

  @RequiresApi(Build.VERSION_CODES.TIRAMISU)
  private fun createGlassEffect33(): RenderEffect {
    val shader = ensureShader() ?: return RenderEffect.createOffsetEffect(0f, 0f)
    val w = width.toFloat()
    val h = height.toFloat()

    // The shader models a single uniform-radius rounded rect. Non-uniform corners keep the base radius for the lens and rely on the outline clip.
    val lensRadius = if (cornerRadii.isUniform) cornerRadii.topLeft else baseRadiusPx
    val radius = lensRadius.coerceIn(0f, minOf(w, h) / 2f)

    shader.setFloatUniform("size", floatArrayOf(w, h))
    shader.setFloatUniform("offset", floatArrayOf(0f, 0f))
    shader.setFloatUniform("cornerRadii", floatArrayOf(radius, radius, radius, radius))
    shader.setFloatUniform("refractionHeight", convertDpToPx(REFRACTION_HEIGHT_DP))
    shader.setFloatUniform("refractionAmount", -convertDpToPx(REFRACTION_OFFSET_DP))
    shader.setFloatUniform("depthEffect", DEPTH_EFFECT)
    shader.setFloatUniform("chromaticAberration", DISPERSION)
    shader.setFloatUniform("contrast", 0f)
    shader.setFloatUniform("whitePoint", 0f)
    shader.setFloatUniform("chromaMultiplier", 1f)
    // Shader-modulated tint, so the iOS formula (tint's own alpha scaled by glassOpacity) maps directly.
    shader.setFloatUniform(
      "tintColor",
      floatArrayOf(
        Color.red(glassTintColor) / 255f,
        Color.green(glassTintColor) / 255f,
        Color.blue(glassTintColor) / 255f
      )
    )
    shader.setFloatUniform("tintAlpha", (Color.alpha(glassTintColor) / 255f) * glassOpacity)

    val shaderEffect = RenderEffect.createRuntimeShaderEffect(shader, "content")
    val blurRadius =
      if (glassType.equals("regular", ignoreCase = true)) REGULAR_BLUR_RADIUS
      else CLEAR_BLUR_RADIUS
    return RenderEffect.createChainEffect(
      shaderEffect,
      RenderEffect.createBlurEffect(blurRadius, blurRadius, Shader.TileMode.CLAMP)
    )
  }

  @RequiresApi(Build.VERSION_CODES.TIRAMISU)
  private fun ensureShader(): RuntimeShader? {
    if (shaderFailed) return null
    liquidShader?.let { return it }
    return try {
      RuntimeShader(loadShaderSource()).also { liquidShader = it }
    } catch (e: Exception) {
      // A shader compile failure would otherwise crash on the first uniform set, so the glass stays dark and the children still render.
      Log.w(TAG, "Failed to create liquid glass shader", e)
      shaderFailed = true
      null
    }
  }

  private fun loadShaderSource(): String {
    // The AGSL shader is vendored from AndroidLiquidGlassView (MIT, license
    // header retained in the resource) rather than consumed from its AAR: the
    // published artifact requires compileSdk 37+, and only the shader is
    // usable inside RN anyway (see the class comment).
    return resources.openRawResource(R.raw.rnblur_liquidglass_effect)
      .bufferedReader()
      .use { it.readText() }
  }

  fun setGlassType(type: String) {
    glassType = type
    markEffectDirty()
  }

  /**
   * Set the glass tint color.
   * @param color React Native color int, or null for no tint
   */
  fun setGlassTintColor(color: Int?) {
    glassTintColor = color ?: Color.TRANSPARENT
    markEffectDirty()
  }

  fun setGlassOpacity(opacity: Float) {
    glassOpacity = opacity.coerceIn(0.0f, 1.0f)
    markEffectDirty()
  }

  fun setIsInteractive(isInteractive: Boolean) {
    interactive = isInteractive
    if (!isInteractive) {
      animate().cancel()
      scaleX = 1f
      scaleY = 1f
    }
  }

  override fun onTouchEvent(event: MotionEvent): Boolean {
    if (!interactive) return super.onTouchEvent(event)
    when (event.actionMasked) {
      MotionEvent.ACTION_DOWN -> {
        animate().scaleX(PRESS_SCALE).scaleY(PRESS_SCALE).setDuration(120).start()
        // Claim only the DOWN so the press animation gets its UP or CANCEL. Moves stay free for scroll parents, whose intercept sends the CANCEL.
        return true
      }
      MotionEvent.ACTION_UP, MotionEvent.ACTION_CANCEL -> {
        animate().scaleX(1f).scaleY(1f).setDuration(160).start()
      }
    }
    return super.onTouchEvent(event)
  }

  private fun convertDpToPx(dp: Float): Float {
    val displayMetrics = context.resources.displayMetrics
    return TypedValue.applyDimension(TypedValue.COMPLEX_UNIT_DIP, dp, displayMetrics)
  }
}
