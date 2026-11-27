// ProgressiveBandsView.swift

import UIKit

/// The public progressive blur: blur bands of the blurType style at halving strengths, each masked to its part of the ramp.
final class ProgressiveBandsView: UIView {
  private struct Applied: Equatable {
    var style: UIBlurEffect.Style
    var fraction: Double
    var frame: CGRect
    var stops: [ProgressiveBand.Stop]
  }

  private var amount = 20.0
  private var styleRadius = 29.1
  private var direction = "blurredTopClearBottom"
  private var startOffset = 0.0
  private var style: UIBlurEffect.Style = .regular
  private var bandViews: [BlurEffectView] = []
  private var maskViews: [UIImageView] = []
  private var applied: [Applied?] = []

  override init(frame: CGRect) {
    super.init(frame: frame)
    isUserInteractionEnabled = false
  }

  required init?(coder: NSCoder) {
    super.init(coder: coder)
    isUserInteractionEnabled = false
  }

  func update(amount: Double, styleRadius: Double, direction: String, startOffset: Double, style: UIBlurEffect.Style) {
    self.amount = amount
    self.styleRadius = styleRadius
    self.direction = direction
    self.startOffset = startOffset
    self.style = style
    setNeedsLayout()
  }

  override func layoutSubviews() {
    super.layoutSubviews()
    let horizontal = ProgressiveBandLayout.isHorizontal(direction)
    let axisLength = Double(horizontal ? bounds.width : bounds.height)
    let bands = ProgressiveBandLayout.bands(
      amount: amount, styleRadius: styleRadius, direction: direction, startOffset: startOffset, axisLength: axisLength
    )
    resize(to: bands.count)
    for (position, band) in bands.enumerated() {
      let frame = horizontal
        ? CGRect(x: band.start * bounds.width, y: 0, width: (band.end - band.start) * bounds.width, height: bounds.height)
        : CGRect(x: 0, y: band.start * bounds.height, width: bounds.width, height: (band.end - band.start) * bounds.height)
      let next = Applied(style: style, fraction: band.fraction, frame: frame, stops: band.stops)
      let previous = applied[position]
      guard next != previous else { continue }
      let view = bandViews[position]
      if previous?.style != next.style || previous?.fraction != next.fraction {
        view.updateBlur(style: next.style, intensity: next.fraction)
      }
      if previous?.frame != next.frame || previous?.stops != next.stops {
        view.frame = frame
        maskViews[position].image = Self.maskImage(stops: band.stops, horizontal: horizontal)
        assignMask(at: position)
      }
      applied[position] = next
    }
  }

  // Bands come strongest first, so new views join at the weak end, below the others.
  private func resize(to count: Int) {
    while bandViews.count > count {
      bandViews.removeLast().removeFromSuperview()
      maskViews.removeLast()
      applied.removeLast()
    }
    while bandViews.count < count {
      let view = BlurEffectView(effect: nil)
      view.isUserInteractionEnabled = false
      let mask = UIImageView()
      mask.contentMode = .scaleToFill
      let position = bandViews.count
      view.onRebuild = { [weak self] in self?.assignMask(at: position) }
      insertSubview(view, at: 0)
      bandViews.append(view)
      maskViews.append(mask)
      applied.append(nil)
    }
  }

  // UIKit copies a mask onto the effect's internal views, so a changed mask is assigned again.
  private func assignMask(at position: Int) {
    guard position < bandViews.count else { return }
    let view = bandViews[position]
    let mask = maskViews[position]
    mask.frame = view.bounds
    view.mask = nil
    view.mask = mask
  }

  /// A one pixel wide gradient along the fade axis, stretched over the band by the mask view.
  private static func maskImage(stops: [ProgressiveBand.Stop], horizontal: Bool) -> UIImage? {
    let length = 256
    let size = horizontal ? CGSize(width: length, height: 1) : CGSize(width: 1, height: length)
    let colors = stops.map { UIColor(white: 0, alpha: CGFloat($0.alpha)).cgColor } as CFArray
    let locations = stops.map { CGFloat($0.position) }
    guard let gradient = CGGradient(colorsSpace: CGColorSpaceCreateDeviceRGB(), colors: colors, locations: locations) else {
      return nil
    }
    let format = UIGraphicsImageRendererFormat()
    format.scale = 1
    return UIGraphicsImageRenderer(size: size, format: format).image { context in
      let end = horizontal ? CGPoint(x: size.width, y: 0) : CGPoint(x: 0, y: size.height)
      context.cgContext.drawLinearGradient(gradient, start: .zero, end: end, options: [.drawsBeforeStartLocation, .drawsAfterEndLocation])
    }
  }
}
