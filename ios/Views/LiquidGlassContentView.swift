// LiquidGlassContentView.swift

import SwiftUI
import UIKit

// MARK: - SwiftUI Liquid Glass View Component

struct LiquidGlassContentView: View {
  let glassTintColor: UIColor
  let glassOpacity: Double
  let glassType: String
  let reducedTransparencyFallbackColor: UIColor
  let isInteractive: Bool
  let ignoreSafeArea: Bool
  let borderRadius: Double

  let isReducedTransparencyEnabled = UIAccessibility.isReduceTransparencyEnabled

  init(glassTintColor: UIColor,
       glassOpacity: Double,
       glassType: String,
       reducedTransparencyFallbackColor: UIColor,
       isInteractive: Bool,
       borderRadius: Double = 0,
       ignoreSafeArea: Bool = false) {
    self.glassTintColor = glassTintColor
    self.glassOpacity = glassOpacity
    self.glassType = glassType
    self.reducedTransparencyFallbackColor = reducedTransparencyFallbackColor
    self.isInteractive = isInteractive
    self.ignoreSafeArea = ignoreSafeArea
    self.borderRadius = borderRadius
  }

  var body: some View {
    content
      .ignoresSafeArea(ignoreSafeArea ? .all : [])
  }

  private var content: some View {
    if isReducedTransparencyEnabled {
      AnyView(
        Rectangle()
          .fill(Color(reducedTransparencyFallbackColor))
      )
    } else {
      AnyView(liquidGlassView)
    }
  }

  private var liquidGlassView: some View {
    Group {
      if #available(iOS 26.0, *) {
        let baseGlassEffect = glassEffectFromString(glassType)
        Rectangle()
          .glassEffect(
            baseGlassEffect
              .tint(Color(glassTintColor).opacity(glassOpacity))
              .interactive(isInteractive), in: .rect(cornerRadius: borderRadius)
          )
      } else {
        // Fallback for iOS < 26: Show solid color with opacity
        Rectangle()
          .fill(Color(reducedTransparencyFallbackColor))
      }
    }
  }
}
