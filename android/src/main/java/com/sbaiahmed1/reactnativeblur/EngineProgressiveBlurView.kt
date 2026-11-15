package com.sbaiahmed1.reactnativeblur

import android.content.Context
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.LinearGradient
import android.graphics.Paint
import android.graphics.PorterDuff
import android.graphics.PorterDuffXfermode
import android.graphics.RenderEffect
import android.graphics.RenderNode
import android.graphics.Shader

/** ProgressiveBlurView on API 31+: the engine blur masked by the legacy alpha ramp. */
internal class EngineProgressiveBlurView(context: Context) : BackdropHostView(context), ProgressiveBlurViewProps {
  private var blurAmount = BlurRadius.DEFAULT_AMOUNT
  private var direction = "topToBottom"
  private var startOffset = 0f
  private var overlayColor = Color.TRANSPARENT
  private val overlayPaint = Paint()
  private val maskPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
    xfermode = PorterDuffXfermode(PorterDuff.Mode.DST_IN)
  }

  override val downsample: Int = BackdropScale.BLUR
  override val effect = BackdropEffect { createBlurEffect() }

  private val effectRadius: Float
    get() = BlurRadius.effectRadius(BlurRadius.sigmaPx(ProgressiveMask.effectiveAmount(blurAmount, direction)) / downsample)

  override val wantsBackdrop: Boolean
    get() = effectRadius > 0f

  private fun createBlurEffect(): RenderEffect = gpuBlurEffect(effectRadius)

  override fun drawBackdrop(canvas: Canvas, node: RenderNode) {
    val save = canvas.saveLayer(0f, 0f, width.toFloat(), height.toFloat(), null)
    if (effectRadius > 0f) canvas.drawRenderNode(node)
    drawOverlay(canvas)
    canvas.drawRect(0f, 0f, width.toFloat(), height.toFloat(), maskPaint)
    canvas.restoreToCount(save)
  }

  override fun drawSoftwareFallback(canvas: Canvas) {
    if (Color.alpha(overlayColor) == 0) return
    val save = canvas.saveLayer(0f, 0f, width.toFloat(), height.toFloat(), null)
    drawOverlay(canvas)
    canvas.drawRect(0f, 0f, width.toFloat(), height.toFloat(), maskPaint)
    canvas.restoreToCount(save)
  }

  private fun drawOverlay(canvas: Canvas) {
    if (Color.alpha(overlayColor) == 0) return
    overlayPaint.color = overlayColor
    canvas.drawRect(0f, 0f, width.toFloat(), height.toFloat(), overlayPaint)
  }

  private fun updateMask() {
    if (width <= 0 || height <= 0) return
    val spec = ProgressiveMask.spec(direction, startOffset, width.toFloat(), height.toFloat())
    val colors = IntArray(spec.alphas.size) { Color.argb(Math.round(spec.alphas[it] * 255f), 255, 255, 255) }
    maskPaint.shader = LinearGradient(spec.x0, spec.y0, spec.x1, spec.y1, colors, spec.positions, Shader.TileMode.CLAMP)
    invalidate()
  }

  override fun onSizeChanged(w: Int, h: Int, oldw: Int, oldh: Int) {
    super.onSizeChanged(w, h, oldw, oldh)
    updateMask()
  }

  override fun setBlurAmount(amount: Float) {
    blurAmount = amount
    markEffectDirty()
  }

  override fun setBlurType(type: String) {
    overlayColor = BlurType.fromString(type).overlayColor
    invalidate()
  }

  // QmBlurView's box blur passes have no meaning for a Gaussian blur.
  override fun setRounds(rounds: Int) = Unit

  override fun setDirection(direction: String) {
    this.direction = ProgressiveMask.normalizeDirection(direction)
    markEffectDirty()
    updateMask()
  }

  override fun setStartOffset(offset: Float) {
    startOffset = offset.coerceIn(0f, 1f)
    updateMask()
  }
}
