// ProgressiveBlurView.swift
// React Native wrapper for the progressive blur: the private variable blur filter, or the public bands

import UIKit

@objc public class ProgressiveBlurView: UIView {

  #if !REACT_NATIVE_BLUR_NO_PRIVATE_API
  private var variableBlurView: VariableBlurView?
  #endif
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

  /// The blurType style's blur radius in points for the current scheme, sent by JS. Below 0 means unset.
  @objc public var materialRadius: Double = -1 {
    didSet {
      updateBlur()
    }
  }

  /// `-RNBlurProgressiveBands YES` draws the public bands even where the private filter works, to compare the two.
  private static let forcesBands = UserDefaults.standard.bool(forKey: "RNBlurProgressiveBands")
  /// The `regular` light radius, for a raw native component that sends no material radius.
  private static let unsetStyleRadius = 29.1

  private var bandsView: ProgressiveBandsView?

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

  private var backend: UIView? {
    #if REACT_NATIVE_BLUR_NO_PRIVATE_API
    return bandsView
    #else
    return bandsView ?? variableBlurView
    #endif
  }

  private func setupView() {
    backend?.removeFromSuperview()
    #if REACT_NATIVE_BLUR_NO_PRIVATE_API
    addBands()
    #else
    if Self.forcesBands || !VariableBlurView.isPrivateFilterAvailable {
      addBands()
    } else {
      addVariableBlur()
    }
    #endif
    applyInterfaceStyle()
    updateAccessibilityFallback()
  }

  private func addBands() {
    let bands = ProgressiveBandsView(frame: bounds)
    bands.autoresizingMask = [.flexibleWidth, .flexibleHeight]
    insertSubview(bands, at: 0)
    bandsView = bands
  }

  #if !REACT_NATIVE_BLUR_NO_PRIVATE_API
  private func addVariableBlur() {
    let variableBlur = VariableBlurView(
      maxBlurRadius: CGFloat(blurAmount),
      direction: VariableBlurDirection(fromString: direction),
      startOffset: CGFloat(startOffset),
      blurStyle: blurStyleFromString(blurTypeString)
    )
    variableBlur.translatesAutoresizingMaskIntoConstraints = false
    insertSubview(variableBlur, at: 0)
    NSLayoutConstraint.activate([
      variableBlur.topAnchor.constraint(equalTo: topAnchor),
      variableBlur.leadingAnchor.constraint(equalTo: leadingAnchor),
      variableBlur.trailingAnchor.constraint(equalTo: trailingAnchor),
      variableBlur.bottomAnchor.constraint(equalTo: bottomAnchor),
    ])
    variableBlurView = variableBlur
    variableBlur.setTint(materialTint)
  }
  #endif

  private func updateBlur() {
    if isBatchingUpdates {
      hasPendingBatchUpdate = true
      return
    }
    guard backend != nil else {
      setupView()
      updateBlur()
      return
    }

    let blurStyle = blurStyleFromString(blurTypeString)
    let blurDirection = VariableBlurDirection(fromString: direction)

    if let bandsView {
      // The bands draw their style's own tint, so materialTint is not drawn again here.
      bandsView.update(
        amount: blurAmount,
        styleRadius: materialRadius < 0 ? Self.unsetStyleRadius : materialRadius,
        direction: blurDirection.rawValue,
        startOffset: startOffset,
        style: blurStyle
      )
    }
    #if !REACT_NATIVE_BLUR_NO_PRIVATE_API
    if let variableBlurView {
      variableBlurView.updateBlur(
        maxBlurRadius: CGFloat(blurAmount),
        direction: blurDirection,
        startOffset: CGFloat(startOffset),
        blurStyle: blurStyle
      )
      variableBlurView.setTint(materialTint)
    }
    #endif

    applyInterfaceStyle()
    updateAccessibilityFallback()
  }

  private func applyInterfaceStyle() {
    let interfaceStyle = interfaceStyleForBlurType(blurTypeString) ?? .unspecified
    overrideUserInterfaceStyle = interfaceStyle
    backend?.overrideUserInterfaceStyle = interfaceStyle
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
    guard let backend else { return }
    if UIAccessibility.isReduceTransparencyEnabled {
      backend.isHidden = true
      backgroundColor = reducedTransparencyFallbackColor
    } else {
      backend.isHidden = false
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
    backend?.removeFromSuperview()
    #if !REACT_NATIVE_BLUR_NO_PRIVATE_API
    variableBlurView = nil
    #endif
    bandsView = nil
  }
}
