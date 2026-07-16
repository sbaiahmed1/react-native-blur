import UIKit

// MARK: - UIKit-only Wrapper for Liquid Glass (following Expo's approach)

@objc public class LiquidGlassContainerView: UIView {
  private var glassEffectView: UIVisualEffectView?
  private var glassEffect: Any?
  private var currentGlassStyle: String = "clear" // Track current style

  @objc public var glassTintColor: UIColor = .clear {
    didSet {
      updateEffect()
    }
  }

  @objc public var glassOpacity: Double = 1.0 {
    didSet {
      updateEffect()
    }
  }

  @objc public var glassType: String = "clear" {
    didSet {
      updateEffect()
    }
  }

  @objc public var reducedTransparencyFallbackColor: UIColor = .white {
    didSet {
      updateFallback()
    }
  }

  @objc public var isInteractive: Bool = true {
    didSet {
      updateEffect()
    }
  }

  // false confines the glass to the safe area; true (the JS-side default) lets
  // it fill the whole view. Applied in layoutSubviews.
  @objc public var ignoreSafeArea: Bool = false {
    didSet {
      if ignoreSafeArea != oldValue {
        setNeedsLayout()
      }
    }
  }

  // Per-corner radii in points. The iOS 26 path applies all four via
  // cornerConfiguration; the pre-26 / reduced-transparency fallback can only
  // render a uniform CALayer cornerRadius, so it uses topLeftRadius.
  private var topLeftRadius: CGFloat = 0
  private var topRightRadius: CGFloat = 0
  private var bottomLeftRadius: CGFloat = 0
  private var bottomRightRadius: CGFloat = 0

  private var foregroundObserver: NSObjectProtocol?
  private var reduceTransparencyObserver: NSObjectProtocol?

  // While true, prop setters skip rebuilding the effect. The Fabric layer wraps
  // a single updateProps commit in beginBatchUpdate/endBatchUpdate so several
  // changed props rebuild the UIGlassEffect once instead of once per property.
  private var isBatchingUpdates = false

  public override init(frame: CGRect) {
    super.init(frame: frame)
    setupView()
    registerObservers()
  }

  required init?(coder: NSCoder) {
    super.init(coder: coder)
    setupView()
    registerObservers()
  }

  // The glass/blur effect is assigned to the UIVisualEffectView once. UIKit
  // breaks the effect when an ancestor animates alpha (fade navigation
  // transitions, issue #109) and can reset it across background/foreground
  // cycles. Reassign whenever the view (re-)enters a window and on foreground
  // so the effect always recovers.
  public override func didMoveToWindow() {
    super.didMoveToWindow()
    if window != nil {
      updateEffect()
    }
  }

  private func registerObservers() {
    foregroundObserver = NotificationCenter.default.addObserver(
      forName: UIApplication.willEnterForegroundNotification,
      object: nil,
      queue: .main
    ) { [weak self] _ in
      self?.updateEffect()
    }

    // Re-evaluate the glass/fallback state when the user toggles Reduce
    // Transparency while the view is mounted, so the accessibility fallback
    // takes effect immediately instead of only on the next prop change.
    reduceTransparencyObserver = NotificationCenter.default.addObserver(
      forName: UIAccessibility.reduceTransparencyStatusDidChangeNotification,
      object: nil,
      queue: .main
    ) { [weak self] _ in
      self?.updateEffect()
    }
  }

  deinit {
    if let foregroundObserver {
      NotificationCenter.default.removeObserver(foregroundObserver)
    }
    if let reduceTransparencyObserver {
      NotificationCenter.default.removeObserver(reduceTransparencyObserver)
    }
  }

  private func setupView() {
    let effectView = UIVisualEffectView()
    effectView.autoresizingMask = [.flexibleWidth, .flexibleHeight]
    effectView.frame = bounds

    // Don't clip bounds to allow interactive glass animations to be visible
    effectView.clipsToBounds = false

    addSubview(effectView)
    self.glassEffectView = effectView

    updateEffect()
  }

  // MARK: - Border Radius Methods (called by React Native's style system)

  @objc public func setBorderRadius(_ radius: CGFloat) {
    setBorderRadii(topLeft: radius, topRight: radius, bottomLeft: radius, bottomRight: radius)
  }

  @objc public func setBorderRadii(topLeft: CGFloat, topRight: CGFloat, bottomLeft: CGFloat, bottomRight: CGFloat) {
    topLeftRadius = topLeft
    topRightRadius = topRight
    bottomLeftRadius = bottomLeft
    bottomRightRadius = bottomRight
    updateBorderRadius()
  }

  // MARK: - Batched prop updates

  @objc public func beginBatchUpdate() {
    isBatchingUpdates = true
  }

  @objc public func endBatchUpdate() {
    isBatchingUpdates = false
    updateEffect()
  }

  private func updateEffect() {
    if isBatchingUpdates { return }

    // Honor Reduce Transparency on every path, including the iOS 26 glass API,
    // which otherwise renders full glass and leaves reducedTransparencyFallbackColor
    // dead (the accessibility setting was never observed either).
    if UIAccessibility.isReduceTransparencyEnabled {
      updateFallback()
      return
    }

    // Check if we can use the new API (iOS 26+)
    if #available(iOS 26.0, *) {
      #if compiler(>=6.2)
      let style: UIGlassEffect.Style = glassType == "regular" ? .regular : .clear

      // Always create a new effect to ensure proper rendering
      let effect = UIGlassEffect(style: style)
      // A zero-alpha tint means "no tint": running UIColor.clear (black at
      // alpha 0) through withAlphaComponent would resurrect it as opaque black
      // (issue #113). Otherwise multiply the tint's own alpha by glassOpacity
      // instead of replacing it, so a semi-transparent tint stays semi-transparent.
      let tintAlpha = glassTintColor.cgColor.alpha
      if tintAlpha == 0 {
        effect.tintColor = nil
      } else {
        effect.tintColor = glassTintColor.withAlphaComponent(tintAlpha * glassOpacity)
      }
      effect.isInteractive = isInteractive

      glassEffectView?.effect = effect
      glassEffect = effect
      currentGlassStyle = glassType

      updateBorderRadius()
      #else
      // Fallback for older compilers (Xcode < 16.x) even on newer iOS
      updateFallback()
      #endif
    } else {
      // Fallback for iOS < 26
      updateFallback()
    }
  }

  private func updateFallback() {
    if isBatchingUpdates { return }

    if UIAccessibility.isReduceTransparencyEnabled {
      backgroundColor = reducedTransparencyFallbackColor
      glassEffectView?.effect = nil
    } else {
      backgroundColor = .clear

      let style: UIBlurEffect.Style
      switch glassType {
      case "regular":
        style = .systemMaterial
      case "clear":
        style = .systemUltraThinMaterial
      default:
        style = .regular
      }

      let effect = UIBlurEffect(style: style)
      glassEffectView?.effect = effect

      glassEffectView?.contentView.backgroundColor = .clear
    }

    // Fallback layers can only render a uniform corner radius.
    layer.cornerRadius = topLeftRadius
    glassEffectView?.layer.cornerRadius = topLeftRadius
    glassEffectView?.layer.masksToBounds = true
  }

  private func updateBorderRadius() {
    if #available(iOS 26.0, *) {
      #if compiler(>=6.2)
      glassEffectView?.cornerConfiguration = .corners(
        topLeftRadius: UICornerRadius(floatLiteral: Double(topLeftRadius)),
        topRightRadius: UICornerRadius(floatLiteral: Double(topRightRadius)),
        bottomLeftRadius: UICornerRadius(floatLiteral: Double(bottomLeftRadius)),
        bottomRightRadius: UICornerRadius(floatLiteral: Double(bottomRightRadius))
      )
      #else
      layer.cornerRadius = topLeftRadius
      layer.masksToBounds = true
      #endif
    } else {
      layer.cornerRadius = topLeftRadius
    }
  }

  public override func layoutSubviews() {
    super.layoutSubviews()
    // ignoreSafeArea == false confines the glass to the safe area; true (the
    // JS-side default) lets it fill the whole view.
    glassEffectView?.frame = ignoreSafeArea ? bounds : bounds.inset(by: safeAreaInsets)
  }

  public override func safeAreaInsetsDidChange() {
    super.safeAreaInsetsDidChange()
    setNeedsLayout()
  }

  // For child view mounting
  @objc public func getContentView() -> UIView? {
    if #available(iOS 26.0, *) {
      return glassEffectView?.contentView
    } else {
      return self
    }
  }
}
