// ReactNativeBlurViewHelper.swift

import SwiftUI
import UIKit

// MARK: - Objective-C Bridging Helpers

@objc public class ReactNativeBlurViewHelper: NSObject {

  /// Creates and returns a view containing a colored rectangle.
  @objc public static func createBlurViewWithFrame(_ frame: CGRect) -> AdvancedBlurView {
    return AdvancedBlurView(frame: frame)
  }

  /// Updates the blur view with a new glass tint color.
  @objc public static func updateBlurView(_ blurView: AdvancedBlurView, withGlassTintColor glassTintColor: UIColor) {
    blurView.glassTintColor = glassTintColor
  }

  /// Updates the blur view with a new glass opacity.
  @objc public static func updateBlurView(_ blurView: AdvancedBlurView, withGlassOpacity glassOpacity: Double) {
    blurView.glassOpacity = glassOpacity
  }

  /// Updates the blur view with a new blur amount.
  @objc public static func updateBlurView(_ blurView: AdvancedBlurView, withBlurAmount blurAmount: Double) {
    blurView.blurAmount = blurAmount
  }

  /// Updates the blur view with a new blur type.
  @objc public static func updateBlurView(_ blurView: AdvancedBlurView, withBlurType blurType: String) {
    blurView.blurTypeString = blurType
  }

  /// Updates the blur view with a new glass type.
  @objc public static func updateBlurView(_ blurView: AdvancedBlurView, withGlassType glassType: String) {
    blurView.glassType = glassType
  }

  /// Updates the blur view with a new blur style.
  @objc public static func updateBlurView(_ blurView: AdvancedBlurView, withType type: String) {
    blurView.type = type
  }

  /// Updates the blur view with a new blur style.
  @objc public static func updateBlurView(_ blurView: AdvancedBlurView, withIsInteractive isInteractive: Bool) {
    blurView.isInteractive = isInteractive
  }

  /// Updates the blur view with a new reduced transparency fallback color.
  @objc public static func updateBlurView(_ blurView: AdvancedBlurView, withReducedTransparencyFallbackColor fallbackColor: UIColor) {
    blurView.reducedTransparencyFallbackColor = fallbackColor
  }

  /// No-op updater kept for API compatibility.
  @objc public static func updateBlurView(_ blurView: AdvancedBlurView) {
    // Nothing to update in the minimal implementation
  }
}