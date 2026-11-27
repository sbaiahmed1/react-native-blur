package com.sbaiahmed1.reactnativeblur

import android.content.Context
import android.graphics.BlendMode
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.LinearGradient
import android.graphics.Paint
import android.graphics.RenderEffect
import android.graphics.RenderNode
import android.graphics.Shader

/** ProgressiveBlurView on API 31+: blurs of the backdrop whose radius ramps across the fade, under a tint ramp. */
internal class EngineProgressiveBlurView(context: Context) : BackdropHostView(context), ProgressiveBlurViewProps {
  private var blurAmount = BlurRadius.DEFAULT_AMOUNT
  private var direction = "topToBottom"
  private var startOffset = 0f
  private var blurType = "regular"
  private var materialTint: Int? = null
  private var overlayColor = Color.TRANSPARENT
  private val overlayPaint = Paint()

  override val downsample: Int = BackdropScale.PROGRESSIVE
  override val effect = BackdropEffect { createBlurEffect() }

  override val wantsBackdrop: Boolean
    get() = ProgressiveBands.weight(ProgressiveBands.plateauSigmaPx(blurAmount, density) / backdropScale) > 0f

  private val density: Float
    get() = resources.displayMetrics.density

  // Each band is a blur masked to its part of the fade, drawn over the weaker ones.
  private fun createBlurEffect(): RenderEffect {
    val bands = ProgressiveBands.bands(
      blurAmount, direction, startOffset, width.toFloat(), height.toFloat(), backdropScale, density
    )
    var stack: RenderEffect? = null
    for (band in bands.asReversed()) {
      val mask = RenderEffect.createShaderEffect(gradient(band.mask, OPAQUE))
      val masked = RenderEffect.createBlendModeEffect(gpuBlurEffect(band.radius), mask, BlendMode.DST_IN)
      stack = stack?.let { RenderEffect.createBlendModeEffect(it, masked, BlendMode.SRC_OVER) } ?: masked
    }
    return stack ?: gpuBlurEffect(0f)
  }

  override fun drawBackdrop(canvas: Canvas, node: RenderNode) {
    if (wantsBackdrop) canvas.drawRenderNode(node)
    drawSoftwareFallback(canvas)
  }

  override fun drawSoftwareFallback(canvas: Canvas) {
    if (Color.alpha(overlayColor) == 0 || overlayPaint.shader == null) return
    canvas.drawRect(0f, 0f, width.toFloat(), height.toFloat(), overlayPaint)
  }

  private fun updateMask() {
    overlayColor = ProgressiveMask.tintColor(materialTint, blurType, blurAmount)
    if (width <= 0 || height <= 0) return
    val spec = ProgressiveMask.tintSpec(direction, startOffset, width.toFloat(), height.toFloat())
    overlayPaint.shader = gradient(spec, overlayColor)
    invalidate()
  }

  override fun onSizeChanged(w: Int, h: Int, oldw: Int, oldh: Int) {
    super.onSizeChanged(w, h, oldw, oldh)
    updateMask()
  }

  override fun setBlurAmount(amount: Float) {
    blurAmount = amount
    markEffectDirty()
    updateMask()
  }

  override fun setBlurType(type: String) {
    blurType = type
    updateMask()
  }

  // QmBlurView's box blur passes have no meaning for a Gaussian blur.
  override fun setRounds(rounds: Int) = Unit

  override fun setMaterialTint(color: Int?) {
    materialTint = color
    updateMask()
  }

  // A progressive blur draws no saturation and keeps blurAmount as its radius, as on iOS.
  override fun setMaterialSaturation(saturation: Float) = Unit
  override fun setMaterialRadius(radiusDp: Float) = Unit

  // The engine records its backdrop at its own scale. This only sizes QmBlurView's capture.
  override fun setDownsample(factor: Float) = Unit

  override fun setDirection(direction: String) {
    this.direction = ProgressiveMask.normalizeDirection(direction)
    markEffectDirty()
    updateMask()
  }

  override fun setStartOffset(offset: Float) {
    startOffset = offset.coerceIn(0f, 1f)
    markEffectDirty()
    updateMask()
  }

  private companion object {
    const val OPAQUE = -1

    fun gradient(spec: MaskSpec, color: Int): Shader = LinearGradient(
      spec.x0, spec.y0, spec.x1, spec.y1,
      ProgressiveMask.overlayColors(color, spec.alphas), spec.positions, Shader.TileMode.CLAMP
    )
  }
}
