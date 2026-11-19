package com.sbaiahmed1.reactnativeblur

// Packs ARGB like Color.argb, without the framework, so plain JVM tests can load the enum.
private fun argb(alpha: Int, red: Int, green: Int, blue: Int): Int = (alpha shl 24) or (red shl 16) or (green shl 8) or blue

enum class BlurType(val overlayColor: Int) {
  XLIGHT(argb(140, 240, 240, 240)),
  LIGHT(argb(42, 255, 255, 255)),
  DARK(argb(120, 26, 22, 22)),
  EXTRA_DARK(argb(160, 35, 35, 35)),
  REGULAR(argb(35, 255, 255, 255)),
  PROMINENT(argb(140, 240, 240, 240)),
  SYSTEM_ULTRA_THIN_MATERIAL(argb(75, 240, 240, 240)),
  SYSTEM_ULTRA_THIN_MATERIAL_LIGHT(argb(75, 240, 240, 240)),
  SYSTEM_ULTRA_THIN_MATERIAL_DARK(argb(65, 40, 40, 40)),
  SYSTEM_THIN_MATERIAL(argb(102, 240, 240, 240)),
  SYSTEM_THIN_MATERIAL_LIGHT(argb(102, 240, 240, 240)),
  SYSTEM_THIN_MATERIAL_DARK(argb(102, 35, 35, 35)),
  SYSTEM_MATERIAL(argb(140, 245, 245, 245)),
  SYSTEM_MATERIAL_LIGHT(argb(140, 245, 245, 245)),
  SYSTEM_MATERIAL_DARK(argb(215, 65, 60, 60)),
  SYSTEM_THICK_MATERIAL(argb(210, 248, 248, 248)),
  SYSTEM_THICK_MATERIAL_LIGHT(argb(210, 248, 248, 248)),
  SYSTEM_THICK_MATERIAL_DARK(argb(160, 35, 35, 35)),
  SYSTEM_CHROME_MATERIAL(argb(165, 248, 248, 248)),
  SYSTEM_CHROME_MATERIAL_LIGHT(argb(165, 248, 248, 248)),
  SYSTEM_CHROME_MATERIAL_DARK(argb(100, 32, 32, 32));

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
