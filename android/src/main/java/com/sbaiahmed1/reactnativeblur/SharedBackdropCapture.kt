package com.sbaiahmed1.reactnativeblur

import android.graphics.Bitmap
import android.graphics.Canvas
import android.os.SystemClock
import android.util.Log
import android.view.View

/**
 * Deduplicates the software backdrop captures behind ReactNativeLiquidGlassView.
 *
 * Every glass view used to rasterize its capture root independently on the UI
 * thread — with N glass views on one screen that is N full software draws of
 * the same Screen every refresh tick, which is what dragged busy demo screens
 * down to ~20 fps. Instead, the root is captured ONCE per refresh interval
 * into a single downsampled bitmap shared by every glass view bound to that
 * root; each view then just blits its own sub-rect (see the caller).
 *
 * UI-thread only, like all view drawing; no synchronization needed.
 */
internal object SharedBackdropCapture {

  private const val LOG_TAG = "RNSharedBackdrop"
  private const val FAILED_CAPTURE_RETRY_MS = 500L
  private const val NO_FAILURE = -1L

  private class Entry {
    var bitmap: Bitmap? = null
    var canvas: Canvas? = null
    var lastCaptureUptimeMs = 0L
    var refCount = 0
    // Bumped on every successful capture so consumers can cheaply detect
    // whether the shared bitmap changed since they last consumed it.
    var generation = 0L
    var lastFailureUptimeMs = NO_FAILURE
    var failureLogged = false
  }

  private val entries = HashMap<View, Entry>()

  /**
   * True while a shared capture is rasterizing a source. Glass views check
   * this in draw() so that ALL of them are excluded from the shared backdrop
   * (each excluding only itself would refract other glass views' stale
   * frames into the backdrop).
   */
  var captureInProgress = false
    private set

  fun register(source: View) {
    val entry = entries.getOrPut(source) { Entry() }
    entry.refCount++
  }

  fun unregister(source: View) {
    val entry = entries[source] ?: return
    entry.refCount--
    if (entry.refCount <= 0) {
      entry.bitmap?.recycle()
      entries.remove(source)
    }
  }

  /**
   * Returns the shared downsampled capture of [source], re-rasterizing only
   * when the cached one is older than [maxAgeMs] — so any number of glass
   * views refreshing in the same interval share a single capture.
   */
  fun acquire(source: View, downsample: Int, maxAgeMs: Long): Bitmap? {
    val entry = entries[source] ?: return null
    if (source.width <= 0 || source.height <= 0) return null

    val bitmapWidth = (source.width / downsample).coerceAtLeast(1)
    val bitmapHeight = (source.height / downsample).coerceAtLeast(1)
    var bitmap = entry.bitmap
    val sizeChanged = bitmap == null || bitmap.width != bitmapWidth || bitmap.height != bitmapHeight
    if (sizeChanged) {
      entry.bitmap?.recycle()
      bitmap = Bitmap.createBitmap(bitmapWidth, bitmapHeight, Bitmap.Config.ARGB_8888)
      entry.bitmap = bitmap
      entry.canvas = Canvas(bitmap)
      entry.lastCaptureUptimeMs = 0L
    }

    val now = SystemClock.uptimeMillis()
    if (!sizeChanged && now - entry.lastCaptureUptimeMs < maxAgeMs) {
      return bitmap
    }
    // A source that failed to draw is retried every FAILED_CAPTURE_RETRY_MS, not on every tick.
    if (entry.lastFailureUptimeMs != NO_FAILURE && now - entry.lastFailureUptimeMs < FAILED_CAPTURE_RETRY_MS) {
      return bitmap
    }

    val canvas = entry.canvas ?: return bitmap
    bitmap!!.eraseColor(0)
    val save = canvas.save()
    canvas.scale(1f / downsample, 1f / downsample)
    captureInProgress = true
    var captured = true
    try {
      source.draw(canvas)
    } catch (e: Exception) {
      // A view that throws mid-draw leaves a partial backdrop until the next retry.
      entry.lastFailureUptimeMs = now
      if (!entry.failureLogged) {
        entry.failureLogged = true
        Log.w(LOG_TAG, "Backdrop capture failed: ${e.message}")
      }
      captured = false
    } finally {
      captureInProgress = false
      canvas.restoreToCount(save)
    }
    // Only a successful draw counts as fresh. A failed one is retried after FAILED_CAPTURE_RETRY_MS.
    if (captured) {
      entry.lastCaptureUptimeMs = now
      entry.generation++
      entry.lastFailureUptimeMs = NO_FAILURE
      entry.failureLogged = false
    }
    return bitmap
  }

  /** Generation of the last successful capture for [source]; consumers use it
   * to skip re-recording when neither the bitmap nor their sub-rect moved. */
  fun generationOf(source: View): Long = entries[source]?.generation ?: 0L

  /** The current shared bitmap for [source] WITHOUT capturing — safe to call
   * from inside a draw pass, where rasterizing the source is not. */
  fun peek(source: View): Bitmap? = entries[source]?.bitmap
}
