// BlurDebugCounters.swift

import Foundation

/// Logs effect rebuilds and fast paths when the app is launched with `-RNBlurLogRebuilds YES`.
enum BlurDebugCounters {
  static let enabled = UserDefaults.standard.bool(forKey: "RNBlurLogRebuilds")

  static func rebuild(_ site: StaticString) {
    if enabled { NSLog("[RNBlur] rebuild %@", "\(site)") }
  }

  static func fastPath(_ site: StaticString) {
    if enabled { NSLog("[RNBlur] fast %@", "\(site)") }
  }
}
