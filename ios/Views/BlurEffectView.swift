// BlurEffectView.swift

import SwiftUI
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

// MARK: - SwiftUI Blur Wrapper

struct Blur: UIViewRepresentable {
  var style: UIBlurEffect.Style = .systemMaterial
  var intensity: Double = 1.0

  func makeUIView(context: Context) -> BlurEffectView {
    let effectView = BlurEffectView(effect: nil)
    effectView.updateBlur(style: style, intensity: intensity)
    return effectView
  }

  func updateUIView(_ uiView: BlurEffectView, context: Context) {
    uiView.updateBlur(style: style, intensity: intensity)
  }
}
