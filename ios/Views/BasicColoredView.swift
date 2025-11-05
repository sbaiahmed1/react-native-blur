// BasicColoredView.swift

import SwiftUI
import UIKit

// MARK: - SwiftUI View Component for Blur

struct BasicColoredView: View {
  let blurAmount: Double
  let blurStyle: UIBlurEffect.Style
  let reducedTransparencyFallbackColor: UIColor
  let blurIntensity: Double
  let ignoreSafeArea: Bool

  let isReducedTransparencyEnabled = UIAccessibility.isReduceTransparencyEnabled

  init(blurAmount: Double,
       blurStyle: UIBlurEffect.Style,
       ignoreSafeArea: Bool,
       reducedTransparencyFallbackColor: UIColor) {
    self.blurAmount = blurAmount
    self.blurStyle = blurStyle
    self.ignoreSafeArea = ignoreSafeArea
    self.reducedTransparencyFallbackColor = reducedTransparencyFallbackColor
    self.blurIntensity = mapBlurAmountToIntensity(blurAmount)
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
      AnyView(regularBlurView)
    }
  }

  private var regularBlurView: some View {
    // Use proper blur intensity control for regular blur
    Rectangle()
      .fill(Color(.clear))
      .background(Blur(style: blurStyle, intensity: blurIntensity))
  }
}

