// BasicColoredView.swift

import SwiftUI
import UIKit

// MARK: - SwiftUI View Component

struct BasicColoredView: View {
  var glassTintColor: UIColor
  var glassOpacity: Double
  var blurAmount: Double
  var blurStyle: UIBlurEffect.Style
  var type: String
  var glassType: String
  var reducedTransparencyFallbackColor: UIColor
  var isInteractive: Bool

  var body: some View {
    let blurIntensity = mapBlurAmountToIntensity(blurAmount)

    // Check if reduced transparency is enabled
    let isReducedTransparencyEnabled = UIAccessibility.isReduceTransparencyEnabled

    if isReducedTransparencyEnabled {
      // Use fallback color when reduced transparency is enabled
      Rectangle()
        .fill(Color(reducedTransparencyFallbackColor))
    } else {
      if (type == "liquidGlass"){
        if #available(iOS 26.0, *) {
          let baseGlassEffect = glassEffectFromString(glassType)
          Rectangle()
            .glassEffect(
              baseGlassEffect
                .tint(Color(glassTintColor)
                  .opacity(glassOpacity))
                .interactive(isInteractive)
              , in: .rect)

        } else {
          // Use proper blur intensity control for liquid glass fallback
          Rectangle()
            .fill(Color(.clear))
            .background(Blur(style: blurStyle, intensity: blurIntensity))
            .overlay(
              Color(glassTintColor)
                .opacity(glassOpacity)
            )
        }
      }else {
        // Use proper blur intensity control for regular blur
        Rectangle()
          .fill(Color(.clear))
          .background(Blur(style: blurStyle, intensity: blurIntensity))
      }
    }
  }
}