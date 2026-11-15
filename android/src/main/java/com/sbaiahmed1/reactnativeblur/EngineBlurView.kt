package com.sbaiahmed1.reactnativeblur

import android.content.Context
import android.graphics.Canvas
import android.graphics.Color
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
  private var overlayColor = Color.TRANSPARENT
  private val overlayPaint = Paint()

  override val downsample: Int = BackdropScale.BLUR
  override val effect = BackdropEffect { createBlurEffect() }

  // The node is blurred in its own pixels, each downsample view px wide.
  private val effectRadius: Float
    get() = BlurRadius.effectRadius(BlurRadius.sigmaPx(blurAmount) / downsample)

  override val wantsBackdrop: Boolean
    get() = effectRadius > 0f

  private fun createBlurEffect(): RenderEffect = gpuBlurEffect(effectRadius)

  override fun drawBackdrop(canvas: Canvas, node: RenderNode) {
    // At amount 0 legacy QmBlurView draws no backdrop either, only the overlay.
    if (effectRadius > 0f) canvas.drawRenderNode(node)
    drawOverlay(canvas)
  }

  override fun drawSoftwareFallback(canvas: Canvas) {
    drawOverlay(canvas)
  }

  private fun drawOverlay(canvas: Canvas) {
    if (Color.alpha(overlayColor) == 0) return
    overlayPaint.color = overlayColor
    canvas.drawRect(0f, 0f, width.toFloat(), height.toFloat(), overlayPaint)
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
}
