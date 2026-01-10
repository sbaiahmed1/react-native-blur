import UIKit

@objc public class VibrancyEffectView: UIView {

  private let blurEffectView = UIVisualEffectView()
  private let vibrancyEffectView = UIVisualEffectView()
  private var blurAnimator: UIViewPropertyAnimator?

  @objc public var blurType: String = "xlight" {
    didSet {
      updateEffect()
    }
  }

  @objc public var blurAmount: Double = 10.0 {
    didSet {
      updateEffect()
    }
  }

  @objc public var contentView: UIView {
    return vibrancyEffectView.contentView
  }

  public override init(frame: CGRect) {
    super.init(frame: frame)
    setupViews()
    updateEffect()
  }

  public init(effect: UIVisualEffect?) {
    super.init(frame: .zero)
    setupViews()
    updateEffect()
  }

  required init?(coder: NSCoder) {
    super.init(coder: coder)
    setupViews()
    updateEffect()
  }

  private func setupViews() {
    // Setup blur view
    blurEffectView.frame = bounds
    blurEffectView.autoresizingMask = [.flexibleWidth, .flexibleHeight]
    addSubview(blurEffectView)

    // Setup vibrancy view inside blur view's contentView
    vibrancyEffectView.frame = blurEffectView.contentView.bounds
    vibrancyEffectView.autoresizingMask = [.flexibleWidth, .flexibleHeight]
    blurEffectView.contentView.addSubview(vibrancyEffectView)
  }

  private func updateEffect() {
    // Clean up existing animator
    if let animator = blurAnimator {
      animator.stopAnimation(true)
      animator.finishAnimation(at: .current)
    }
    blurAnimator = nil

    // Reset effects
    blurEffectView.effect = nil
    vibrancyEffectView.effect = nil

    let style = styleFromString(blurType)
    let blurEffect = UIBlurEffect(style: style)
    let vibrancyEffect = UIVibrancyEffect(blurEffect: blurEffect)

    // Use animator to control blur intensity
    blurAnimator = UIViewPropertyAnimator(duration: 1, curve: .linear)
    blurAnimator?.addAnimations { [weak self] in
      self?.blurEffectView.effect = blurEffect
      self?.vibrancyEffectView.effect = vibrancyEffect
    }

    // Convert blurAmount (0-100) to intensity (0.0-1.0)
    let intensity = min(max(blurAmount / 100.0, 0.0), 1.0)
    blurAnimator?.fractionComplete = intensity

    // Stop the animation at the current state
    DispatchQueue.main.async { [weak self, weak blurAnimator] in
        // Only stop the animator if it's still the current one
        guard let self = self, let currentAnimator = self.blurAnimator, currentAnimator === blurAnimator else { return }
        
        currentAnimator.stopAnimation(true)
        currentAnimator.finishAnimation(at: .current)
    }
  }

  deinit {
    guard let animator = blurAnimator, animator.state == .active else { return }
    animator.stopAnimation(true)
    animator.finishAnimation(at: .current)
  }
    
    // Helper to parse string to UIBlurEffect.Style
    private func styleFromString(_ style: String) -> UIBlurEffect.Style {
        switch style {
        case "xlight": return .extraLight
        case "light": return .light
        case "dark": return .dark
        case "regular": return .regular
        case "prominent": return .prominent
        case "systemUltraThinMaterial": return .systemUltraThinMaterial
        case "systemThinMaterial": return .systemThinMaterial
        case "systemMaterial": return .systemMaterial
        case "systemThickMaterial": return .systemThickMaterial
        case "systemChromeMaterial": return .systemChromeMaterial
        case "systemUltraThinMaterialLight": return .systemUltraThinMaterialLight
        case "systemThinMaterialLight": return .systemThinMaterialLight
        case "systemMaterialLight": return .systemMaterialLight
        case "systemThickMaterialLight": return .systemThickMaterialLight
        case "systemChromeMaterialLight": return .systemChromeMaterialLight
        case "systemUltraThinMaterialDark": return .systemUltraThinMaterialDark
        case "systemThinMaterialDark": return .systemThinMaterialDark
        case "systemMaterialDark": return .systemMaterialDark
        case "systemThickMaterialDark": return .systemThickMaterialDark
        case "systemChromeMaterialDark": return .systemChromeMaterialDark
        default: return .regular
        }
    }
}
