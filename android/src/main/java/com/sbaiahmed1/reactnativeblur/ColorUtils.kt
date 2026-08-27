package com.sbaiahmed1.reactnativeblur

import android.graphics.Color

/** React Native hex strings are RGB/RGBA, not Android's ARGB convention. */
internal fun parseReactColor(color: String): Int {
  if (color.equals("clear", ignoreCase = true) || color.equals("transparent", ignoreCase = true)) {
    return Color.TRANSPARENT
  }
  if (!color.startsWith("#")) return Color.parseColor(color)

  val hex = when (color.length) {
    4, 5 -> buildString {
      for (index in 1 until color.length) {
        append(color[index])
        append(color[index])
      }
    }
    else -> color.substring(1)
  }
  val androidHex = if (hex.length == 8) hex.takeLast(2) + hex.dropLast(2) else hex
  return Color.parseColor("#$androidHex")
}
