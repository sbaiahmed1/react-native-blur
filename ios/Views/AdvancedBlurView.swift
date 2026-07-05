import UIKit

@objc public class AdvancedBlurView: UIView {

  private let blurView = BlurEffectView(effect: nil)

  @objc public var blurAmount: Double = 10.0 {
    didSet { updateBlur() }
  }

  @objc public var blurTypeString: String = "xlight" {
    didSet { updateBlur() }
  }

  @objc public var reducedTransparencyFallbackColor: UIColor = .white {
    didSet { updateBlur() }
  }

  @objc public var ignoreSafeArea: Bool = false {
    didSet { setNeedsLayout() }
  }

  private var reduceTransparencyObserver: NSObjectProtocol?

  public override init(frame: CGRect) {
    super.init(frame: frame)
    setupBlurView()
  }

  required init?(coder: NSCoder) {
    super.init(coder: coder)
    setupBlurView()
  }

  private func setupBlurView() {
    blurView.frame = bounds
    addSubview(blurView)

    // Re-evaluate the blur/fallback state when the user toggles Reduce
    // Transparency while the view is mounted — otherwise the state computed
    // at the last prop change goes stale.
    reduceTransparencyObserver = NotificationCenter.default.addObserver(
      forName: UIAccessibility.reduceTransparencyStatusDidChangeNotification,
      object: nil,
      queue: .main
    ) { [weak self] _ in
      self?.updateBlur()
    }
  }

  deinit {
    if let reduceTransparencyObserver {
      NotificationCenter.default.removeObserver(reduceTransparencyObserver)
    }
  }

  public override func layoutSubviews() {
    super.layoutSubviews()
    // ignoreSafeArea == false confines the blur to the safe area; true (the
    // JS-side default) lets it fill the whole view.
    blurView.frame = ignoreSafeArea ? bounds : bounds.inset(by: safeAreaInsets)
  }

  public override func safeAreaInsetsDidChange() {
    super.safeAreaInsetsDidChange()
    setNeedsLayout()
  }

  private func updateBlur() {
    let interfaceStyle = interfaceStyleForBlurType(blurTypeString) ?? .unspecified
    overrideUserInterfaceStyle = interfaceStyle
    blurView.overrideUserInterfaceStyle = interfaceStyle

    if UIAccessibility.isReduceTransparencyEnabled {
      blurView.isHidden = true
      backgroundColor = reducedTransparencyFallbackColor
      return
    }

    blurView.isHidden = false
    backgroundColor = .clear

    let style = blurStyleFromString(blurTypeString)
    let intensity = mapBlurAmountToIntensity(blurAmount)
    blurView.updateBlur(style: style, intensity: intensity)
  }
}
