package com.sbaiahmed1.reactnativeblur

import android.graphics.Color

enum class BlurType(val overlayColor: Int) {
  XLIGHT(Color.argb(25, 255, 255, 255)),
  LIGHT(Color.argb(40, 255, 255, 255)),
  DARK(Color.argb(60, 0, 0, 0)),
  EXTRA_DARK(Color.argb(80, 0, 0, 0)),
  REGULAR(Color.argb(50, 255, 255, 255)),
  PROMINENT(Color.argb(70, 255, 255, 255)),
  SYSTEM_ULTRA_THIN_MATERIAL(Color.argb(20, 255, 255, 255)),
  SYSTEM_THIN_MATERIAL(Color.argb(35, 255, 255, 255)),
  SYSTEM_MATERIAL(Color.argb(50, 255, 255, 255)),
  SYSTEM_THICK_MATERIAL(Color.argb(65, 255, 255, 255)),
  SYSTEM_CHROME_MATERIAL(Color.argb(45, 240, 240, 240));

  companion object {
    fun fromString(type: String): BlurType = when (type.lowercase()) {
      "xlight" -> XLIGHT
      "light" -> LIGHT
      "dark" -> DARK
      "extradark" -> EXTRA_DARK
      "regular" -> REGULAR
      "prominent" -> PROMINENT
      "systemultrathinmaterial" -> SYSTEM_ULTRA_THIN_MATERIAL
      "systemthinmaterial" -> SYSTEM_THIN_MATERIAL
      "systemmaterial" -> SYSTEM_MATERIAL
      "systemthickmaterial" -> SYSTEM_THICK_MATERIAL
      "systemchromematerial" -> SYSTEM_CHROME_MATERIAL
      else -> LIGHT
    }
  }
}
