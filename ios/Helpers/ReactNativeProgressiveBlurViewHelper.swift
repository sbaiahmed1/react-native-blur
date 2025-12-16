// ReactNativeProgressiveBlurViewHelper.swift

import SwiftUI
import UIKit

// MARK: - Objective-C Bridging Helpers for Progressive Blur

@objc public class ReactNativeProgressiveBlurViewHelper: NSObject {

  /// Creates and returns a progressive blur view.
  @objc public static func createProgressiveBlurViewWithFrame(_ frame: CGRect) -> ProgressiveBlurView {
    return ProgressiveBlurView(frame: frame)
  }

  /// Updates the progressive blur view with a new blur amount.
  @objc public static func updateProgressiveBlurView(_ blurView: ProgressiveBlurView, withBlurAmount blurAmount: Double) {
    blurView.blurAmount = blurAmount
  }

  /// Updates the progressive blur view with a new direction.
  @objc public static func updateProgressiveBlurView(_ blurView: ProgressiveBlurView, withDirection direction: String) {
    blurView.direction = direction
  }

  /// Updates the progressive blur view with a new start offset.
  @objc public static func updateProgressiveBlurView(_ blurView: ProgressiveBlurView, withStartOffset startOffset: Double) {
    blurView.startOffset = startOffset
  }

  /// Updates the progressive blur view with a new blur type.
  @objc public static func updateProgressiveBlurView(_ blurView: ProgressiveBlurView, withBlurType blurType: String) {
    blurView.blurTypeString = blurType
  }

  /// Updates the progressive blur view with a new reduced transparency fallback color.
  @objc public static func updateProgressiveBlurView(_ blurView: ProgressiveBlurView, withReducedTransparencyFallbackColor reducedTransparencyFallbackColor: UIColor) {
    blurView.reducedTransparencyFallbackColor = reducedTransparencyFallbackColor
  }

  /// Updates the progressive blur view with a new ignoreAccessibilityFallback value.
  @objc public static func updateProgressiveBlurView(_ blurView: ProgressiveBlurView, withIgnoringAccessibilityFallback ignoreAccessibilityFallback: Bool) {
    blurView.ignoreAccessibilityFallback = ignoreAccessibilityFallback
  }
}
