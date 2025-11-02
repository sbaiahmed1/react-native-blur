import SwiftUI
import UIKit

// MARK: - UIKit Wrapper for Liquid Glass

@objc public class LiquidGlassContainerView: UIView {

  private var hostingController: UIHostingController<LiquidGlassContentView>?

  @objc public var glassTintColor: UIColor = .clear {
    didSet {
      updateView()
    }
  }

  @objc public var glassOpacity: Double = 1.0 {
    didSet {
      updateView()
    }
  }

  @objc public var glassType: String = "clear" {
    didSet {
      updateView()
    }
  }

  @objc public var reducedTransparencyFallbackColor: UIColor = .white {
    didSet {
      updateView()
    }
  }

  @objc public var isInteractive: Bool = true {
    didSet {
      updateView()
    }
  }

  @objc public var ignoreSafeArea: Bool = false {
    didSet {
      updateView()
    }
  }

  @objc public var borderRadius: Double = 0 {
    didSet {
      updateView()
    }
  }

  public override init(frame: CGRect) {
    super.init(frame: frame)
    setupHostingController()
  }

  required init?(coder: NSCoder) {
    super.init(coder: coder)
    setupHostingController()
  }

  public override func layoutSubviews() {
    super.layoutSubviews()
    if hostingController == nil {
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

    let swiftUIView = LiquidGlassContentView(
      glassTintColor: glassTintColor,
      glassOpacity: glassOpacity,
      glassType: glassType,
      reducedTransparencyFallbackColor: reducedTransparencyFallbackColor,
      isInteractive: isInteractive,
      borderRadius: borderRadius,
      ignoreSafeArea: ignoreSafeArea
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
    setupHostingController()
  }

  public override func didMoveToSuperview() {
    super.didMoveToSuperview()
    if superview != nil {
      setupHostingController()
    }
  }
  
  public override func didMoveToWindow() {
    super.didMoveToWindow()
    if window != nil {
      setupHostingController()
    }
  }

  deinit {
    if let hosting = hostingController {
      hosting.view.removeFromSuperview()
      hosting.removeFromParent()
    }
    hostingController = nil;
  }
}
