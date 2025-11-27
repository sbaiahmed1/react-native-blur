// ReactNativeLiquidGlassContainerHelper.swift

import UIKit

// MARK: - Objective-C Bridging Helpers for Liquid Glass Container

@objc public class ReactNativeLiquidGlassContainerHelper: NSObject {

  /// Creates and returns a liquid glass container view.
  @available(iOS 26.0, *)
  @objc public static func createLiquidGlassContainerWithFrame(_ frame: CGRect) -> LiquidGlassContainer {
    if #available(iOS 26.0, *) {
      return LiquidGlassContainer(frame: frame)
    } else {
      // Fallback on earlier versions: Provide a basic container to satisfy return type
      // This code path should not be reached due to @available on the method, but return a stub to satisfy the compiler.
      let fallback = LiquidGlassContainer(frame: frame)
      return fallback
    }
  }

  /// Updates the liquid glass container with a new spacing value.
  @available(iOS 26.0, *)
  @objc public static func updateLiquidGlassContainer(_ container: LiquidGlassContainer, withSpacing spacing: Double) {
    container.spacing = CGFloat(spacing)
  }
}
