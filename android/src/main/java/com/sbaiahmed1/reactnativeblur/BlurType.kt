package com.sbaiahmed1.reactnativeblur

import android.content.res.Configuration
import android.graphics.Color

/**
 * Enum representing different blur types with their corresponding overlay colors.
 * Maps iOS blur types to Android overlay colors to approximate the visual appearance.
 */
enum class BlurType(val overlayColor: Int) {
  XLIGHT(Color.argb(140, 240, 240, 240)),
  LIGHT(Color.argb(42, 255, 255, 255)),
  DARK(Color.argb(120, 26, 22, 22)),
  EXTRA_DARK(Color.argb(160, 35, 35, 35)),
  REGULAR_LIGHT(Color.argb(35, 255, 255, 255)),
  REGULAR_DARK(Color.argb(35, 28, 28, 30)),
  PROMINENT_LIGHT(Color.argb(140, 240, 240, 240)),
  PROMINENT_DARK(Color.argb(140, 28, 28, 30)),
  SYSTEM_ULTRA_THIN_MATERIAL_LIGHT(Color.argb(75, 240, 240, 240)),
  SYSTEM_ULTRA_THIN_MATERIAL_DARK(Color.argb(65, 40, 40, 40)),
  SYSTEM_THIN_MATERIAL_LIGHT(Color.argb(102, 240, 240, 240)),
  SYSTEM_THIN_MATERIAL_DARK(Color.argb(102, 35, 35, 35)),
  SYSTEM_MATERIAL_LIGHT(Color.argb(140, 245, 245, 245)),
  SYSTEM_MATERIAL_DARK(Color.argb(215, 65, 60, 60)),
  SYSTEM_THICK_MATERIAL_LIGHT(Color.argb(210, 248, 248, 248)),
  SYSTEM_THICK_MATERIAL_DARK(Color.argb(160, 35, 35, 35)),
  SYSTEM_CHROME_MATERIAL_LIGHT(Color.argb(165, 248, 248, 248)),
  SYSTEM_CHROME_MATERIAL_DARK(Color.argb(100, 32, 32, 32));

  companion object {
    /**
     * Get BlurType from string, with fallback to LIGHT for unknown types.
     * Uses the provided configuration to determine if dark mode is active for
     * appropriate defaults.
     */
    fun fromString(type: String, configuration: Configuration): BlurType {
      val isDarkMode = (configuration.uiMode and Configuration.UI_MODE_NIGHT_MASK) == Configuration.UI_MODE_NIGHT_YES

      return when (type.lowercase()) {
        "xlight" -> XLIGHT
        "light" -> LIGHT
        "dark" -> DARK
        "extradark" -> EXTRA_DARK
        "regular" -> if (isDarkMode) REGULAR_DARK else REGULAR_LIGHT
        "prominent" -> if (isDarkMode) PROMINENT_DARK else PROMINENT_LIGHT
        "systemultrathinmaterial" -> if (isDarkMode) SYSTEM_ULTRA_THIN_MATERIAL_DARK else SYSTEM_ULTRA_THIN_MATERIAL_LIGHT
        "systemultrathinmateriallight" -> SYSTEM_ULTRA_THIN_MATERIAL_LIGHT
        "systemultrathinmaterialdark" -> SYSTEM_ULTRA_THIN_MATERIAL_DARK
        "systemthinmaterial" -> if (isDarkMode) SYSTEM_THIN_MATERIAL_DARK else SYSTEM_THIN_MATERIAL_LIGHT
        "systemthinmateriallight" -> SYSTEM_THIN_MATERIAL_LIGHT
        "systemthinmaterialdark" -> SYSTEM_THIN_MATERIAL_DARK
        "systemmaterial" -> if (isDarkMode) SYSTEM_MATERIAL_DARK else SYSTEM_MATERIAL_LIGHT
        "systemmateriallight" -> SYSTEM_MATERIAL_LIGHT
        "systemmaterialdark" -> SYSTEM_MATERIAL_DARK
        "systemthickmaterial" -> if (isDarkMode) SYSTEM_THICK_MATERIAL_DARK else SYSTEM_THICK_MATERIAL_LIGHT
        "systemthickmateriallight" -> SYSTEM_THICK_MATERIAL_LIGHT
        "systemthickmaterialdark" -> SYSTEM_THICK_MATERIAL_DARK
        "systemchromematerial" -> if (isDarkMode) SYSTEM_CHROME_MATERIAL_DARK else SYSTEM_CHROME_MATERIAL_LIGHT
        "systemchromemateriallight" -> SYSTEM_CHROME_MATERIAL_LIGHT
        "systemchromematerialdark" -> SYSTEM_CHROME_MATERIAL_DARK
        else -> XLIGHT // default fallback
      }
    }
  }
}
