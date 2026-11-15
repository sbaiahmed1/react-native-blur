package com.sbaiahmed1.reactnativeblur

/** Region shape, cadence and failure backoff of one capture lane, the hosts that share a downsample factor. */
internal class CaptureLane(
  val downsample: Int,
  val mode: Mode,
  private val minIntervalMs: Long,
  private val idleIntervalMs: Long
) {
  enum class Mode { FULL, HOST }

  data class Bounds(val left: Int, val top: Int, val width: Int, val height: Int)

  private var lastCaptureMs = NEVER
  private var lastFailureMs = NEVER

  /** The area a capture draws for [host]: the whole root in FULL mode, the host in HOST mode or when it captures [alone]. Null when it is empty. */
  fun regionBounds(root: Bounds, host: Bounds, alone: Boolean = false): Bounds? {
    val bounds = if (mode == Mode.FULL && !alone) root else host
    return if (bounds.width <= 0 || bounds.height <= 0) null else bounds
  }

  /** What one frame captures: the shared root (null) when a host reads it, then each host that captures alone. */
  fun <H : Any> captureTargets(hosts: List<H>, nested: Set<H>): List<H?> =
    if (mode == Mode.HOST) hosts
    else buildList {
      if (hosts.any { it !in nested }) add(null)
      for (host in hosts) if (host in nested) add(host)
    }

  /** True when a host reads the shared root capture. A host inside another host captures alone, so the outer one stays in its backdrop. */
  fun sharesRoot(nested: Boolean): Boolean = mode == Mode.FULL && !nested

  // Rounded up, so a root whose size is not a multiple of downsample keeps its last partial row and column.
  fun bitmapSize(region: Bounds): Pair<Int, Int> =
    ceilDiv(region.width).coerceAtLeast(1) to ceilDiv(region.height).coerceAtLeast(1)

  private fun ceilDiv(px: Int): Int = (px + downsample - 1) / downsample

  fun isDue(nowMs: Long, anyHostMoved: Boolean): Boolean = remainingMs(nowMs, anyHostMoved) == 0L

  /** Milliseconds until the lane may capture again, 0 when it may capture now. */
  fun remainingMs(nowMs: Long, anyHostMoved: Boolean): Long {
    if (lastFailureMs != NEVER) {
      val backoff = lastFailureMs + FAILED_CAPTURE_RETRY_MS - nowMs
      if (backoff > 0) return backoff
    }
    if (lastCaptureMs == NEVER) return 0L
    val interval = if (anyHostMoved) minIntervalMs else idleIntervalMs
    return (lastCaptureMs + interval - nowMs).coerceAtLeast(0L)
  }

  fun onCaptureResult(nowMs: Long, success: Boolean) {
    if (success) {
      lastCaptureMs = nowMs
      lastFailureMs = NEVER
    } else {
      lastFailureMs = nowMs
    }
  }

  companion object {
    const val FAILED_CAPTURE_RETRY_MS = 500L
    private const val NEVER = Long.MIN_VALUE
  }
}
