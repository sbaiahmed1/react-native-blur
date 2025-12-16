// ReactNativeLiquidGlassViewHelper.swift

import SwiftUI
import UIKit

// MARK: - Objective-C Bridging Helpers for Liquid Glass

@objc public class ReactNativeLiquidGlassViewHelper: NSObject {

  /// Creates and returns a liquid glass view container.
  @objc public static func createLiquidGlassViewWithFrame(_ frame: CGRect) -> LiquidGlassContainerView {
    return LiquidGlassContainerView(frame: frame)
  }

  /// Updates the liquid glass view with a new glass tint color.
  @objc public static func updateLiquidGlassView(_ liquidGlassView: LiquidGlassContainerView, withGlassTintColor glassTintColor: UIColor) {
    liquidGlassView.glassTintColor = glassTintColor
  }

  /// Updates the liquid glass view with a new glass opacity.
  @objc public static func updateLiquidGlassView(_ liquidGlassView: LiquidGlassContainerView, withGlassOpacity glassOpacity: Double) {
    liquidGlassView.glassOpacity = glassOpacity
  }

  /// Updates the liquid glass view with a new glass type.
  @objc public static func updateLiquidGlassView(_ liquidGlassView: LiquidGlassContainerView, withGlassType glassType: String) {
    liquidGlassView.glassType = glassType
  }

  /// Updates the liquid glass view with a new interactivity setting.
  @objc public static func updateLiquidGlassView(_ liquidGlassView: LiquidGlassContainerView, withIsInteractive isInteractive: Bool) {
    liquidGlassView.isInteractive = isInteractive
  }

  /// Updates the liquid glass view with a new safe area setting.
  @objc public static func updateLiquidGlassView(_ liquidGlassView: LiquidGlassContainerView, withIgnoringSafeArea ignoreSafeArea: Bool) {
    liquidGlassView.ignoreSafeArea = ignoreSafeArea
  }

  /// Updates the liquid glass view with a new reduced transparency fallback color.
  @objc public static func updateLiquidGlassView(_ liquidGlassView: LiquidGlassContainerView, withReducedTransparencyFallbackColor reducedTransparencyFallbackColor: UIColor) {
    liquidGlassView.reducedTransparencyFallbackColor = reducedTransparencyFallbackColor
  }

  /// Updates the liquid glass view with a new ignoreAccessibilityFallback value.
  @objc public static func updateLiquidGlassView(_ liquidGlassView: LiquidGlassContainerView, withIgnoringAccessibilityFallback ignoreAccessibilityFallback: Bool) {
    liquidGlassView.ignoreAccessibilityFallback = ignoreAccessibilityFallback
  }
}
