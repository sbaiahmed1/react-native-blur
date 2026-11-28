// LiquidGlassSupport.swift

import Foundation

/// Whether this app renders Liquid Glass, read once from the OS, the compiler and the app's Info.plist.
enum LiquidGlassSupport {
  static let isAvailable: Bool = {
    let info = Bundle.main.infoDictionary
    return LiquidGlassRules.isAvailable(
      osMajor: ProcessInfo.processInfo.operatingSystemVersion.majorVersion,
      compilerHasGlass: compilerHasGlass,
      sdkMajor: sdkMajor(info?["DTPlatformVersion"] as? String),
      requiresCompatibility: info?["UIDesignRequiresCompatibility"] as? Bool
    )
  }()

  // Swift 6.2 ships with Xcode 26, the first SDK with UIGlassEffect.
  private static var compilerHasGlass: Bool {
    #if compiler(>=6.2)
    return true
    #else
    return false
    #endif
  }

  // Xcode stamps the build SDK into DTPlatformVersion, such as "26.2".
  private static func sdkMajor(_ platformVersion: String?) -> Int {
    guard let platformVersion else { return 0 }
    return Int(platformVersion.prefix { $0.isNumber }) ?? 0
  }
}
