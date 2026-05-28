package com.sbaiahmed1.reactnativeblur

import android.graphics.Color

enum class BlurType(val overlayColor: Int) {
  XLIGHT(Color.argb(140, 240, 240, 240)),
  LIGHT(Color.argb(42, 255, 255, 255)),
  DARK(Color.argb(120, 26, 22, 22)),
  EXTRA_DARK(Color.argb(160, 35, 35, 35)),
  REGULAR(Color.argb(35, 255, 255, 255)),
  PROMINENT(Color.argb(140, 240, 240, 240)),
  SYSTEM_ULTRA_THIN_MATERIAL(Color.argb(75, 240, 240, 240)),
  SYSTEM_ULTRA_THIN_MATERIAL_LIGHT(Color.argb(75, 240, 240, 240)),
  SYSTEM_ULTRA_THIN_MATERIAL_DARK(Color.argb(65, 40, 40, 40)),
  SYSTEM_THIN_MATERIAL(Color.argb(102, 240, 240, 240)),
  SYSTEM_THIN_MATERIAL_LIGHT(Color.argb(102, 240, 240, 240)),
  SYSTEM_THIN_MATERIAL_DARK(Color.argb(102, 35, 35, 35)),
  SYSTEM_MATERIAL(Color.argb(140, 245, 245, 245)),
  SYSTEM_MATERIAL_LIGHT(Color.argb(140, 245, 245, 245)),
  SYSTEM_MATERIAL_DARK(Color.argb(215, 65, 60, 60)),
  SYSTEM_THICK_MATERIAL(Color.argb(210, 248, 248, 248)),
  SYSTEM_THICK_MATERIAL_LIGHT(Color.argb(210, 248, 248, 248)),
  SYSTEM_THICK_MATERIAL_DARK(Color.argb(160, 35, 35, 35)),
  SYSTEM_CHROME_MATERIAL(Color.argb(165, 248, 248, 248)),
  SYSTEM_CHROME_MATERIAL_LIGHT(Color.argb(165, 248, 248, 248)),
  SYSTEM_CHROME_MATERIAL_DARK(Color.argb(100, 32, 32, 32));

  companion object {
    fun fromString(type: String): BlurType {
      return when (type.lowercase()) {
        "xlight" -> XLIGHT
        "light" -> LIGHT
        "dark" -> DARK
        "extradark" -> EXTRA_DARK
        "regular" -> REGULAR
        "prominent" -> PROMINENT
        "systemultrathinmaterial" -> SYSTEM_ULTRA_THIN_MATERIAL
        "systemultrathinmateriallight" -> SYSTEM_ULTRA_THIN_MATERIAL_LIGHT
        "systemultrathinmaterialdark" -> SYSTEM_ULTRA_THIN_MATERIAL_DARK
        "systemthinmaterial" -> SYSTEM_THIN_MATERIAL
        "systemthinmateriallight" -> SYSTEM_THIN_MATERIAL_LIGHT
        "systemthinmaterialdark" -> SYSTEM_THIN_MATERIAL_DARK
        "systemmaterial" -> SYSTEM_MATERIAL
        "systemmateriallight" -> SYSTEM_MATERIAL_LIGHT
        "systemmaterialdark" -> SYSTEM_MATERIAL_DARK
        "systemthickmaterial" -> SYSTEM_THICK_MATERIAL
        "systemthickmateriallight" -> SYSTEM_THICK_MATERIAL_LIGHT
        "systemthickmaterialdark" -> SYSTEM_THICK_MATERIAL_DARK
        "systemchromematerial" -> SYSTEM_CHROME_MATERIAL
        "systemchromemateriallight" -> SYSTEM_CHROME_MATERIAL_LIGHT
        "systemchromematerialdark" -> SYSTEM_CHROME_MATERIAL_DARK
        else -> XLIGHT
      }
    }
  }
}
