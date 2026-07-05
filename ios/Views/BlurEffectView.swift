// BlurEffectView.swift

import UIKit

// MARK: - Blur View with proper intensity control

class BlurEffectView: UIVisualEffectView {
  private var animator: UIViewPropertyAnimator?
  private var blurStyle: UIBlurEffect.Style = .systemMaterial
  private var blurIntensity: Double = 1.0
  private var foregroundObserver: NSObjectProtocol?

  override init(effect: UIVisualEffect?) {
    super.init(effect: effect)
    registerForegroundObserver()
  }

  required init?(coder: NSCoder) {
    super.init(coder: coder)
    registerForegroundObserver()
  }

  func updateBlur(style: UIBlurEffect.Style, intensity: Double) {
    blurStyle = style
    blurIntensity = intensity
    rebuildAnimator()
  }

  // The paused-animator trick is fragile: UIKit flushes the underlying CA
  // animation whenever an ancestor animates alpha (fade navigation
  // transitions, issue #109) and force-finishes paused animators when the app
  // is backgrounded (issue #111). Rebuild whenever the view (re-)enters a
  // window so the intensity is restored after navigation.
  override func didMoveToWindow() {
    super.didMoveToWindow()
    if window != nil {
      rebuildAnimator()
    }
  }

  // Paused animators do not survive backgrounding — the system finishes them,
  // leaving the effect at full intensity (or stripped entirely). Rebuild
  // before the first foreground frame is rendered to avoid a visible flash.
  private func registerForegroundObserver() {
    foregroundObserver = NotificationCenter.default.addObserver(
      forName: UIApplication.willEnterForegroundNotification,
      object: nil,
      queue: .main
    ) { [weak self] _ in
      self?.rebuildAnimator()
    }
  }

  private func rebuildAnimator() {
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
    if let foregroundObserver {
      NotificationCenter.default.removeObserver(foregroundObserver)
    }
  }
}

private func isDetoxPresent() -> Bool {
  let args = ProcessInfo.processInfo.arguments
  return args.contains("-detoxServer") && args.contains("-detoxSessionId")
}
