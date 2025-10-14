// BasicColoredView.swift

import SwiftUI
import UIKit

// MARK: - SwiftUI View Component

struct BasicColoredView: View {
  let glassTintColor: UIColor
  let glassOpacity: Double
  let blurAmount: Double
  let blurStyle: UIBlurEffect.Style
  let type: String
  let glassType: String
  let reducedTransparencyFallbackColor: UIColor
  let isInteractive: Bool
  let blurIntensity: Double
  let ignoreSafeArea: Bool

  let isReducedTransparencyEnabled = UIAccessibility.isReduceTransparencyEnabled


  init(glassTintColor: UIColor,
       glassOpacity: Double,
       blurAmount: Double,
       blurStyle: UIBlurEffect.Style,
       type: String,
       glassType: String,
       reducedTransparencyFallbackColor: UIColor,
       isInteractive: Bool,
       ignoreSafeArea: Bool = false) {
    self.glassTintColor = glassTintColor
    self.glassOpacity = glassOpacity
    self.blurAmount = blurAmount
    self.blurStyle = blurStyle
    self.type = type
    self.glassType = glassType
    self.reducedTransparencyFallbackColor = reducedTransparencyFallbackColor
    self.isInteractive = isInteractive
    self.ignoreSafeArea = ignoreSafeArea

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
      if (type == "liquidGlass"){
        AnyView(liquidGlassBlurView)
      } else {
        AnyView(regularBlurView)
      }
    }
  }

  private var liquidGlassBlurView: some View {
    Group {
      if #available(iOS 26.0, *) {
        let baseGlassEffect = glassEffectFromString(glassType)
        Rectangle()
          .glassEffect(
            baseGlassEffect
              .tint(Color(glassTintColor).opacity(glassOpacity))
              .interactive(isInteractive), in: .rect
          )
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
    }
  }

  private var regularBlurView: some View {
    // Use proper blur intensity control for regular blur
    Rectangle()
      .fill(Color(.clear))
      .background(Blur(style: blurStyle, intensity: blurIntensity))
  }
}

