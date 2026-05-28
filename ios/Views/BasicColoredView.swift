// BasicColoredView.swift

import SwiftUI
import UIKit

struct BasicColoredView: View {
  let blurAmount: Double
  let blurStyle: UIBlurEffect.Style
  let blurIntensity: Double
  let ignoreSafeArea: Bool

  init(blurAmount: Double,
       blurStyle: UIBlurEffect.Style,
       ignoreSafeArea: Bool,
       reducedTransparencyFallbackColor: UIColor) {
    self.blurAmount = blurAmount
    self.blurStyle = blurStyle
    self.ignoreSafeArea = ignoreSafeArea
    self.blurIntensity = mapBlurAmountToIntensity(blurAmount)
  }

  var body: some View {
    regularBlurView
      .ignoresSafeArea(ignoreSafeArea ? .all : [])
  }

  private var regularBlurView: some View {
    Rectangle()
      .fill(Color(.clear))
      .background(Blur(style: blurStyle, intensity: blurIntensity))
  }
}

