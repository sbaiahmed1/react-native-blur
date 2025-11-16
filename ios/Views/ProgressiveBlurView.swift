// ProgressiveBlurView.swift
// React Native wrapper for VariableBlurView

import SwiftUI
import UIKit

@objc public class ProgressiveBlurView: UIView {

  private var variableBlurView: VariableBlurView?

  @objc public var blurAmount: Double = 20.0 {
    didSet {
      updateBlur()
    }
  }

  @objc public var direction: String = "blurredTopClearBottom" {
    didSet {
      updateBlur()
    }
  }

  @objc public var startOffset: Double = 0.0 {
    didSet {
      updateBlur()
    }
  }

  @objc public var blurTypeString: String = "regular" {
    didSet {
      updateBlur()
    }
  }

  @objc public var reducedTransparencyFallbackColor: UIColor = .white {
    didSet {
      updateBlur()
    }
  }

  public override init(frame: CGRect) {
    super.init(frame: frame)
    setupView()
  }

  required init?(coder: NSCoder) {
    super.init(coder: coder)
    setupView()
  }

  private func setupView() {
    // Remove old view if exists
    variableBlurView?.removeFromSuperview()

    let blurStyle = blurStyleFromString(blurTypeString)
    let blurDirection = VariableBlurDirection(fromString: direction)

    let variableBlur = VariableBlurView(
      maxBlurRadius: CGFloat(blurAmount),
      direction: blurDirection,
      startOffset: CGFloat(startOffset),
      blurStyle: blurStyle
    )

    variableBlur.translatesAutoresizingMaskIntoConstraints = false
    addSubview(variableBlur)

    NSLayoutConstraint.activate([
      variableBlur.topAnchor.constraint(equalTo: topAnchor),
      variableBlur.leadingAnchor.constraint(equalTo: leadingAnchor),
      variableBlur.trailingAnchor.constraint(equalTo: trailingAnchor),
      variableBlur.bottomAnchor.constraint(equalTo: bottomAnchor)
    ])

    self.variableBlurView = variableBlur

    // Handle reduced transparency
    if UIAccessibility.isReduceTransparencyEnabled {
      variableBlur.isHidden = true
      backgroundColor = reducedTransparencyFallbackColor
    } else {
      variableBlur.isHidden = false
      backgroundColor = .clear
    }
  }

  private func updateBlur() {
    guard let variableBlurView = variableBlurView else {
      setupView()
      return
    }

    let blurStyle = blurStyleFromString(blurTypeString)
    let blurDirection = VariableBlurDirection(fromString: direction)

    variableBlurView.updateBlur(
      maxBlurRadius: CGFloat(blurAmount),
      direction: blurDirection,
      startOffset: CGFloat(startOffset),
      blurStyle: blurStyle
    )

    // Handle reduced transparency
    if UIAccessibility.isReduceTransparencyEnabled {
      variableBlurView.isHidden = true
      backgroundColor = reducedTransparencyFallbackColor
    } else {
      variableBlurView.isHidden = false
      backgroundColor = .clear
    }
  }

  public override func didMoveToWindow() {
    super.didMoveToWindow()
    if window != nil {
      updateBlur()
    }
  }

  deinit {
    variableBlurView?.removeFromSuperview()
    variableBlurView = nil
  }
}
