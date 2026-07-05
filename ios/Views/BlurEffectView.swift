// BlurEffectView.swift

import UIKit

// MARK: - Blur View with proper intensity control

class BlurEffectView: UIVisualEffectView {
  private var animator: UIViewPropertyAnimator?
  private var blurStyle: UIBlurEffect.Style = .systemMaterial
  private var blurIntensity: Double = 1.0

  override init(effect: UIVisualEffect?) {
    super.init(effect: effect)
  }

  required init?(coder: NSCoder) {
    super.init(coder: coder)
  }

  func updateBlur(style: UIBlurEffect.Style, intensity: Double) {
    blurStyle = style
    blurIntensity = intensity
    setNeedsDisplay()
  }

  // draw(_:) is called by UIVisualEffectView whenever the effect needs to refresh —
  // including when the view re-enters a window after navigation. Rebuilding the
  // animator here ensures intensity is always correct on re-appearance.
  override func draw(_ rect: CGRect) {
    super.draw(rect)

    // Paused animators hang Detox indefinitely — use on/off blur when Detox is running
    if isDetoxPresent() {
      effect = blurIntensity > 0 ? UIBlurEffect(style: blurStyle) : nil
      return
    }

    effect = nil
    animator?.stopAnimation(true)
    animator = UIViewPropertyAnimator(duration: 1, curve: .linear) { [weak self] in
      guard let self else { return }
      self.effect = UIBlurEffect(style: self.blurStyle)
    }
    animator?.fractionComplete = CGFloat(blurIntensity)
  }

  deinit {
    animator?.stopAnimation(true)
  }
}

private func isDetoxPresent() -> Bool {
  let args = ProcessInfo.processInfo.arguments
  return args.contains("-detoxServer") && args.contains("-detoxSessionId")
}

