// ReactNativeLiquidGlassContainerHelper.swift

import UIKit

// MARK: - Objective-C Bridging Helpers for Liquid Glass Container

@objc public class ReactNativeLiquidGlassContainerHelper: NSObject {

  /// Creates and returns a liquid glass container view.
  @objc public static func createLiquidGlassContainerWithFrame(_ frame: CGRect) -> LiquidGlassContainer {
    return LiquidGlassContainer(frame: frame)
  }

  /// Updates the liquid glass container with a new spacing value.
  @objc public static func updateLiquidGlassContainer(_ container: LiquidGlassContainer, withSpacing spacing: Double) {
    container.spacing = CGFloat(spacing)
  }
}
