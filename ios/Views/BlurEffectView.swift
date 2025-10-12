// BlurEffectView.swift

import SwiftUI
import UIKit

// MARK: - Blur View with proper intensity control

class BlurEffectView: UIVisualEffectView {
  private var animator: UIViewPropertyAnimator?
  private var blurStyle: UIBlurEffect.Style = .systemMaterial
  private var intensity: Double = 1.0

  override init(effect: UIVisualEffect?) {
    super.init(effect: effect)
    setupBlur()
  }

  required init?(coder: NSCoder) {
    super.init(coder: coder)
    setupBlur()
  }

  func updateBlur(style: UIBlurEffect.Style, intensity: Double) {
    self.blurStyle = style
    self.intensity = intensity
    setupBlur()
  }

  private func setupBlur() {
    // Clean up existing animator
    if let animator = animator {
      animator.stopAnimation(true)
      animator.finishAnimation(at: .current)
    }
    animator = nil

    // Reset effect
    effect = nil

    // Create new animator
    animator = UIViewPropertyAnimator(duration: 1, curve: .linear)
    animator?.addAnimations { [weak self] in
      self?.effect = UIBlurEffect(style: self?.blurStyle ?? .systemMaterial)
    }

    // Set intensity and pause
    animator?.fractionComplete = intensity
    animator?.pauseAnimation()
  }

  deinit {
    animator?.stopAnimation(true)
    animator?.finishAnimation(at: .current)
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