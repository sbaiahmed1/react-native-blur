// LiquidGlassRules.swift

import Foundation

/// Whether an app renders Liquid Glass, from the facts that decide it. Follows expo-glass-effect.
enum LiquidGlassRules {
  /// `sdkMajor` is the SDK the app was built with, 0 when unknown. `requiresCompatibility` is the app's `UIDesignRequiresCompatibility`, nil when absent.
  static func isAvailable(osMajor: Int, compilerHasGlass: Bool, sdkMajor: Int, requiresCompatibility: Bool?) -> Bool {
    guard compilerHasGlass, osMajor >= 26 else { return false }
    // iOS 27 ignores UIDesignRequiresCompatibility in apps built with the iOS 27 SDK or later.
    if osMajor >= 27, sdkMajor >= 27 { return true }
    return !(requiresCompatibility ?? false)
  }
}
