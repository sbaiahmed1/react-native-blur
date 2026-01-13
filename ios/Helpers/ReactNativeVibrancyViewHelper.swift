import UIKit

@objc public class ReactNativeVibrancyViewHelper: NSObject {

  @objc public static func createVibrancyViewWithFrame(_ frame: CGRect) -> VibrancyEffectView {
    let view = VibrancyEffectView(effect: nil)
    view.frame = frame
    return view
  }

  @objc public static func updateVibrancyView(_ view: VibrancyEffectView, withBlurType blurType: String) {
    view.blurType = blurType
  }

  @objc public static func updateVibrancyView(_ view: VibrancyEffectView, withBlurAmount blurAmount: Double) {
    view.blurAmount = blurAmount
  }

  @objc public static func getContentView(_ view: VibrancyEffectView) -> UIView {
    return view.contentView
  }
}
