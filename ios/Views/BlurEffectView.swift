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
    // Skip expensive animator recreation when nothing changed.
    // During FlashList recycling, updateUIView fires on every layout pass
    // even when props are identical, causing jank (issue #100).
    guard style != self.blurStyle || intensity != self.intensity else { return }
    self.blurStyle = style
    self.intensity = intensity
    setupBlur()
  }

  override func didMoveToWindow() {
    super.didMoveToWindow()
    guard window != nil else { return }
    // UIKit resumes paused CAAnimations when a view re-joins a window
    // (e.g. after modal dismiss + re-present). If the animation plays
    // toward its end state the blur drifts to full intensity. Re-pause
    // and re-set the fraction here to lock it back to our intended value.
    // pausesOnCompletion = true (set in setupBlur) ensures the animator
    // stays .active even if it reaches fraction 1.0, so this is always safe.
    animator?.pauseAnimation()
    animator?.fractionComplete = intensity
  }

  private func setupBlur() {
    if let existing = animator, existing.state == .active {
      existing.stopAnimation(true)
    }
    animator = nil

    effect = nil

    let newAnimator = UIViewPropertyAnimator(duration: 1, curve: .linear)
    newAnimator.addAnimations { [weak self] in
      self?.effect = UIBlurEffect(style: self?.blurStyle ?? .systemMaterial)
    }
    // pausesOnCompletion: if UIKit ever resumes and runs this to the end,
    // the animator stays .active (paused at 1.0) instead of going .inactive.
    // This guarantees didMoveToWindow can always call pauseAnimation() safely.
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
