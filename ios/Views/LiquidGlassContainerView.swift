import UIKit

// MARK: - UIKit-only Wrapper for Liquid Glass (following Expo's approach)

@objc public class LiquidGlassContainerView: UIView {
  private var glassEffectView: UIVisualEffectView?
  private var glassEffect: Any?
  private var currentGlassStyle: String = "clear" // Track current style

  @objc public var glassTintColor: UIColor = .clear {
    didSet {
      updateEffect()
    }
  }

  @objc public var glassOpacity: Double = 1.0 {
    didSet {
      updateEffect()
    }
  }

  @objc public var glassType: String = "clear" {
    didSet {
      updateEffect()
    }
  }

  @objc public var reducedTransparencyFallbackColor: UIColor = .white {
    didSet {
      updateFallback()
    }
  }

  @objc public var isInteractive: Bool = true {
    didSet {
      updateEffect()
    }
  }

  @objc public var ignoreSafeArea: Bool = false {
    didSet {
      // Not used in UIKit approach
    }
  }

  @objc public var ignoreAccessibilityFallback: Bool = false {
    didSet {
      updateEffect()
    }
  }

  // Border radius storage for React Native's style system
  private var topLeftRadius: CGFloat = 0
  private var topRightRadius: CGFloat = 0
  private var bottomLeftRadius: CGFloat = 0
  private var bottomRightRadius: CGFloat = 0
  private var allBorderRadius: CGFloat = 0

  public override init(frame: CGRect) {
    super.init(frame: frame)
    setupView()
  }

  required init?(coder: NSCoder) {
    super.init(coder: coder)
    setupView()
  }

  private func setupView() {
    let effectView = UIVisualEffectView()
    effectView.autoresizingMask = [.flexibleWidth, .flexibleHeight]
    effectView.frame = bounds
    
    // Don't clip bounds to allow interactive glass animations to be visible
    effectView.clipsToBounds = false
    
    addSubview(effectView)
    self.glassEffectView = effectView
    
    updateEffect()
  }

  // MARK: - Border Radius Methods (called by React Native's style system)
  
  @objc public func setBorderRadius(_ radius: CGFloat) {
    allBorderRadius = radius
    updateBorderRadius()
  }

  private func updateEffect() {
    if #available(iOS 26.0, *) {
      #if compiler(>=6.2)
      // Check if we should show fallback due to accessibility
      if UIAccessibility.isReduceTransparencyEnabled && !ignoreAccessibilityFallback {
        backgroundColor = reducedTransparencyFallbackColor
        glassEffectView?.isHidden = true
      } else {
        let style: UIGlassEffect.Style = glassType == "regular" ? .regular : .clear
        
        // Always create a new effect to ensure proper rendering
        let effect = UIGlassEffect(style: style)
        effect.tintColor = glassTintColor.withAlphaComponent(glassOpacity)
        effect.isInteractive = isInteractive
        
        glassEffectView?.effect = effect
        glassEffectView?.isHidden = false
        backgroundColor = .clear
        glassEffect = effect
        currentGlassStyle = glassType
        
        updateBorderRadius()
      }
      #endif
    } else {
      // Fallback for iOS < 26
      updateFallback()
    }
  }

  private func updateFallback() {
    if #available(iOS 26.0, *) {
      // Check if we should show fallback even on iOS 26+
      if UIAccessibility.isReduceTransparencyEnabled && !ignoreAccessibilityFallback {
        backgroundColor = reducedTransparencyFallbackColor
        glassEffectView?.isHidden = true
      } else {
        glassEffectView?.isHidden = false
        backgroundColor = .clear
      }
    } else {
      backgroundColor = reducedTransparencyFallbackColor
      layer.cornerRadius = allBorderRadius
    }
  }

  private func updateBorderRadius() {
    if #available(iOS 26.0, *) {
      #if compiler(>=6.2)
      let topLeft = UICornerRadius(floatLiteral: Double(allBorderRadius))
      let topRight = UICornerRadius(floatLiteral: Double(allBorderRadius))
      let bottomLeft = UICornerRadius(floatLiteral: Double(allBorderRadius))
      let bottomRight = UICornerRadius(floatLiteral: Double(allBorderRadius))
      
      glassEffectView?.cornerConfiguration = .corners(
        topLeftRadius: topLeft,
        topRightRadius: topRight,
        bottomLeftRadius: bottomLeft,
        bottomRightRadius: bottomRight
      )
      #else
      layer.cornerRadius = allBorderRadius
      layer.masksToBounds = true
      #endif
    } else {
      layer.cornerRadius = allBorderRadius
    }
  }

  public override func layoutSubviews() {
    super.layoutSubviews()
    glassEffectView?.frame = bounds
  }
  
  // For child view mounting
  @objc public func getContentView() -> UIView? {
    if #available(iOS 26.0, *) {
      return glassEffectView?.contentView
    } else {
      return self
    }
  }
}
