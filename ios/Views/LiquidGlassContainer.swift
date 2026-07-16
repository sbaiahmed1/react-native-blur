import UIKit

// MARK: - Liquid Glass Container (iOS 26+ UIGlassContainerEffect)

#if compiler(>=6.2)
@objc public class LiquidGlassContainer: UIVisualEffectView {
  @objc public var spacing: CGFloat = 0 {
    didSet {
      if spacing != oldValue, #available(iOS 26.0, *) {
        setupView()
      }
    }
  }

  public override func layoutSubviews() {
    super.layoutSubviews()
    if #available(iOS 26.0, *) {
      // Only (re)build the container effect when it is missing. UIKit can drop
      // it across transitions/backgrounding, and a layout pass runs on window
      // re-entry, so this self-heals. Rebuilding on every layout pass instead
      // restarted the glass-merge animation each frame (perf churn).
      if effect == nil {
        setupView()
      }
    }
  }

  @available(iOS 26.0, *)
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
