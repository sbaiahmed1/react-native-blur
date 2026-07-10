// BlurEffectView.swift

import UIKit

// MARK: - Blur View with proper intensity control

class BlurEffectView: UIVisualEffectView {
  private var animator: UIViewPropertyAnimator?
  private var blurStyle: UIBlurEffect.Style = .systemMaterial
  private var blurIntensity: Double = 1.0
  private var foregroundObserver: NSObjectProtocol?
  private var stabilizationDisplayLink: CADisplayLink?
  private var stabilizationFramesRemaining = 0

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
    startStabilizationIfNeeded()
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
      startStabilizationIfNeeded()
      return
    }

    stopStabilization()
  }

  // draw(_:) is called by UIVisualEffectView whenever the effect needs to
  // refresh (expo-blur's approach). It heals cases the two hooks above miss:
  // the animator being flushed by an in-place alpha animation while the view
  // stays in the window and the app stays foreground.
  override func draw(_ rect: CGRect) {
    super.draw(rect)
    rebuildAnimator()
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

  private func startStabilizationIfNeeded() {
    stopStabilization()

    guard window != nil else {
      return
    }

    // UIKit can still invalidate the paused blur animator during the first few
    // transition frames after mount. Rebuild across a tiny bounded window so
    // the correct material state is restored without a user-visible delay.
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
    guard window != nil else {
      stopStabilization()
      return
    }

    guard stabilizationFramesRemaining > 0 else {
      stopStabilization()
      return
    }

    rebuildAnimator()
    stabilizationFramesRemaining -= 1

    if stabilizationFramesRemaining == 0 {
      stopStabilization()
    }
  }

  deinit {
    stopStabilization()
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
