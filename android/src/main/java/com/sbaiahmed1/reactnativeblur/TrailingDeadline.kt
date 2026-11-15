package com.sbaiahmed1.reactnativeblur

/** The time of the one pending trailing frame, which an earlier request replaces. */
internal class TrailingDeadline {
  private var dueMs = NONE

  /** True when a callback must be posted for [nowMs] + [delayMs], in place of any pending one. */
  fun request(nowMs: Long, delayMs: Long): Boolean {
    val due = nowMs + delayMs
    if (dueMs != NONE && dueMs <= due) return false
    dueMs = due
    return true
  }

  fun clear() {
    dueMs = NONE
  }

  private companion object {
    const val NONE = Long.MIN_VALUE
  }
}
