import UIKit

@objc public class VibrancyEffectView: UIView {

  private let blurEffectView = UIVisualEffectView()
  private let vibrancyEffectView = UIVisualEffectView()
  private var blurAnimator: UIViewPropertyAnimator?
  private var foregroundObserver: NSObjectProtocol?

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
    registerForegroundObserver()
    updateEffect()
  }

  public init(effect: UIVisualEffect?) {
    super.init(frame: .zero)
    setupViews()
    registerForegroundObserver()
    updateEffect()
  }

  required init?(coder: NSCoder) {
    super.init(coder: coder)
    setupViews()
    registerForegroundObserver()
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

  // The vibrancy intensity is baked with a UIViewPropertyAnimator. UIKit resets
  // the effect views' state across background/foreground cycles and can flush a
  // baked animator during transitions, leaving the vibrancy at full intensity.
  // Rebuild whenever the view (re-)enters a window and on foreground so the
  // intensity is restored, matching BlurEffectView.
  public override func didMoveToWindow() {
    super.didMoveToWindow()
    if window != nil {
      updateEffect()
    }
  }

  private func registerForegroundObserver() {
    foregroundObserver = NotificationCenter.default.addObserver(
      forName: UIApplication.willEnterForegroundNotification,
      object: nil,
      queue: .main
    ) { [weak self] _ in
      self?.updateEffect()
    }
  }

  private func updateEffect() {
    let interfaceStyle = interfaceStyleForBlurType(blurType) ?? .unspecified
    overrideUserInterfaceStyle = interfaceStyle

    if let animator = blurAnimator {
      finalizeAnimator(animator)
    }
    blurAnimator = nil

    blurEffectView.effect = nil
    vibrancyEffectView.effect = nil

    let style = styleFromString(blurType)
    let blurEffect = UIBlurEffect(style: style)
    let vibrancyEffect = UIVibrancyEffect(blurEffect: blurEffect)

    blurEffectView.effect = blurEffect
    vibrancyEffectView.effect = vibrancyEffect

    let animator = UIViewPropertyAnimator(duration: 1, curve: .linear) { [weak self] in
      self?.blurEffectView.effect = nil
      self?.vibrancyEffectView.effect = nil
    }
    blurAnimator = animator

    let intensity = min(max(blurAmount / 100.0, 0.0), 1.0)
    animator.fractionComplete = 1.0 - intensity

    DispatchQueue.main.async { [weak self, weak animator] in
      guard let self = self, let currentAnimator = animator, self.blurAnimator === currentAnimator else { return }
      self.finalizeAnimator(currentAnimator)
    }
  }

  // Move the animator to .inactive without violating the UIViewPropertyAnimator
  // state machine: stopAnimation(true) followed by finishAnimation(at:) throws,
  // because finishAnimation is only valid on a stopped animator. Stop it if
  // running, then finish it if stopped, so the effect is baked at its current
  // fraction with no exception.
  private func finalizeAnimator(_ animator: UIViewPropertyAnimator) {
    if animator.state == .active {
      animator.stopAnimation(false)
    }
    if animator.state == .stopped {
      animator.finishAnimation(at: .current)
    }
  }

  deinit {
    if let animator = blurAnimator {
      finalizeAnimator(animator)
    }
    if let foregroundObserver {
      NotificationCenter.default.removeObserver(foregroundObserver)
    }
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
