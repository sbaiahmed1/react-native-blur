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
    didSet { updateBlur() }
  }

  public override init(frame: CGRect) {
    super.init(frame: frame)
    blurView.autoresizingMask = [.flexibleWidth, .flexibleHeight]
    blurView.frame = bounds
    addSubview(blurView)
  }

  required init?(coder: NSCoder) {
    super.init(coder: coder)
    blurView.autoresizingMask = [.flexibleWidth, .flexibleHeight]
    blurView.frame = bounds
    addSubview(blurView)
  }

  public override func layoutSubviews() {
    super.layoutSubviews()
    blurView.frame = bounds
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
