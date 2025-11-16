// VariableBlurView.swift
// Progressive/Variable Blur implementation based on VariableBlur library

import SwiftUI
import UIKit
import CoreImage.CIFilterBuiltins
import QuartzCore

public enum VariableBlurDirection: String {
  case blurredTopClearBottom
  case blurredBottomClearTop

  init(fromString string: String) {
    switch string.lowercased() {
    case "blurredbottomcleartop", "bottomtotop", "bottom":
      self = .blurredBottomClearTop
    default:
      self = .blurredTopClearBottom
    }
  }
}

open class VariableBlurView: UIVisualEffectView {

  private var maxBlurRadius: CGFloat = 20
  private var direction: VariableBlurDirection = .blurredTopClearBottom
  private var startOffset: CGFloat = 0

  public init(
    maxBlurRadius: CGFloat = 20,
    direction: VariableBlurDirection = .blurredTopClearBottom,
    startOffset: CGFloat = 0,
    blurStyle: UIBlurEffect.Style = .regular
  ) {
    self.maxBlurRadius = maxBlurRadius
    self.direction = direction
    self.startOffset = startOffset

    super.init(effect: UIBlurEffect(style: blurStyle))

    setupVariableBlur()
  }

  required public init?(coder: NSCoder) {
    super.init(coder: coder)
    setupVariableBlur()
  }

  public func updateBlur(
    maxBlurRadius: CGFloat,
    direction: VariableBlurDirection,
    startOffset: CGFloat,
    blurStyle: UIBlurEffect.Style = .regular
  ) {
    self.maxBlurRadius = maxBlurRadius
    self.direction = direction
    self.startOffset = startOffset
    self.effect = UIBlurEffect(style: blurStyle)

    setupVariableBlur()
  }

  private func setupVariableBlur() {
    // Creates filter via runtime reflection
    // This uses a private Core Animation filter called "variableBlur"
    let clsName = String("retliFAC".reversed()) // CAFilter
    guard let Cls = NSClassFromString(clsName) as? NSObject.Type else {
      print("[VariableBlur] Error: Can't find filter class")
      return
    }

    let selName = String(":epyThtiWretlif".reversed()) // filterWithType:
    guard let variableBlur = Cls.self.perform(
      NSSelectorFromString(selName),
      with: "variableBlur"
    )?.takeUnretainedValue() as? NSObject else {
      print("[VariableBlur] Error: Can't create variableBlur filter")
      return
    }

    let gradientImage = makeGradientImage(
      startOffset: startOffset,
      direction: direction
    )

    variableBlur.setValue(maxBlurRadius, forKey: "inputRadius")
    variableBlur.setValue(gradientImage, forKey: "inputMaskImage")
    variableBlur.setValue(true, forKey: "inputNormalizeEdges")

    let backdropLayer = subviews.first?.layer
    backdropLayer?.filters = [variableBlur]

    // Hide the default visual effect view overlays
    for subview in subviews.dropFirst() {
      subview.alpha = 0
    }
  }

  open override func didMoveToWindow() {
    super.didMoveToWindow()
    guard let window, let backdropLayer = subviews.first?.layer else { return }
    backdropLayer.setValue(
      window.traitCollection.displayScale,
      forKey: "scale"
    )
  }

  open override func traitCollectionDidChange(
    _ previousTraitCollection: UITraitCollection?
  ) {
    super.traitCollectionDidChange(previousTraitCollection)
    // Re-setup blur if needed when trait collection changes
    if let previousTraitCollection = previousTraitCollection,
       traitCollection.userInterfaceStyle != previousTraitCollection.userInterfaceStyle {
      setupVariableBlur()
    }
  }

  private func makeGradientImage(
    width: CGFloat = 100,
    height: CGFloat = 100,
    startOffset: CGFloat,
    direction: VariableBlurDirection
  ) -> CGImage {
    // Try smoothLinearGradient for smoother transitions
    let ciGradientFilter = CIFilter.smoothLinearGradient()
    ciGradientFilter.color0 = CIColor.black
    ciGradientFilter.color1 = CIColor.clear
    ciGradientFilter.point0 = CGPoint(x: 0, y: height)
    ciGradientFilter.point1 = CGPoint(x: 0, y: startOffset * height)

    if case .blurredBottomClearTop = direction {
      ciGradientFilter.point0.y = 0
      ciGradientFilter.point1.y = height - ciGradientFilter.point1.y
    }

    return CIContext().createCGImage(
      ciGradientFilter.outputImage!,
      from: CGRect(x: 0, y: 0, width: width, height: height)
    )!
  }
}
