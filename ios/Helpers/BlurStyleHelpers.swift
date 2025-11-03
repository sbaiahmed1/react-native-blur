// BlurStyleHelpers.swift

import SwiftUI
import UIKit

// MARK: - Style Mapping Helper Functions

/// Maps string blur style names to UIBlurEffect.Style values
func blurStyleFromString(_ styleString: String) -> UIBlurEffect.Style {
  switch styleString {
  case "xlight":
    return .extraLight
  case "light":
    return .light
  case "dark":
    return .dark
  case "extraDark":
    return .systemThickMaterialDark
  case "regular":
    return .regular
  case "prominent":
    return .prominent
  case "systemUltraThinMaterial":
    return .systemUltraThinMaterial
  case "systemThinMaterial":
    return .systemThinMaterial
  case "systemMaterial":
    return .systemMaterial
  case "systemThickMaterial":
    return .systemThickMaterial
  case "systemChromeMaterial":
    return .systemChromeMaterial
  default:
    return .extraLight
  }
}

/// Maps string glass type names to Glass effect values (iOS 26.0+)
@available(iOS 26.0, *)
func glassEffectFromString(_ glassTypeString: String) -> Glass {
  switch glassTypeString {
  case "regular":
    return .regular
  case "clear":
    return .clear
  default:
    return .clear
  }
}

// MARK: - Blur Amount Mapping

/// Maps blur amount (0-100) to proper blur intensity using UIViewPropertyAnimator approach
func mapBlurAmountToIntensity(_ amount: Double) -> Double {
  let clampedAmount = max(0.0, min(100.0, amount))

  // Map 0-100 to 0-1.0 intensity for smooth progression
  return clampedAmount / 100.0
}
