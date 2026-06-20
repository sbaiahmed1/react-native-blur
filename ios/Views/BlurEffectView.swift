// BlurEffectView.swift

import UIKit

// MARK: - Blur View with proper intensity control

class BlurEffectView: UIVisualEffectView {
  private var animator: UIViewPropertyAnimator?
  private var blurStyle: UIBlurEffect.Style = .systemMaterial
  private var intensity: Double = 1.0
  private var currentEffectStyle: UIBlurEffect.Style?

  override init(effect: UIVisualEffect?) {
    super.init(effect: effect)
    setupBlur()
  }

  required init?(coder: NSCoder) {
    super.init(coder: coder)
    setupBlur()
  }

  func updateBlur(style: UIBlurEffect.Style, intensity: Double) {
    guard style != self.blurStyle || intensity != self.intensity else { return }
    self.blurStyle = style
    self.intensity = intensity

    // Paused animators hang Detox indefinitely — use on/off blur when Detox is running
    if isDetoxPresent() {
      animator?.stopAnimation(true)
      animator = nil
      effect = intensity > 0 ? UIBlurEffect(style: style) : nil
      return
    }

    if intensity == 1.0 {
      animator?.stopAnimation(true)
      animator = nil
      currentEffectStyle = style
      effect = UIBlurEffect(style: style)
    } else if intensity == 0.0 {
      animator?.stopAnimation(true)
      animator = nil
      currentEffectStyle = nil
      effect = nil
    } else {
      if let existing = animator,
         (existing.state == .active || existing.state == .inactive),
         currentEffectStyle == style {
        existing.fractionComplete = intensity
      } else {
        setupBlur()
      }
    }
  }

  private func setupBlur() {
    if let existing = animator, existing.state == .active {
      existing.stopAnimation(true)
    }
    animator = nil

    effect = nil
    currentEffectStyle = blurStyle

    let newAnimator = UIViewPropertyAnimator(duration: 1, curve: .linear)
    newAnimator.addAnimations { [weak self] in
      self?.effect = UIBlurEffect(style: self?.blurStyle ?? .systemMaterial)
    }
    newAnimator.pausesOnCompletion = true
    newAnimator.startAnimation()
    newAnimator.pauseAnimation()
    newAnimator.fractionComplete = intensity
    animator = newAnimator
  }

  deinit {
    if let animator = animator, animator.state == .active {
      animator.stopAnimation(true)
    }
  }
}

private func isDetoxPresent() -> Bool {
  let args = ProcessInfo.processInfo.arguments
  return args.contains("-detoxServer") && args.contains("-detoxSessionId")
}

