// Pins the Swift API mirrored by spm-headers/ReactNativeBlur-Swift.h. If this
// file fails to compile, update both files together.
import UIKit

private let _viewTypes: [UIView.Type] = [
  AdvancedBlurView.self, LiquidGlassContainer.self,
  LiquidGlassContainerView.self, ProgressiveBlurView.self,
  VibrancyEffectView.self,
]

private let _helperTypes: [NSObject.Type] = [
  ReactNativeBlurViewHelper.self, ReactNativeLiquidGlassContainerHelper.self,
  ReactNativeLiquidGlassViewHelper.self, ReactNativeProgressiveBlurViewHelper.self,
  ReactNativeVibrancyViewHelper.self,
]

@MainActor private func _pinBlur(_ frame: CGRect, _ view: AdvancedBlurView, _ color: UIColor) {
  let amount: Double = 1
  let created: AdvancedBlurView = ReactNativeBlurViewHelper.createBlurViewWithFrame(frame)
  _ = created
  ReactNativeBlurViewHelper.updateBlurView(view, withBlurAmount: amount)
  ReactNativeBlurViewHelper.updateBlurView(view, withBlurType: "regular")
  ReactNativeBlurViewHelper.updateBlurView(view, withReducedTransparencyFallbackColor: color)
  ReactNativeBlurViewHelper.updateBlurView(view, withIgnoringSafeArea: false)
}

@MainActor private func _pinContainer(_ frame: CGRect, _ view: LiquidGlassContainer) {
  let spacing: Double = 1
  let created: LiquidGlassContainer = ReactNativeLiquidGlassContainerHelper.createLiquidGlassContainerWithFrame(frame)
  _ = created
  ReactNativeLiquidGlassContainerHelper.updateLiquidGlassContainer(view, withSpacing: spacing)
}

@MainActor private func _pinGlass(_ frame: CGRect, _ view: LiquidGlassContainerView, _ color: UIColor) {
  let value: Double = 1
  let created: LiquidGlassContainerView = ReactNativeLiquidGlassViewHelper.createLiquidGlassViewWithFrame(frame)
  _ = created
  ReactNativeLiquidGlassViewHelper.updateLiquidGlassView(view, withGlassTintColor: color)
  ReactNativeLiquidGlassViewHelper.updateLiquidGlassView(view, withGlassOpacity: value)
  ReactNativeLiquidGlassViewHelper.updateLiquidGlassView(view, withGlassType: "clear")
  ReactNativeLiquidGlassViewHelper.updateLiquidGlassView(view, withIsInteractive: true)
  ReactNativeLiquidGlassViewHelper.updateLiquidGlassView(view, withIgnoringSafeArea: false)
  ReactNativeLiquidGlassViewHelper.updateLiquidGlassView(view, withReducedTransparencyFallbackColor: color)
  view.beginBatchUpdate()
  view.endBatchUpdate()
  let radius: CGFloat = 1
  view.setBorderRadii(topLeft: radius, topRight: radius, bottomLeft: radius, bottomRight: radius)
  let contentView: UIView? = view.getContentView()
  _ = contentView
}

@MainActor private func _pinProgressive(_ frame: CGRect, _ view: ProgressiveBlurView, _ color: UIColor) {
  let value: Double = 1
  let created: ProgressiveBlurView = ReactNativeProgressiveBlurViewHelper.createProgressiveBlurViewWithFrame(frame)
  _ = created
  ReactNativeProgressiveBlurViewHelper.updateProgressiveBlurView(view, withBlurAmount: value)
  ReactNativeProgressiveBlurViewHelper.updateProgressiveBlurView(view, withDirection: "blurredTopClearBottom")
  ReactNativeProgressiveBlurViewHelper.updateProgressiveBlurView(view, withStartOffset: value)
  ReactNativeProgressiveBlurViewHelper.updateProgressiveBlurView(view, withBlurType: "regular")
  ReactNativeProgressiveBlurViewHelper.updateProgressiveBlurView(view, withReducedTransparencyFallbackColor: color)
}

@MainActor private func _pinVibrancy(_ frame: CGRect, _ view: VibrancyEffectView) -> UIView {
  let amount: Double = 1
  let created: VibrancyEffectView = ReactNativeVibrancyViewHelper.createVibrancyViewWithFrame(frame)
  _ = created
  ReactNativeVibrancyViewHelper.updateVibrancyView(view, withBlurType: "regular")
  ReactNativeVibrancyViewHelper.updateVibrancyView(view, withBlurAmount: amount)
  let contentView: UIView = ReactNativeVibrancyViewHelper.getContentView(view)
  return contentView
}

private let _swiftHeaderSelectors: [Selector] = [
  #selector(LiquidGlassContainerView.beginBatchUpdate),
  #selector(LiquidGlassContainerView.endBatchUpdate),
  #selector(LiquidGlassContainerView.setBorderRadii(topLeft:topRight:bottomLeft:bottomRight:)),
  #selector(LiquidGlassContainerView.getContentView),
  #selector(ReactNativeBlurViewHelper.createBlurViewWithFrame(_:)),
  #selector(ReactNativeBlurViewHelper.updateBlurView(_:withBlurAmount:)),
  #selector(ReactNativeBlurViewHelper.updateBlurView(_:withBlurType:)),
  #selector(ReactNativeBlurViewHelper.updateBlurView(_:withReducedTransparencyFallbackColor:)),
  #selector(ReactNativeBlurViewHelper.updateBlurView(_:withIgnoringSafeArea:)),
  #selector(ReactNativeLiquidGlassContainerHelper.createLiquidGlassContainerWithFrame(_:)),
  #selector(ReactNativeLiquidGlassContainerHelper.updateLiquidGlassContainer(_:withSpacing:)),
  #selector(ReactNativeLiquidGlassViewHelper.createLiquidGlassViewWithFrame(_:)),
  #selector(ReactNativeLiquidGlassViewHelper.updateLiquidGlassView(_:withGlassTintColor:)),
  #selector(ReactNativeLiquidGlassViewHelper.updateLiquidGlassView(_:withGlassOpacity:)),
  #selector(ReactNativeLiquidGlassViewHelper.updateLiquidGlassView(_:withGlassType:)),
  #selector(ReactNativeLiquidGlassViewHelper.updateLiquidGlassView(_:withIsInteractive:)),
  #selector(ReactNativeLiquidGlassViewHelper.updateLiquidGlassView(_:withIgnoringSafeArea:)),
  #selector(ReactNativeLiquidGlassViewHelper.updateLiquidGlassView(_:withReducedTransparencyFallbackColor:)),
  #selector(ReactNativeProgressiveBlurViewHelper.createProgressiveBlurViewWithFrame(_:)),
  #selector(ReactNativeProgressiveBlurViewHelper.updateProgressiveBlurView(_:withBlurAmount:)),
  #selector(ReactNativeProgressiveBlurViewHelper.updateProgressiveBlurView(_:withDirection:)),
  #selector(ReactNativeProgressiveBlurViewHelper.updateProgressiveBlurView(_:withStartOffset:)),
  #selector(ReactNativeProgressiveBlurViewHelper.updateProgressiveBlurView(_:withBlurType:)),
  #selector(ReactNativeProgressiveBlurViewHelper.updateProgressiveBlurView(_:withReducedTransparencyFallbackColor:)),
  #selector(ReactNativeVibrancyViewHelper.createVibrancyViewWithFrame(_:)),
  #selector(ReactNativeVibrancyViewHelper.updateVibrancyView(_:withBlurType:)),
  #selector(ReactNativeVibrancyViewHelper.updateVibrancyView(_:withBlurAmount:)),
  #selector(ReactNativeVibrancyViewHelper.getContentView(_:)),
]
