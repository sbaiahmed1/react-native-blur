#import "ReactNativeVibrancyViewManager.h"

#if __has_include("ReactNativeBlur-Swift.h")
#import "ReactNativeBlur-Swift.h"
#else
#import <ReactNativeBlur/ReactNativeBlur-Swift.h>
#endif

#import <React/RCTUIManager.h>

@implementation ReactNativeVibrancyViewManager

RCT_EXPORT_MODULE(ReactNativeVibrancyView)

- (UIView *)view
{
  return [ReactNativeVibrancyViewHelper createVibrancyViewWithFrame:CGRectZero];
}

RCT_CUSTOM_VIEW_PROPERTY(blurType, NSString, VibrancyEffectView)
{
  NSString *blurType = json ? [RCTConvert NSString:json] : @"xlight";
  [ReactNativeVibrancyViewHelper updateVibrancyView:view withBlurType:blurType];
}

RCT_CUSTOM_VIEW_PROPERTY(blurAmount, NSNumber, VibrancyEffectView)
{
    double amount = json ? [RCTConvert double:json] : 10.0;
    [ReactNativeVibrancyViewHelper updateVibrancyView:view withBlurAmount:amount];
}

@end
