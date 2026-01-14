// VariableBlurView.swift
// Progressive/Variable Blur implementation based on VariableBlur library

import SwiftUI
import UIKit
import CoreImage.CIFilterBuiltins
import QuartzCore

public enum VariableBlurDirection: String {
  case blurredTopClearBottom
  case blurredBottomClearTop
  case blurredCenterClearTopAndBottom

  init(fromString string: String) {
    switch string.lowercased() {
    case "blurredbottomcleartop", "bottomtotop", "bottom":
      self = .blurredBottomClearTop
    case "blurredcentercleartopandbottom", "center":
      self = .blurredCenterClearTopAndBottom
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

    let newScale = window.traitCollection.displayScale
    let currentScale = backdropLayer.value(forKey: "scale") as? CGFloat

    // Only update scale if it actually changed to prevent unnecessary
    // recalculations during navigation gestures
    if currentScale != newScale {
      backdropLayer.setValue(newScale, forKey: "scale")
    }
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
    switch direction {
    case .blurredCenterClearTopAndBottom:
      return makeCenterGradientImage(
        width: width,
        height: height,
        edgeOffset: startOffset
      )
    case .blurredTopClearBottom, .blurredBottomClearTop:
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

      guard let output = ciGradientFilter.outputImage else {
        return makeFallbackMask(width: width, height: height)
      }

      guard let cg = CIContext().createCGImage(
        output,
        from: CGRect(x: 0, y: 0, width: width, height: height)
      ) else {
        return makeFallbackMask(width: width, height: height)
      }

      return cg
    }
  }

  private func makeCenterGradientImage(
    width: CGFloat = 100,
    height: CGFloat = 100,
    edgeOffset: CGFloat
  ) -> CGImage {
    let startEdge = max(min(edgeOffset, 0.2), 0.01)
    let endEdge = 1 - startEdge
    let colorSpace = CGColorSpaceCreateDeviceRGB()

    let centerLow: CGFloat = 0.5
    let centerHigh: CGFloat = 0.5
    let locations: [CGFloat] = [
      0.0,
      startEdge,
      centerLow,
      centerHigh,
      endEdge,
      1.0
    ]

    let colorComponents: [CGFloat] = [
      0, 0, 0, 0, // top clear
      0, 0, 0, 0, // clear until offset
      0, 0, 0, 1, // ramp up to opaque
      0, 0, 0, 1, // hold opaque plateau
      0, 0, 0, 0, // back to clear
      0, 0, 0, 0  // bottom clear
    ]

    let context = CGContext(
      data: nil,
      width: Int(width),
      height: Int(height),
      bitsPerComponent: 8,
      bytesPerRow: 0,
      space: colorSpace,
      bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue
    )!

    guard let gradient = CGGradient(
      colorSpace: colorSpace,
      colorComponents: colorComponents,
      locations: locations,
      count: locations.count
    ) else {
      return makeFallbackMask(width: width, height: height)
    }

    context.drawLinearGradient(
      gradient,
      start: CGPoint(x: 0, y: 0),
      end: CGPoint(x: 0, y: height),
      options: []
    )

    return context.makeImage() ?? makeFallbackMask(width: width, height: height)
  }

  private func makeFallbackMask(width: CGFloat, height: CGFloat) -> CGImage {
    let fallback = CIFilter.smoothLinearGradient()
    fallback.color0 = CIColor.black
    fallback.color1 = CIColor.clear
    fallback.point0 = CGPoint(x: 0, y: height)
    fallback.point1 = CGPoint(x: 0, y: height / 2)

    if let output = fallback.outputImage,
       let cg = CIContext().createCGImage(
         output,
         from: CGRect(x: 0, y: 0, width: width, height: height)
       ) {
      return cg
    }

    // Last-resort solid mask (fully opaque) to avoid crash loops
    let colorSpace = CGColorSpaceCreateDeviceGray()
    let bitmapInfo = CGImageAlphaInfo.none.rawValue
    guard let context = CGContext(
      data: nil,
      width: Int(max(width, 1)),
      height: Int(max(height, 1)),
      bitsPerComponent: 8,
      bytesPerRow: 0,
      space: colorSpace,
      bitmapInfo: bitmapInfo
    ) else {
      // Should never happen; return a 1x1 opaque pixel
      return CGImage(
        width: 1,
        height: 1,
        bitsPerComponent: 8,
        bitsPerPixel: 8,
        bytesPerRow: 1,
        space: colorSpace,
        bitmapInfo: CGBitmapInfo(rawValue: bitmapInfo),
        provider: CGDataProvider(data: Data([0xFF]) as CFData)!,
        decode: nil,
        shouldInterpolate: false,
        intent: .defaultIntent
      )!
    }

    context.setFillColor(CGColor(gray: 0, alpha: 1))
    context.fill(CGRect(x: 0, y: 0, width: width, height: height))
    return context.makeImage()!
  }
}
