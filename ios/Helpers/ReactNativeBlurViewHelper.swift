// ReactNativeBlurViewHelper.swift

import SwiftUI
import UIKit

// MARK: - Objective-C Bridging Helpers

@objc public class ReactNativeBlurViewHelper: NSObject {

  /// Creates and returns a blur view.
  @objc public static func createBlurViewWithFrame(_ frame: CGRect) -> AdvancedBlurView {
    return AdvancedBlurView(frame: frame)
  }

  /// Updates the blur view with a new blur amount.
  @objc public static func updateBlurView(_ blurView: AdvancedBlurView, withBlurAmount blurAmount: Double) {
    blurView.blurAmount = blurAmount
  }

  /// Updates the blur view with a new blur type.
  @objc public static func updateBlurView(_ blurView: AdvancedBlurView, withBlurType blurType: String) {
    blurView.blurTypeString = blurType
  }

  /// Updates the blur view with a new reduced transparency fallback color.
  @objc public static func updateBlurView(_ blurView: AdvancedBlurView, withReducedTransparencyFallbackColor reducedTransparencyFallbackColor: UIColor) {
    blurView.reducedTransparencyFallbackColor = reducedTransparencyFallbackColor
  }
}

