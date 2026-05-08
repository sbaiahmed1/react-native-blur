package com.sbaiahmed1.reactnativeblur

import android.app.Activity
import android.content.Context
import android.util.AttributeSet
import android.util.Log
import android.util.TypedValue
import android.view.View
import android.view.ViewGroup
import android.view.ViewParent
import android.widget.FrameLayout
import androidx.core.graphics.toColorInt
import com.facebook.react.bridge.ReactContext
import com.qmdeve.liquidglass.widget.LiquidGlassView

class ReactNativeLiquidGlassView : FrameLayout {

  private var liquidGlassView: LiquidGlassView? = null
  private val contentContainer: FrameLayout

  private var glassType: String = "clear"
  private var glassTintColor: Int = android.graphics.Color.TRANSPARENT
  private var glassOpacity: Float = 1.0f
  private var currentCornerRadius: Float = 0f
  private var isInteractive: Boolean = true
  private var isBound: Boolean = false

  companion object {
    private const val TAG = "ReactNativeLiquidGlass"
    private const val CLEAR_REFRACTION_HEIGHT_DP = 30f
    private const val CLEAR_REFRACTION_OFFSET_DP = 80f
    private const val CLEAR_BLUR_RADIUS = 15f
    private const val CLEAR_DISPERSION = 0.8f
    private const val REGULAR_REFRACTION_HEIGHT_DP = 30f
    private const val REGULAR_REFRACTION_OFFSET_DP = 80f
    private const val REGULAR_BLUR_RADIUS = 15f
    private const val REGULAR_DISPERSION = 0.8f
  }

  constructor(context: Context) : super(context) {
    contentContainer = FrameLayout(context).apply {
      setWillNotDraw(false)
    }
    setupView()
  }

  constructor(context: Context, attrs: AttributeSet?) : super(context, attrs) {
    contentContainer = FrameLayout(context).apply {
      setWillNotDraw(false)
    }
    setupView()
  }

  private fun setupView() {
    setLayerType(View.LAYER_TYPE_HARDWARE, null)
    setWillNotDraw(false)
    
    // Add content container first (React Native children go here)
    contentContainer.layoutParams = LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT)
    addView(contentContainer)

    // Use Activity context for LiquidGlassView (matches working test activity)
    val activityContext = (context as? ReactContext)?.currentActivity ?: context

    // Add liquid glass view on top
    liquidGlassView = LiquidGlassView(activityContext).apply {
      layoutParams = LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT)
      setLayerType(View.LAYER_TYPE_HARDWARE, null)
    }
    addView(liquidGlassView)
    
    // Diagnostics: log hardware acceleration status after layout
    post {
      logHardwareAcceleration()
    }
  }
  
  private fun logHardwareAcceleration() {
    val lv = liquidGlassView ?: return
    Log.d(TAG, "=== Hardware Acceleration Diagnostics ===")
    Log.d(TAG, "self(isHardwareAccelerated=${isHardwareAccelerated}, layerType=${layerType})")
    Log.d(TAG, "contentContainer(isHardwareAccelerated=${contentContainer.isHardwareAccelerated}, layerType=${contentContainer.layerType})")
    Log.d(TAG, "liquidGlassView(isHardwareAccelerated=${lv.isHardwareAccelerated}, layerType=${lv.layerType})")
    if (lv.childCount > 0) {
      val inner = lv.getChildAt(0)
      Log.d(TAG, "liquidGlassView.child[0](isHardwareAccelerated=${inner.isHardwareAccelerated}, layerType=${inner.layerType}, class=${inner::class.simpleName})")
    }
    val activity = (context as? ReactContext)?.currentActivity
    Log.d(TAG, "activity=$activity, window=${activity?.window}")
    var p: ViewParent? = this.parent
    var depth = 0
    while (p != null && depth < 10) {
      if (p is View) {
        Log.d(TAG, "  parent[$depth](${p::class.simpleName}: isHardwareAccelerated=${p.isHardwareAccelerated}, layerType=${p.layerType})")
      } else {
        Log.d(TAG, "  parent[$depth](${p::class.simpleName}: not a View)")
      }
      p = p.parent
      depth++
    }
    Log.d(TAG, "=== End Diagnostics ===")
  }

  fun addReactSubview(child: View, index: Int) {
    contentContainer.addView(child, index)
    Log.d(TAG, "addReactSubview: child added, contentContainer now has ${contentContainer.childCount} children")
    contentContainer.postOnAnimation {
      bindGlassSource()
    }
    // Post a delayed diagnostic to check LiquidGlass internals after everything settles
    postDelayed({
      diagnoseLiquidGlassInternals()
    }, 500)
  }
  
  private fun diagnoseLiquidGlassInternals() {
    val lv = liquidGlassView ?: return
    Log.d(TAG, "=== LiquidGlass Internals Diagnostic ===")
    Log.d(TAG, "liquidGlassView: w=${lv.width}, h=${lv.height}, measuredW=${lv.measuredWidth}, measuredH=${lv.measuredHeight}")
    Log.d(TAG, "liquidGlassView: childCount=${lv.childCount}")
    for (i in 0 until lv.childCount) {
      val child = lv.getChildAt(i)
      Log.d(TAG, "  liquidGlassView.child[$i]: class=${child::class.simpleName}, vis=${child.visibility}, w=${child.width}, h=${child.height}, measuredW=${child.measuredWidth}, measuredH=${child.measuredHeight}, willNotDraw=${child.willNotDraw()}")
    }
    try {
      val glassChild = lv.getChildAt(0)
      if (glassChild != null && glassChild::class.simpleName == "LiquidGlass") {
        // Force layout on LiquidGlass child
        if (glassChild.width == 0 || glassChild.height == 0) {
          Log.d(TAG, "  LiquidGlass has 0 dimensions! Forcing layout...")
          glassChild.forceLayout()
          lv.requestLayout()
          lv.invalidate()
        }
        
        val implField = glassChild.javaClass.getDeclaredField("impl")
        implField.isAccessible = true
        val impl = implField.get(glassChild)
        Log.d(TAG, "  LiquidGlass.impl = $impl")
        if (impl != null) {
          val targetField = impl.javaClass.getDeclaredField("target")
          targetField.isAccessible = true
          val target = targetField.get(impl)
          Log.d(TAG, "  LiquidGlassimpl.target = $target (class=${target?.javaClass?.simpleName})")
          if (target is View) {
            Log.d(TAG, "  target: w=${target.width}, h=${target.height}, willNotDraw=${target.willNotDraw()}")
          }
          val nodeField = impl.javaClass.getDeclaredField("node")
          nodeField.isAccessible = true
          val node = nodeField.get(impl)
          Log.d(TAG, "  LiquidGlassimpl.node = $node")
        }
      }
    } catch (e: Exception) {
      Log.e(TAG, "  Reflection failed: ${e.message}", e)
    }
    try {
      val sourceField = lv.javaClass.getDeclaredField("customSource")
      sourceField.isAccessible = true
      val customSource = sourceField.get(lv)
      Log.d(TAG, "  LiquidGlassView.customSource = $customSource (class=${customSource?.javaClass?.simpleName})")
    } catch (e: Exception) {
      Log.e(TAG, "  customSource reflection failed: ${e.message}", e)
    }
    
    // Try to check what LiquidGlassView.onLayout does
    try {
      val onLayoutMethod = lv.javaClass.getDeclaredMethod("onLayout", Boolean::class.javaPrimitiveType, Int::class.javaPrimitiveType, Int::class.javaPrimitiveType, Int::class.javaPrimitiveType, Int::class.javaPrimitiveType)
      Log.d(TAG, "  LiquidGlassView has own onLayout method: ${onLayoutMethod.declaringClass.simpleName}")
    } catch (e: Exception) {
      Log.d(TAG, "  LiquidGlassView onLayout: not found or error - ${e.message}")
    }
    
    // Check superclass chain
    var klass: Class<*>? = lv.javaClass
    var depth = 0
    while (klass != null && depth < 5) {
      Log.d(TAG, "  LiquidGlassView superclass[$depth] = ${klass.simpleName}")
      klass = klass.superclass
      depth++
    }
    
    Log.d(TAG, "=== End Internals Diagnostic ===")
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
    contentContainer.postOnAnimation {
      bindGlassSource()
    }
  }

  override fun onLayout(changed: Boolean, left: Int, top: Int, right: Int, bottom: Int) {
    super.onLayout(changed, left, top, right, bottom)
    val w = right - left
    val h = bottom - top
    val ccw = contentContainer.width
    val cch = contentContainer.height
    val lgw = liquidGlassView?.width ?: 0
    val lgh = liquidGlassView?.height ?: 0
    Log.d(TAG, "onLayout: self=${w}x${h}, contentContainer=${ccw}x${cch}, liquidGlass=${lgw}x${lgh}")
    
    // Force LiquidGlassView to layout its internal LiquidGlass child
    // LiquidGlassView extends ViewGroup and its onLayout may not properly
    // measure/layout LiquidGlass in React Native's view hierarchy
    val lv = liquidGlassView
    if (lv != null && lv.childCount > 0) {
      val glassChild = lv.getChildAt(0)
      if (glassChild.width == 0 || glassChild.height == 0) {
        Log.d(TAG, "onLayout: forcing LiquidGlass measure/layout (was ${glassChild.width}x${glassChild.height})")
        val spec = View.MeasureSpec.makeMeasureSpec(lv.width, View.MeasureSpec.EXACTLY)
        glassChild.measure(spec, spec)
        glassChild.layout(0, 0, lv.width, lv.height)
        Log.d(TAG, "onLayout: LiquidGlass after force: ${glassChild.width}x${glassChild.height}")
      }
    }
  }

  private fun bindGlassSource() {
    val glassView = liquidGlassView ?: return
    
    if (contentContainer.childCount == 0) {
      Log.d(TAG, "bindGlassSource: contentContainer empty, deferring")
      return
    }
    
    try {
      Log.d(TAG, "bindGlassSource: Binding to contentContainer (${contentContainer.childCount} children, size=${contentContainer.width}x${contentContainer.height})")
      Log.d(TAG, "bindGlassSource: glassView.isHardwareAccelerated=${glassView.isHardwareAccelerated}, self.isHardwareAccelerated=${isHardwareAccelerated}")
      glassView.bind(contentContainer)
      isBound = true
      Log.d(TAG, "bindGlassSource: Bind complete")
      
      updateGlassEffect()
      glassView.invalidate()
      
      // Force layout of LiquidGlass child - LiquidGlassView extends ViewGroup and
      // its internal LiquidGlass child may not get measured/laid out in RN hierarchy
      forceLiquidGlassLayout()
      
      // Log diagnostics after binding
      post {
        logHardwareAcceleration()
        forceLiquidGlassLayout()
      }
    } catch (e: Exception) {
      Log.e(TAG, "bindGlassSource: Exception", e)
    }
  }
  
  private fun forceLiquidGlassLayout() {
    val lv = liquidGlassView ?: return
    if (lv.childCount > 0) {
      val glassChild = lv.getChildAt(0)
      if (glassChild.width == 0 || glassChild.height == 0) {
        Log.d(TAG, "forceLiquidGlassLayout: forcing (was ${glassChild.width}x${glassChild.height}, parent=${lv.width}x${lv.height})")
        val wSpec = View.MeasureSpec.makeMeasureSpec(lv.width, View.MeasureSpec.EXACTLY)
        val hSpec = View.MeasureSpec.makeMeasureSpec(lv.height, View.MeasureSpec.EXACTLY)
        glassChild.measure(wSpec, hSpec)
        glassChild.layout(0, 0, lv.width, lv.height)
        Log.d(TAG, "forceLiquidGlassLayout: now ${glassChild.width}x${glassChild.height}")
      }
    }
  }

  override fun onDetachedFromWindow() {
    liquidGlassView = null
    isBound = false
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

    // Match the library's default/example values
    glassView.setRefractionHeight(dpToPx(20f))
    glassView.setRefractionOffset(dpToPx(70f))
    glassView.setBlurRadius(0.01f)
    glassView.setDispersion(0.5f)
    glassView.setCornerRadius(dpToPx(40f))
    
    glassView.setTintColorRed(1.0f)
    glassView.setTintColorGreen(1.0f)
    glassView.setTintColorBlue(1.0f)
    glassView.setTintAlpha(0.0f)
    
    glassView.setTouchEffectEnabled(isInteractive)
    glassView.setElasticEnabled(false)
    glassView.setDraggableEnabled(false)
    
    Log.d(TAG, "updateGlassEffect: library default values, interactive=$isInteractive")
  }

  private fun updateCornerRadius() {
    val glassView = liquidGlassView ?: return
    val radiusInPixels = dpToPx(currentCornerRadius)
    glassView.setCornerRadius(radiusInPixels)
  }

  private fun dpToPx(value: Float): Float {
    return TypedValue.applyDimension(
      TypedValue.COMPLEX_UNIT_DIP,
      value,
      context.resources.displayMetrics
    )
  }
}
