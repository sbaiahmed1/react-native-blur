// ProgressiveBandLayout.swift

import Foundation

/// One public blur band of a progressive blur: how much of the style it draws, its frame along the fade axis and its mask.
struct ProgressiveBand: Equatable {
  struct Stop: Equatable {
    let position: Double
    let alpha: Double
  }

  /// 0 is the strongest band, drawn on top.
  let index: Int
  /// The fraction of the blurType style this band draws, so its blur is fraction times the style radius.
  let fraction: Double
  /// The band's frame along the fade axis, in view units 0-1 from the top or left edge.
  let start: Double
  let end: Double
  /// Mask stops with positions relative to start...end, sorted by position.
  let stops: [Stop]

  /// The mask alpha at a view position along the fade axis, 0 outside the frame.
  func alpha(at viewPosition: Double) -> Double {
    guard end > start, viewPosition >= start, viewPosition <= end else { return 0 }
    return ProgressiveBandLayout.interpolate(stops, at: (viewPosition - start) / (end - start))
  }
}

/// Lays out the public bands that approximate the private variable blur: halving radii on the same cube curve as Android.
enum ProgressiveBandLayout {
  static let maxBands = 6
  /// Bands weaker than this blur, in points, are dropped.
  static let minBandSigma = 1.0
  /// How far a band fades out under the next stronger one, in units of the fade length.
  static let bandFadeOut = 0.03
  /// The private filter blurs about 2 pt of Gaussian sigma per blurAmount unit.
  static let sigmaPerAmount = 2.0
  /// The two mirrored directions fade over 20% of the view on each side, as on Android and web.
  static let mirroredFade = 0.2

  static func isHorizontal(_ direction: String) -> Bool {
    direction == "blurredLeftToClearRight" || direction == "blurredRightToClearLeft"
  }

  /// A fade maps t (0 at its clear end, 1 where the plateau starts) to view positions, and its band 0 runs on to `blurredEnd`.
  private struct Fade {
    let clear: Double
    let plateau: Double
    let blurredEnd: Double

    func position(_ t: Double) -> Double { clear + t * (plateau - clear) }
  }

  static func bands(amount: Double, styleRadius: Double, direction: String, startOffset: Double, axisLength: Double) -> [ProgressiveBand] {
    guard styleRadius > 0, axisLength > 0 else { return [] }
    let effectiveAmount: Double
    if amount.isNaN || amount == .infinity {
      effectiveAmount = styleRadius / sigmaPerAmount
    } else if amount > 0 {
      effectiveAmount = amount
    } else {
      return []
    }
    let plateauSigma = min(sigmaPerAmount * effectiveAmount, styleRadius)
    var count = 0
    while count < maxBands, plateauSigma / pow(2, Double(count)) >= minBandSigma { count += 1 }
    guard count > 0 else { return [] }

    let offset = startOffset.isNaN ? 0 : startOffset
    if offset >= 1 {
      let whole = [ProgressiveBand.Stop(position: 0, alpha: 1), ProgressiveBand.Stop(position: 1, alpha: 1)]
      return [ProgressiveBand(index: 0, fraction: plateauSigma / styleRadius, start: 0, end: 1, stops: whole)]
    }

    // Capped so band 1 has faded out under band 0 by the blurred edge.
    let reach = min(cbrt(plateauSigma / (sigmaPerAmount * effectiveAmount)), 1 - bandFadeOut)
    let opaqueFrom = (0...count).map { reach * pow(2, -Double($0) / 3) }
    let edgeOffset = max(0, offset)
    let fades: [Fade]
    switch direction {
    case "blurredBottomClearTop", "blurredRightToClearLeft":
      fades = [Fade(clear: 0, plateau: 1 - edgeOffset, blurredEnd: 1)]
    case "blurredCenterClearTopAndBottom":
      let inset = min(max(offset, 0.01), 0.3)
      fades = [
        Fade(clear: inset, plateau: inset + mirroredFade, blurredEnd: 0.5),
        Fade(clear: 1 - inset, plateau: 1 - inset - mirroredFade, blurredEnd: 0.5),
      ]
    case "blurredTopAndBottomClearCenter":
      let inset = min(max(offset, 0), 0.3)
      fades = [
        Fade(clear: inset + mirroredFade, plateau: inset, blurredEnd: 0),
        Fade(clear: 1 - inset - mirroredFade, plateau: 1 - inset, blurredEnd: 1),
      ]
    default:
      fades = [Fade(clear: 1, plateau: edgeOffset, blurredEnd: 0)]
    }
    let mergesStrongest = direction == "blurredCenterClearTopAndBottom"

    var result: [ProgressiveBand] = []
    for index in 0..<count {
      let sigma = plateauSigma / pow(2, Double(index))
      let fraction = sigma / styleRadius
      let pad = 3 * sigma / axisLength
      if index == 0, mergesStrongest {
        let stops = fades.flatMap { maskStops(index: 0, count: count, opaqueFrom: opaqueFrom, fade: $0, includeEnd: false) }
        result.append(band(index: 0, fraction: fraction, absoluteStops: stops, pad: pad))
        continue
      }
      for fade in fades {
        let stops = maskStops(index: index, count: count, opaqueFrom: opaqueFrom, fade: fade, includeEnd: true)
        result.append(band(index: index, fraction: fraction, absoluteStops: stops, pad: pad))
      }
    }
    return result
  }

  /// The mask of one band in one fade, as view positions with alphas.
  private static func maskStops(index k: Int, count: Int, opaqueFrom t: [Double], fade: Fade, includeEnd: Bool) -> [ProgressiveBand.Stop] {
    // A band starts after the band two steps weaker has faded out, so at most two bands overlap.
    let rampStart = t[k + 1] + (k + 2 < count ? bandFadeOut : 0)
    var stops = [
      ProgressiveBand.Stop(position: fade.position(rampStart), alpha: 0),
      ProgressiveBand.Stop(position: fade.position(t[k]), alpha: 1),
    ]
    if k == 0 {
      if includeEnd { stops.append(.init(position: fade.blurredEnd, alpha: 1)) }
    } else {
      stops.append(.init(position: fade.position(t[k - 1]), alpha: 1))
      stops.append(.init(position: fade.position(t[k - 1] + bandFadeOut), alpha: 0))
    }
    return stops
  }

  /// Builds a band from absolute stops: the frame covers the mask plus 3 sigma, clamped to the view.
  private static func band(index: Int, fraction: Double, absoluteStops: [ProgressiveBand.Stop], pad: Double) -> ProgressiveBand {
    let sorted = absoluteStops.sorted { $0.position < $1.position }
    let first = sorted.first?.position ?? 0
    let last = sorted.last?.position ?? 0
    let start = max(0, first - pad)
    let end = min(1, last + pad)
    let positions = [start] + sorted.map(\.position).filter { $0 > start && $0 < end } + [end]
    let stops = positions.map { position in
      ProgressiveBand.Stop(position: (position - start) / (end - start), alpha: interpolate(sorted, at: position))
    }
    return ProgressiveBand(index: index, fraction: fraction, start: start, end: end, stops: stops)
  }

  /// Linear interpolation over sorted stops, 0 outside them.
  static func interpolate(_ stops: [ProgressiveBand.Stop], at position: Double) -> Double {
    guard let first = stops.first, let last = stops.last, position >= first.position, position <= last.position else { return 0 }
    for (a, b) in zip(stops, stops.dropFirst()) where position <= b.position {
      if b.position == a.position { return max(a.alpha, b.alpha) }
      return a.alpha + (b.alpha - a.alpha) * (position - a.position) / (b.position - a.position)
    }
    return last.alpha
  }
}
