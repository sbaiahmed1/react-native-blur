package com.sbaiahmed1.reactnativeblur

import android.content.Context
import android.graphics.Color
import android.graphics.Outline
import android.graphics.Path
import android.os.Build
import android.util.Log
import android.util.TypedValue
import android.view.View
import android.view.ViewGroup
import android.view.ViewOutlineProvider
import android.widget.FrameLayout
import androidx.core.graphics.toColorInt
import com.example.liquidglass.GlassMaterial
import com.example.liquidglass.LiquidGlassView

/**
 * Android implementation of React Native LiquidGlassView, backed by the
 * Liquid-Glass-Android library (AGSL/RenderEffect pipeline on API 33+,
 * classic C++/NEON pipeline down to API 24).
 *
 * View hierarchy:
 *
 *   this (RN-managed wrapper)
 *    └── glassView   (library view, draws the glass)
 *         └── contentView (hosts the React children + tint scrim background)
 *
 * The library's LiquidGlassView is final, so it is wrapped rather than
 * subclassed. React children are mounted into [contentView] INSIDE the glass
 * view, mirroring the iOS getContentView pattern, because the library
 * self-excludes from backdrop capture by skipping its own draw pass: children
 * mounted outside it would be captured into the backdrop and refracted back
 * as ghost images. [contentView] no-ops onLayout/onMeasure so a stray Android
 * layout pass can never displace children that RN's UIManager has positioned.
 */
class ReactNativeLiquidGlassView(context: Context) : FrameLayout(context) {

  /** Hosts the React children; the manager routes child mutations here. */
  internal val contentView: FrameLayout = object : FrameLayout(context) {
    override fun onMeasure(widthMeasureSpec: Int, heightMeasureSpec: Int) {
      // Trust React Native to provide correct dimensions
      setMeasuredDimension(
        MeasureSpec.getSize(widthMeasureSpec),
        MeasureSpec.getSize(heightMeasureSpec)
      )
    }

    override fun onLayout(changed: Boolean, left: Int, top: Int, right: Int, bottom: Int) {
      // No-op: Layout is handled by React Native's UIManager.
    }
  }

  private val glassView = LiquidGlassView(context)

  private var glassTintColor: Int = Color.TRANSPARENT
  private var glassOpacity: Float = 1.0f
  private var borderRadius = 0f
  private var borderTopLeftRadius = -1f
  private var borderTopRightRadius = -1f
  private var borderBottomLeftRadius = -1f
  private var borderBottomRightRadius = -1f
  private var initRunnable: Runnable? = null

  companion object {
    private const val TAG = "RNLiquidGlassView"

    // The library's press-elasticity default; restored when isInteractive
    // flips back to true.
    private const val DEFAULT_ELASTICITY = 0.15f

    // A raw scrim composites literally, unlike UIGlassEffect's
    // material-modulated tint, so the iOS formula (tintAlpha * glassOpacity)
    // would render an opaque tint as a solid panel. Capped to match the
    // documented JS fallback approximation (MAX_FALLBACK_TINT_ALPHA in
    // src/colorUtils.ts).
    private const val MAX_TINT_ALPHA = 0.35f

    private fun logWarning(message: String) {
      Log.w(TAG, message)
    }
  }

  init {
    // Library defaults tuned for standalone use, wrong for RN: cornerRadius
    // defaults to 999f (a pill) and must instead follow the RN border radius;
    // one-shot backdrop capture freezes the glass the moment anything behind
    // it scrolls or animates.
    glassView.cornerRadius = 0f
    glassView.enableDynamicBackground = true
    // MUST stay false. The library's GPU paths (HardwareBackdropBlur and the
    // AGSL GlassLensRenderer, both gated on this flag) record
    // backdropSource.draw() into a RenderNode on a hardware canvas. With an
    // ancestor as the source, that recording references the cached display
    // lists of the intermediate views — which still reference this glass
    // view's own RenderNode (the library's visibility trick only shields the
    // direct-child case) — producing a cyclic RenderNode and an infinite
    // RenderNode::prepareTreeImpl recursion that stack-overflows the render
    // thread. The software capture path is guarded correctly (draw() returns
    // early during capture) and is safe for ancestor sources on every API
    // level.
    glassView.useHardwareBlurWhenPossible = false
    addView(glassView, LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT))
    glassView.addView(contentView, LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT))
    clipChildren = true
    clipToOutline = true
  }

  override fun onAttachedToWindow() {
    super.onAttachedToWindow()

    // The library captures the glass view's direct parent by default — here
    // that is this wrapper, which contains nothing behind the glass. Re-root
    // the capture at the nearest react-native-screens Screen (or the
    // ReactRootView) so the glass refracts the content behind it, matching
    // iOS semantics. Posted rather than run synchronously: on a re-attach
    // during navigation the parent chain up to the Screen ancestor is not
    // always settled yet (same reasoning as ReactNativeBlurView).
    val runnable = Runnable {
      initRunnable = null
      glassView.backdropSource =
        findNearestScreenAncestor() ?: findNearestReactRootView() ?: parent as? View
    }
    initRunnable = runnable
    post(runnable)
  }

  override fun onDetachedFromWindow() {
    super.onDetachedFromWindow()
    cleanup()
  }

  fun cleanup() {
    initRunnable?.let { removeCallbacks(it) }
    initRunnable = null
    // Drop the capture root so a detached-but-retained view doesn't leak the
    // previous Screen; re-resolved on the next attach.
    glassView.backdropSource = null
  }

  private fun findNearestScreenAncestor(): ViewGroup? {
    var currentParent = this.parent
    while (currentParent != null) {
      if (currentParent.javaClass.name == "com.swmansion.rnscreens.Screen") {
        return currentParent as? ViewGroup
      }
      currentParent = currentParent.parent
    }
    return null
  }

  private fun findNearestReactRootView(): ViewGroup? {
    var currentParent = this.parent
    while (currentParent != null) {
      if (currentParent.javaClass.name == "com.facebook.react.ReactRootView") {
        return currentParent as? ViewGroup
      }
      currentParent = currentParent.parent
    }
    return null
  }

  fun setGlassType(type: String) {
    glassView.material =
      if (type.equals("regular", ignoreCase = true)) GlassMaterial.REGULAR
      else GlassMaterial.CLEAR
  }

  /**
   * Set the glass tint color.
   * @param color Hex string (e.g. "#FF0000"), or "clear"/"transparent"/null for no tint
   */
  fun setGlassTintColor(color: String?) {
    glassTintColor =
      if (color == null || color.equals("clear", ignoreCase = true) ||
        color.equals("transparent", ignoreCase = true)
      ) {
        Color.TRANSPARENT
      } else {
        try {
          color.toColorInt()
        } catch (e: Exception) {
          logWarning("Invalid color format for glass tint: $color")
          Color.TRANSPARENT
        }
      }
    updateTintScrim()
  }

  fun setGlassOpacity(opacity: Float) {
    glassOpacity = opacity.coerceIn(0.0f, 1.0f)
    updateTintScrim()
  }

  fun setIsInteractive(interactive: Boolean) {
    // Closest analog of UIGlassEffect.isInteractive: the library's
    // press-elasticity scale animation.
    glassView.elasticity = if (interactive) DEFAULT_ELASTICITY else 0f
  }

  private fun updateTintScrim() {
    // A zero-alpha tint means "no tint" (mirrors the iOS branch that nils the
    // effect tint instead of resurrecting clear as opaque black, issue #113).
    val tintAlpha = Color.alpha(glassTintColor)
    if (tintAlpha == 0) {
      contentView.setBackgroundColor(Color.TRANSPARENT)
      return
    }
    val scrimAlpha =
      ((tintAlpha / 255f) * glassOpacity * MAX_TINT_ALPHA * 255f).toInt().coerceIn(0, 255)
    contentView.setBackgroundColor(
      Color.argb(
        scrimAlpha,
        Color.red(glassTintColor),
        Color.green(glassTintColor),
        Color.blue(glassTintColor)
      )
    )
  }

  fun setBorderRadius(radius: Float) {
    borderRadius = radius
    updateCornerRadius()
  }

  fun setBorderTopLeftRadius(radius: Float) {
    borderTopLeftRadius = radius
    updateCornerRadius()
  }

  fun setBorderTopRightRadius(radius: Float) {
    borderTopRightRadius = radius
    updateCornerRadius()
  }

  fun setBorderBottomLeftRadius(radius: Float) {
    borderBottomLeftRadius = radius
    updateCornerRadius()
  }

  fun setBorderBottomRightRadius(radius: Float) {
    borderBottomRightRadius = radius
    updateCornerRadius()
  }

  private fun convertDpToPx(dp: Float): Float {
    val displayMetrics = context.resources.displayMetrics
    return TypedValue.applyDimension(TypedValue.COMPLEX_UNIT_DIP, dp, displayMetrics)
  }

  private fun updateCornerRadius() {
    // Unset per-corner radii use the sentinel -1f (see the field defaults), so
    // test >= 0: an explicit 0 must override the base radius to square that
    // corner, only a negative sentinel falls back to baseRadius.
    val baseRadius = convertDpToPx(borderRadius)
    val topLeft = if (borderTopLeftRadius >= 0) convertDpToPx(borderTopLeftRadius) else baseRadius
    val topRight = if (borderTopRightRadius >= 0) convertDpToPx(borderTopRightRadius) else baseRadius
    val bottomLeft = if (borderBottomLeftRadius >= 0) convertDpToPx(borderBottomLeftRadius) else baseRadius
    val bottomRight = if (borderBottomRightRadius >= 0) convertDpToPx(borderBottomRightRadius) else baseRadius

    // The glass distortion field (bevel/refraction geometry) only supports a
    // uniform radius; per-corner differences are honored by the outline clip
    // below but the lens shape follows the base radius.
    glassView.cornerRadius = baseRadius

    val isUniform = topLeft == topRight && topRight == bottomLeft && bottomLeft == bottomRight

    if (isUniform) {
      outlineProvider = object : ViewOutlineProvider() {
        override fun getOutline(view: View, outline: Outline?) {
          outline?.setRoundRect(0, 0, view.width, view.height, baseRadius)
        }
      }
    } else {
      outlineProvider = object : ViewOutlineProvider() {
        override fun getOutline(view: View, outline: Outline?) {
          val path = Path()
          val radii = floatArrayOf(
            topLeft,
            topLeft,
            topRight,
            topRight,
            bottomRight,
            bottomRight,
            bottomLeft,
            bottomLeft
          )
          path.addRoundRect(0f, 0f, view.width.toFloat(), view.height.toFloat(), radii, Path.Direction.CW)
          if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            outline?.setPath(path)
          } else {
            @Suppress("DEPRECATION")
            outline?.setConvexPath(path)
          }
        }
      }
    }

    clipToOutline = true
    invalidateOutline()
  }

  override fun onMeasure(widthMeasureSpec: Int, heightMeasureSpec: Int) {
    // Trust React Native to provide correct dimensions; the glass chrome
    // always fills the wrapper exactly.
    val width = MeasureSpec.getSize(widthMeasureSpec)
    val height = MeasureSpec.getSize(heightMeasureSpec)
    glassView.measure(
      MeasureSpec.makeMeasureSpec(width, MeasureSpec.EXACTLY),
      MeasureSpec.makeMeasureSpec(height, MeasureSpec.EXACTLY)
    )
    setMeasuredDimension(width, height)
  }

  override fun onLayout(changed: Boolean, left: Int, top: Int, right: Int, bottom: Int) {
    // glassView (and, through FrameLayout, contentView) is internal chrome
    // laid out full-bleed here; the React children inside contentView are
    // positioned by React Native's UIManager and never touched (contentView
    // no-ops its own onLayout).
    glassView.layout(0, 0, right - left, bottom - top)
  }
}
