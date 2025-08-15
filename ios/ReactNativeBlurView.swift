// ReactNativeBlurView.swift

import SwiftUI
import UIKit

// MARK: Blur View with proper intensity control

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
    animator?.stopAnimation(true)
    animator?.finishAnimation(at: .current)
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

// MARK: - Helper Functions

private func blurStyleFromString(_ styleString: String) -> UIBlurEffect.Style {
  switch styleString {
  case "xlight":
    return .extraLight
  case "light":
    return .light
  case "dark":
    return .dark
  case "extraDark":
    return .systemThickMaterialDark
  case "regular":
    return .regular
  case "prominent":
    return .prominent
  case "systemUltraThinMaterial":
    return .systemUltraThinMaterial
  case "systemThinMaterial":
    return .systemThinMaterial
  case "systemMaterial":
    return .systemMaterial
  case "systemThickMaterial":
    return .systemThickMaterial
  case "systemChromeMaterial":
    return .systemChromeMaterial
  default:
    return .extraLight
  }
}

@available(iOS 26.0, *)
private func glassEffectFromString(_ glassTypeString: String) -> Glass {
  switch glassTypeString {
  case "regular":
    return .regular
  case "clear":
    return .clear
  default:
    return .clear
  }
}

// MARK: - Helper Functions for Blur Amount Mapping

/// Maps blur amount (0-100) to proper blur intensity using UIViewPropertyAnimator approach
private func mapBlurAmountToIntensity(_ amount: Double) -> Double {
  let clampedAmount = max(0.0, min(100.0, amount))
  
  // Map 0-100 to 0-1.0 intensity for smooth progression
  return clampedAmount / 100.0
}

/// No longer needed - using single smooth opacity curve instead of enhanced blur overlay
private func getEnhancedBlurIntensity(_ amount: Double) -> Double {
  return 0.0
}

// MARK: - Simple SwiftUI View

private struct BasicColoredView: View {
  var glassTintColor: UIColor
  var glassOpacity: Double
  var blurAmount: Double
  var blurStyle: UIBlurEffect.Style
  var type: String
  var glassType: String
  var reducedTransparencyFallbackColor: UIColor
  
  var body: some View {
    let blurIntensity = mapBlurAmountToIntensity(blurAmount)
    
    // Check if reduced transparency is enabled
    let isReducedTransparencyEnabled = UIAccessibility.isReduceTransparencyEnabled
    
    if isReducedTransparencyEnabled {
      // Use fallback color when reduced transparency is enabled
      Rectangle()
        .fill(Color(reducedTransparencyFallbackColor))
    } else {
      if (type == "liquidGlass"){
        if #available(iOS 26.0, *) {
          let baseGlassEffect = glassEffectFromString(glassType)
          Rectangle()
            .fill(Color(.clear))
            .glassEffect(
              baseGlassEffect
                .tint(Color(glassTintColor)
                  .opacity(glassOpacity))
                .interactive(true)
              , in: .rect)
          
        } else {
          // Use proper blur intensity control for liquid glass fallback
          Rectangle()
            .fill(Color(.clear))
            .background(Blur(style: .regular, intensity: blurIntensity))
        }
      }else {
        // Use proper blur intensity control for regular blur
        Rectangle()
          .fill(Color(.clear))
          .background(Blur(style: blurStyle, intensity: blurIntensity))
      }
    }
  }
}

// MARK: - UIKit Wrapper

@objc public class AdvancedBlurView: UIView {
  
  private var hostingController: UIHostingController<BasicColoredView>?
  
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
  
  @objc public var blurAmount: Double = 10.0 {
    didSet {
      updateView()
    }
  }
  
  @objc public var type: String = "blur" {
    didSet {
      updateView()
    }
  }
  
  @objc public var blurTypeString: String = "xlight" {
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
  
  public override init(frame: CGRect) {
    super.init(frame: frame)
    setupHostingController()
  }
  
  required init?(coder: NSCoder) {
    super.init(coder: coder)
    setupHostingController()
  }
  
  private func setupHostingController() {
    let blurStyle = blurStyleFromString(blurTypeString)
    let swiftUIView = BasicColoredView(glassTintColor: glassTintColor, glassOpacity: glassOpacity, blurAmount: blurAmount, blurStyle: blurStyle, type: type, glassType: glassType, reducedTransparencyFallbackColor: reducedTransparencyFallbackColor)
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
    let blurStyle = blurStyleFromString(blurTypeString)
    let newSwiftUIView = BasicColoredView(glassTintColor: glassTintColor, glassOpacity: glassOpacity, blurAmount: blurAmount, blurStyle: blurStyle, type:type, glassType: glassType, reducedTransparencyFallbackColor: reducedTransparencyFallbackColor)
    hostingController?.rootView = newSwiftUIView
  }
}

// MARK: - Objective-C Bridging Helpers

@objc public class ReactNativeBlurViewHelper: NSObject {
  
  /// Creates and returns a view containing a colored rectangle.
  @objc public static func createBlurViewWithFrame(_ frame: CGRect) -> AdvancedBlurView {
    return AdvancedBlurView(frame: frame)
  }
  
  /// Updates the blur view with a new glass tint color.
  @objc public static func updateBlurView(_ blurView: AdvancedBlurView, withGlassTintColor glassTintColor: UIColor) {
    blurView.glassTintColor = glassTintColor
  }
  
  /// Updates the blur view with a new glass opacity.
  @objc public static func updateBlurView(_ blurView: AdvancedBlurView, withGlassOpacity glassOpacity: Double) {
    blurView.glassOpacity = glassOpacity
  }
  
  /// Updates the blur view with a new blur amount.
  @objc public static func updateBlurView(_ blurView: AdvancedBlurView, withBlurAmount blurAmount: Double) {
    blurView.blurAmount = blurAmount
  }
  
  /// Updates the blur view with a new blur type.
  @objc public static func updateBlurView(_ blurView: AdvancedBlurView, withBlurType blurType: String) {
    blurView.blurTypeString = blurType
  }
  
  /// Updates the blur view with a new glass type.
  @objc public static func updateBlurView(_ blurView: AdvancedBlurView, withGlassType glassType: String) {
    blurView.glassType = glassType
  }
  
  /// Updates the blur view with a new blur style.
  @objc public static func updateBlurView(_ blurView: AdvancedBlurView, withType type: String) {
    blurView.type = type
  }
  
  /// Updates the blur view with a new reduced transparency fallback color.
  @objc public static func updateBlurView(_ blurView: AdvancedBlurView, withReducedTransparencyFallbackColor fallbackColor: UIColor) {
    blurView.reducedTransparencyFallbackColor = fallbackColor
  }
  
  /// No-op updater kept for API compatibility.
  @objc public static func updateBlurView(_ blurView: AdvancedBlurView) {
    // Nothing to update in the minimal implementation
  }
}

