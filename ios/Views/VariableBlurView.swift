// VariableBlurView.swift
// Progressive/Variable Blur implementation based on VariableBlur library

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

/// Variable (gradient) blur backed by the private `CAFilter` `variableBlur`
/// type, which UIKit does not expose publicly.
///
/// RISK: this depends on private Core Animation API. It is reached by
/// class/selector name (assembled from reversed string literals) and applied
/// with KVC, all guarded so that if the private class/keys are unavailable the
/// view degrades gracefully to a uniform blur rather than crashing. Two things
/// to keep in mind:
///   - App Store review can flag private-API access; the string obfuscation
///     evades static symbol scanning and is itself a review-policy risk.
///   - A future OS release can rename the filter or reorder the effect view's
///     backdrop subviews, silently dropping the gradient (again, no crash).
/// If Apple ships a public variable-blur API, migrate to it and delete this.
open class VariableBlurView: UIVisualEffectView {

  private var maxBlurRadius: CGFloat = 20
  private var direction: VariableBlurDirection = .blurredTopClearBottom
  private var startOffset: CGFloat = 0
  private var foregroundObserver: NSObjectProtocol?

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
    registerForegroundObserver()
  }

  required public init?(coder: NSCoder) {
    super.init(coder: coder)
    setupVariableBlur()
    registerForegroundObserver()
  }

  // UIKit resets UIVisualEffectView's internal layer configuration when the
  // app returns from the background, which wipes the custom variableBlur
  // filter from the backdrop layer and restores the overlay subviews. Without
  // this, the view briefly shows the plain uniform blur on resume (issue
  // #111). Reapply before the first foreground frame is rendered.
  private func registerForegroundObserver() {
    foregroundObserver = NotificationCenter.default.addObserver(
      forName: UIApplication.willEnterForegroundNotification,
      object: nil,
      queue: .main
    ) { [weak self] _ in
      self?.setupVariableBlur()
    }
  }

  deinit {
    if let foregroundObserver {
      NotificationCenter.default.removeObserver(foregroundObserver)
    }
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

    // UIKit can strip the custom filter while the view is detached (or during
    // transitions). Reapply on window re-entry so the view is self-healing
    // even when used standalone, without the ProgressiveBlurView wrapper.
    setupVariableBlur()

    let newScale = window.traitCollection.displayScale
    let currentScale = backdropLayer.value(forKey: "scale") as? CGFloat

    // Only update scale if it actually changed to prevent unnecessary
    // recalculations during navigation gestures
    if currentScale != newScale {
      backdropLayer.setValue(newScale, forKey: "scale")
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
      return makeEdgeGradientImage(
        width: width,
        height: height,
        startOffset: startOffset,
        direction: direction
      )
    }
  }

  /// Edge-direction mask: a fully-opaque plateau grows from the blurred edge
  /// (startOffset semantics shared with the Android and Web backends; before
  /// 6.0 iOS grew the fully-clear zone from the clear edge instead), and the
  /// fade zone applies an ease-in cubic to the mask alpha. The mask scales the
  /// blur *radius*, and even a small radius fraction already smears text, so a
  /// linear radius ramp reads as "everything blurred" the moment the fade
  /// starts. The cubic keeps the radius near zero through the first part of
  /// the fade — matching the readable window of Android's eased *opacity*
  /// mask — then rises into the plateau.
  private func makeEdgeGradientImage(
    width: CGFloat = 100,
    height: CGFloat = 100,
    startOffset: CGFloat,
    direction: VariableBlurDirection
  ) -> CGImage {
    let offset = max(0, min(1, startOffset))
    let fade = 1 - offset
    let steps = 12

    // Gradient locations run bottom (0) to top (1) of the rendered mask.
    var locations: [CGFloat] = []
    var alphas: [CGFloat] = []

    if case .blurredBottomClearTop = direction {
      // Plateau at the bottom, easing to clear at the top edge.
      locations.append(0)
      alphas.append(1)
      for k in 0...steps {
        let t = CGFloat(k) / CGFloat(steps)
        locations.append(offset + fade * t)
        alphas.append(pow(1 - t, 3))
      }
    } else {
      // Clear at the bottom edge, easing up into the plateau at the top.
      for k in 0...steps {
        let t = CGFloat(k) / CGFloat(steps)
        locations.append(fade * t)
        alphas.append(pow(t, 3))
      }
      locations.append(1)
      alphas.append(1)
    }

    let colorSpace = CGColorSpaceCreateDeviceRGB()
    var components: [CGFloat] = []
    for alpha in alphas {
      components.append(contentsOf: [0, 0, 0, alpha])
    }

    guard let context = CGContext(
      data: nil,
      width: Int(width),
      height: Int(height),
      bitsPerComponent: 8,
      bytesPerRow: 0,
      space: colorSpace,
      bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue
    ), let gradient = CGGradient(
      colorSpace: colorSpace,
      colorComponents: components,
      locations: locations,
      count: locations.count
    ) else {
      return makeFallbackMask(width: width, height: height)
    }

    context.drawLinearGradient(
      gradient,
      start: CGPoint(x: 0, y: 0),
      end: CGPoint(x: 0, y: height),
      options: [.drawsBeforeStartLocation, .drawsAfterEndLocation]
    )

    return context.makeImage() ?? makeFallbackMask(width: width, height: height)
  }

  private func makeCenterGradientImage(
    width: CGFloat = 100,
    height: CGFloat = 100,
    edgeOffset: CGFloat
  ) -> CGImage {
    // Same geometry as the Android backend: a clear inset of `edgeOffset` at
    // each edge, an eased 20% fade band, and a solid plateau between
    // [offset + 0.2, 0.8 - offset]. The clamp also matches Android's — at 0.3
    // the plateau collapses to the center line. (Previously iOS ramped to a
    // point-peak at the center with no plateau.)
    let startEdge = max(min(edgeOffset, 0.3), 0.01)
    let steps = 8

    var locations: [CGFloat] = [0]
    var alphas: [CGFloat] = [0]
    for k in 0...steps {
      let t = CGFloat(k) / CGFloat(steps)
      locations.append(startEdge + 0.2 * t)
      alphas.append(t * t * t)
    }
    for k in 0...steps {
      let t = CGFloat(k) / CGFloat(steps)
      locations.append((0.8 - startEdge) + 0.2 * t)
      alphas.append(pow(1 - t, 3))
    }
    locations.append(1)
    alphas.append(0)

    let colorSpace = CGColorSpaceCreateDeviceRGB()
    var components: [CGFloat] = []
    for alpha in alphas {
      components.append(contentsOf: [0, 0, 0, alpha])
    }

    guard let context = CGContext(
      data: nil,
      width: Int(width),
      height: Int(height),
      bitsPerComponent: 8,
      bytesPerRow: 0,
      space: colorSpace,
      bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue
    ), let gradient = CGGradient(
      colorSpace: colorSpace,
      colorComponents: components,
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
