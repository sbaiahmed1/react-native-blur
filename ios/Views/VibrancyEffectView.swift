import UIKit

@objc public class VibrancyEffectView: UIView {

  private let blurEffectView = UIVisualEffectView()
  private let vibrancyEffectView = UIVisualEffectView()
  private var blurAnimator: UIViewPropertyAnimator?
  private var foregroundObserver: NSObjectProtocol?
  private var stabilizationDisplayLink: CADisplayLink?
  private var stabilizationFramesRemaining = 0

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

  // Partial UIVisualEffectView intensity depends on a live property animator.
  // UIKit can flush that animator during mounting, transitions, and
  // background/foreground cycles, so rebuild it at each lifecycle boundary.
  public override func didMoveToWindow() {
    super.didMoveToWindow()
    if window != nil {
      updateEffect()
      startStabilizationIfNeeded()
      return
    }

    stopStabilization()
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

    blurAnimator?.stopAnimation(true)

    blurEffectView.effect = nil
    vibrancyEffectView.effect = nil

    let style = blurStyleFromString(blurType)
    let blurEffect = UIBlurEffect(style: style)
    let vibrancyEffect = UIVibrancyEffect(blurEffect: blurEffect)

    let animator = UIViewPropertyAnimator(duration: 1, curve: .linear) { [weak self] in
      self?.blurEffectView.effect = blurEffect
      self?.vibrancyEffectView.effect = vibrancyEffect
    }
    blurAnimator = animator

    let intensity = min(max(blurAmount / 100.0, 0.0), 1.0)
    animator.fractionComplete = intensity
  }

  private func startStabilizationIfNeeded() {
    stopStabilization()

    guard window != nil else {
      return
    }

    stabilizationFramesRemaining = 3

    let displayLink = CADisplayLink(target: self, selector: #selector(handleStabilizationTick))
    displayLink.add(to: .main, forMode: .common)
    stabilizationDisplayLink = displayLink
  }

  private func stopStabilization() {
    stabilizationDisplayLink?.invalidate()
    stabilizationDisplayLink = nil
    stabilizationFramesRemaining = 0
  }

  @objc
  private func handleStabilizationTick() {
    guard window != nil, stabilizationFramesRemaining > 0 else {
      stopStabilization()
      return
    }

    updateEffect()
    stabilizationFramesRemaining -= 1

    if stabilizationFramesRemaining == 0 {
      stopStabilization()
    }
  }

  deinit {
    stopStabilization()
    blurAnimator?.stopAnimation(true)
    if let foregroundObserver {
      NotificationCenter.default.removeObserver(foregroundObserver)
    }
  }
}
