// ProgressiveBlurView.swift
// React Native wrapper for VariableBlurView

import UIKit

@objc public class ProgressiveBlurView: UIView {

  private var variableBlurView: VariableBlurView?
  private var reduceTransparencyObserver: NSObjectProtocol?
  private var isBatchingUpdates = false
  private var hasPendingBatchUpdate = false

  // MARK: - Batched prop updates

  @objc public func beginBatchUpdate() {
    isBatchingUpdates = true
  }

  // Applies only when a setter ran, so a style-only update (an animated opacity) costs nothing.
  @objc public func endBatchUpdate() {
    isBatchingUpdates = false
    guard hasPendingBatchUpdate else { return }
    hasPendingBatchUpdate = false
    updateBlur()
  }

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

  /// The blurType material tint, drawn at full strength where the blur is strongest.
  @objc public var materialTint: UIColor? {
    didSet {
      updateBlur()
    }
  }

  public override init(frame: CGRect) {
    super.init(frame: frame)
    setupView()
    registerAccessibilityObserver()
  }

  required init?(coder: NSCoder) {
    super.init(coder: coder)
    setupView()
    registerAccessibilityObserver()
  }

  private func setupView() {
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
    variableBlur.setTint(materialTint)

    let interfaceStyle = interfaceStyleForBlurType(blurTypeString) ?? .unspecified
    overrideUserInterfaceStyle = interfaceStyle
    variableBlur.overrideUserInterfaceStyle = interfaceStyle

    updateAccessibilityFallback()
  }

  private func updateBlur() {
    if isBatchingUpdates {
      hasPendingBatchUpdate = true
      return
    }
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
    variableBlurView.setTint(materialTint)

    let interfaceStyle = interfaceStyleForBlurType(blurTypeString) ?? .unspecified
    overrideUserInterfaceStyle = interfaceStyle
    variableBlurView.overrideUserInterfaceStyle = interfaceStyle

    updateAccessibilityFallback()
  }

  private func registerAccessibilityObserver() {
    reduceTransparencyObserver = NotificationCenter.default.addObserver(
      forName: UIAccessibility.reduceTransparencyStatusDidChangeNotification,
      object: nil,
      queue: .main
    ) { [weak self] _ in
      self?.updateAccessibilityFallback()
    }
  }

  private func updateAccessibilityFallback() {
    guard let variableBlurView else { return }
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
    if let reduceTransparencyObserver {
      NotificationCenter.default.removeObserver(reduceTransparencyObserver)
    }
    variableBlurView?.removeFromSuperview()
    variableBlurView = nil
  }
}
