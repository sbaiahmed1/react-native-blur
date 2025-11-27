import UIKit

// MARK: - Liquid Glass Container (iOS 26+ UIGlassContainerEffect)

#if compiler(>=6.2)
@available(iOS 26.0, *)
@objc public class LiquidGlassContainer: UIVisualEffectView {
  @objc public var spacing: CGFloat = 0 {
    didSet {
      setupView()
    }
  }

  public override func layoutSubviews() {
    super.layoutSubviews()
    setupView()
  }

  private func setupView() {
    let effect = UIGlassContainerEffect()
    effect.spacing = spacing
    self.effect = effect
  }
}
#else
@objc public class LiquidGlassContainer: UIView {
  @objc public var spacing: CGFloat = 0
}
#endif
