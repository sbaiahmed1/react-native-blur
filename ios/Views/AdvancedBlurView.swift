import SwiftUI
import UIKit

// MARK: - UIKit Wrapper for Blur

@objc public class AdvancedBlurView: UIView {

  private var hostingController: UIHostingController<BasicColoredView>?

  @objc public var blurAmount: Double = 10.0 {
    didSet {
      updateView()
    }
  }

  @objc public var blurTypeString: String = "xlight" {
    didSet {
      updateView()
    }
  }

  @objc public var reducedTransparencyFallbackColor: UIColor = .white {
    didSet {
      updateView()
    }
  }

  @objc public var ignoreSafeArea: Bool = false {
    didSet {
      updateView()
    }
 }

  public override init(frame: CGRect) {
    super.init(frame: frame)
  }

  required init?(coder: NSCoder) {
    super.init(coder: coder)
  }

  public override func layoutSubviews() {
    super.layoutSubviews()
    // Defer controller setup until we have a valid frame to avoid issues with initial render
    // in complex layouts (e.g. FlashList with dynamic content)
    if hostingController == nil && bounds.width > 0 && bounds.height > 0 {
      setupHostingController()
    }
  }

  private func setupHostingController() {
    // Completely remove old hosting controller
    if let oldHosting = hostingController {
      oldHosting.view.removeFromSuperview()
      oldHosting.removeFromParent()
    }
    hostingController = nil

    let blurStyle = blurStyleFromString(blurTypeString)
    let swiftUIView = BasicColoredView(
      blurAmount: blurAmount,
      blurStyle: blurStyle,
      ignoreSafeArea: ignoreSafeArea,
      reducedTransparencyFallbackColor: reducedTransparencyFallbackColor
    )

    let hosting = UIHostingController(rootView: swiftUIView)
    hosting.view.backgroundColor = .clear
    hosting.view.translatesAutoresizingMaskIntoConstraints = false

    addSubview(hosting.view)
    NSLayoutConstraint.activate([
      hosting.view.topAnchor.constraint(equalTo: topAnchor),
      hosting.view.leadingAnchor.constraint(equalTo: leadingAnchor),
      hosting.view.trailingAnchor.constraint(equalTo: trailingAnchor),
      hosting.view.bottomAnchor.constraint(equalTo: bottomAnchor)
    ])

    self.hostingController = hosting
  }

  private func updateView() {
    if hostingController != nil {
      setupHostingController()
    }
  }

  public override func didMoveToSuperview() {
    super.didMoveToSuperview()
  }

  public override func didMoveToWindow() {
    super.didMoveToWindow()
  }

  deinit {
    if let hosting = hostingController {
      hosting.view.removeFromSuperview()
      hosting.removeFromParent()
    }
    hostingController = nil
  }
}
