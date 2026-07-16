package com.sbaiahmed1.reactnativeblur

import android.content.Context
import android.util.AttributeSet
import android.util.Log
import android.util.TypedValue
import android.view.MotionEvent
import com.qmdeve.blurview.widget.BlurSwitchButtonView

/**
 * Android implementation of React Native BlurSwitch component.
 * Provides a blur switch button using the QmBlurView library.
 *
 * QmBlurView is a high-performance blur library that uses native blur algorithms
 * implemented with underlying Native calls for optimal performance.
 *
 * Note: You only need to set the base color (trackColorOn), and QmBlurView will
 * automatically calculate the colors for on and off states. The thumbColor and
 * trackColorOff props are not supported by this component.
 */
class ReactNativeBlurSwitch : BlurSwitchButtonView {
  private var onValueChangeListener: ((Boolean) -> Unit)? = null
  private var currentValue = false
  private var isDisabled = false
  private var currentBlurRounds = DEFAULT_BLUR_ROUNDS

  companion object {
    private const val TAG = "ReactNativeBlurSwitch"
    private const val DEFAULT_BLUR_ROUNDS = 5
    private const val DEFAULT_WIDTH_DP = 65f
    private const val DEFAULT_HEIGHT_DP = 36f
    private const val MIN_BLUR_AMOUNT = 0f
    private const val MAX_BLUR_AMOUNT = 100f
    // Kept equal to MAX_BLUR_AMOUNT so blurAmount maps 1:1 to the QmBlurView
    // radius, matching ReactNativeBlurView and ReactNativeProgressiveBlurView.
    // (The switch previously used 25f, making the same blurAmount render a
    // weaker blur than the other components.)
    private const val MAX_BLUR_RADIUS = 100f
    private const val DEBUG = false

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
     * Maps blur amount (0-100) 1:1 to the QmBlurView blur radius, matching the
     * other blur components.
     * @param amount The blur amount from 0-100
     * @return The corresponding blur radius
     */
    private fun mapBlurAmountToRadius(amount: Float): Float {
      val clampedAmount = amount.coerceIn(MIN_BLUR_AMOUNT, MAX_BLUR_AMOUNT)
      return (clampedAmount / MAX_BLUR_AMOUNT) * MAX_BLUR_RADIUS
    }
  }

  constructor(context: Context?) : super(context, null) {
    initializeSwitch()
  }

  constructor(context: Context?, attrs: AttributeSet?) : super(context, attrs) {
    initializeSwitch()
  }

  /**
   * Initialize the blur switch with default settings.
   */
  private fun initializeSwitch() {
    try {
      blurRounds = currentBlurRounds

      setOnCheckedChangeListener { isChecked ->
        if (isDisabled) {
          setChecked(currentValue, false)
          return@setOnCheckedChangeListener
        }
        if (currentValue != isChecked) {
          currentValue = isChecked
          onValueChangeListener?.invoke(isChecked)
          logDebug("Value changed: $isChecked")
        }
      }
      logDebug("BlurSwitch initialized")
    } catch (e: Exception) {
      logError("Failed to initialize switch: ${e.message}", e)
    }
  }

  /**
   * Cleanup method to reset state.
   *
   * Only called from the view manager's onDropViewInstance, i.e. when React
   * Native is truly done with this view. It must NOT run on a plain
   * onDetachedFromWindow: react-native-screens detaches inactive screens and
   * FlatList's removeClippedSubviews detaches off-screen cells, and the
   * listeners are only wired in the constructor and createViewInstance. Tearing
   * them down on detach left the switch permanently unable to report toggles
   * after the user navigated away and back.
   */
  fun cleanup() {
    setOnCheckedChangeListener(null)
    onValueChangeListener = null
    logDebug("View cleaned up")
  }

  /**
   * Set the switch value.
   * @param value The boolean value (true = on, false = off)
   */
  fun setValue(value: Boolean) {
    if (currentValue != value) {
      currentValue = value
      setChecked(value, false)
      logDebug("setValue: $value")
    }
  }

  /**
   * Set the value change listener.
   * @param listener The callback to invoke when value changes
   */
  fun setOnValueChangeListener(listener: ((Boolean) -> Unit)?) {
    onValueChangeListener = listener
  }

  /**
   * Set the thumb color.
   * @param color The color int for the thumb
   */
  fun setThumbColor(color: Int) {
    logDebug("setThumbColor: $color (not supported by BlurSwitchButtonView)")
  }

  /**
   * Set the track color when switch is off.
   * @param color The color int for the off state track
   */
  fun setTrackColorOff(color: Int) {
    logDebug("setTrackColorOff: $color (not supported by BlurSwitchButtonView)")
  }

  /**
   * Set the track color when switch is on.
   * @param color The color int for the on state track
   */
  fun setTrackColorOn(color: Int) {
    try {
      setBaseColor(color)
      logDebug("setTrackColorOn: $color")
    } catch (e: Exception) {
      logError("Failed to set track color: ${e.message}", e)
    }
  }

  /**
   * Set the blur amount with cross-platform mapping.
   * @param amount The blur amount value (0-100)
   */
  fun setBlurAmount(amount: Float) {
    val radius = mapBlurAmountToRadius(amount)
    logDebug("setBlurAmount: $amount -> $radius")

    try {
      setBlurRadius(radius)
    } catch (e: Exception) {
      logError("Failed to set blur radius: ${e.message}", e)
    }
  }

  /**
   * Set the number of blur rounds.
   * @param rounds The number of blur rounds (1-15)
   */
  fun setRounds(rounds: Int) {
    val blurRounds = rounds.coerceIn(1, 15)
    currentBlurRounds = blurRounds
    logDebug("setRounds: $rounds -> $blurRounds")

    try {
      super.setBlurRounds(blurRounds)
    } catch (e: Exception) {
      logError("Failed to set blur rounds: ${e.message}", e)
    }
  }

  /**
   * Set whether the switch is disabled.
   * @param disabled True to disable, false to enable
   */
  fun setDisabled(disabled: Boolean) {
    isDisabled = disabled
    isEnabled = !disabled
    isClickable = !disabled
    alpha = if (disabled) 0.5f else 1f
    logDebug("setDisabled: $disabled")
  }

  override fun onTouchEvent(event: MotionEvent?): Boolean {
    if (isDisabled) {
      return false
    }
    return super.onTouchEvent(event)
  }

  override fun dispatchTouchEvent(event: MotionEvent?): Boolean {
    if (isDisabled) {
      return false
    }
    return super.dispatchTouchEvent(event)
  }

  override fun onMeasure(widthMeasureSpec: Int, heightMeasureSpec: Int) {
    val defaultWidth = TypedValue.applyDimension(
      TypedValue.COMPLEX_UNIT_DIP,
      DEFAULT_WIDTH_DP,
      context.resources.displayMetrics
    ).toInt()

    val defaultHeight = TypedValue.applyDimension(
      TypedValue.COMPLEX_UNIT_DIP,
      DEFAULT_HEIGHT_DP,
      context.resources.displayMetrics
    ).toInt()

    val width = resolveSize(defaultWidth, widthMeasureSpec)
    val height = resolveSize(defaultHeight, heightMeasureSpec)

    setMeasuredDimension(width, height)
  }
}

