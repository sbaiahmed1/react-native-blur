package com.sbaiahmed1.reactnativeblur

import android.content.Context
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.ColorMatrixColorFilter
import android.graphics.Paint
import android.graphics.RenderEffect
import android.graphics.RenderNode
import android.graphics.Shader

/** A Gaussian blur with clamped edges, or no blur at radius 0, where Skia's null filter throws on API 31-32. */
internal fun gpuBlurEffect(radius: Float): RenderEffect =
  if (radius <= 0f) RenderEffect.createOffsetEffect(0f, 0f)
  else RenderEffect.createBlurEffect(radius, radius, Shader.TileMode.CLAMP)

/** BlurView on API 31+: the shared software capture, blurred on the GPU with RenderEffect. */
internal class EngineBlurView(context: Context) : BackdropHostView(context), BlurViewProps {
  private var blurAmount = BlurRadius.DEFAULT_AMOUNT
  private var blurType = "xlight"
  private var materialTint: Int? = null
  private var materialSaturation = -1f
  private var materialRadius = -1f
  private var cachedSpec: MaterialDrawSpec? = null
  private val overlayPaint = Paint()

  override val downsample: Int = BackdropScale.BLUR
  override val effect = BackdropEffect { createBlurEffect() }

  // Every prop setter clears the cache, so an amount driven without a React render redraws from the native value.
  private val spec: MaterialDrawSpec
    get() = cachedSpec ?: MaterialMath.drawSpec(
      blurAmount, materialRadius, materialTint, materialSaturation, resources.displayMetrics.density, blurType
    ).also { cachedSpec = it }

  // The node is blurred in its own pixels, each backdropScale view px wide. A material also counts the blur the downsample adds.
  private val effectRadius: Float
    get() = if (materialRadius >= 0f) MaterialMath.nodeEffectRadius(spec.sigmaPx, backdropScale)
    else BlurRadius.effectRadius(spec.sigmaPx / backdropScale)

  override val wantsBackdrop: Boolean
    get() = effectRadius > 0f

  override val opaqueBackdrop: Boolean
    get() = NestedCut.isOpaqueBlur(effectRadius, hasRecordedBackdrop, isPlatformBackdrop)

  private fun createBlurEffect(): RenderEffect {
    val blur = gpuBlurEffect(effectRadius)
    val saturation = spec.saturation
    if (saturation == 1f) return blur
    return RenderEffect.createColorFilterEffect(ColorMatrixColorFilter(MaterialMath.saturationMatrix(saturation)), blur)
  }

  override fun drawBackdrop(canvas: Canvas, node: RenderNode) {
    // Below half a node px of blur the backdrop would only show its downsampled pixels, so only the overlay draws.
    if (effectRadius > 0f) canvas.drawRenderNode(node)
    drawOverlay(canvas)
  }

  override fun drawSoftwareFallback(canvas: Canvas) {
    drawOverlay(canvas)
  }

  private fun drawOverlay(canvas: Canvas) {
    val overlayColor = spec.overlayColor
    if (Color.alpha(overlayColor) == 0) return
    overlayPaint.color = overlayColor
    canvas.drawRect(0f, 0f, width.toFloat(), height.toFloat(), overlayPaint)
  }

  private fun materialChanged() {
    cachedSpec = null
    markEffectDirty()
  }

  override fun setBlurAmount(amount: Float) {
    blurAmount = amount
    materialChanged()
  }

  override fun setBlurType(type: String) {
    blurType = type
    materialChanged()
  }

  override fun setMaterialTint(color: Int?) {
    materialTint = color
    materialChanged()
  }

  override fun setMaterialSaturation(saturation: Float) {
    materialSaturation = saturation
    materialChanged()
  }

  override fun setMaterialRadius(radiusDp: Float) {
    materialRadius = radiusDp
    materialChanged()
  }

  // QmBlurView's box blur passes have no meaning for a Gaussian blur.
  override fun setRounds(rounds: Int) = Unit

  // The engine records its backdrop at its own scale; this only sizes QmBlurView's capture.
  override fun setDownsample(factor: Float) = Unit
}
