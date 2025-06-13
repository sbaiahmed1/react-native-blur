#import <React/RCTViewManager.h>
#import <React/RCTUIManager.h>
#import "RCTBridge.h"

@interface ReactNativeBlurViewManager : RCTViewManager
@end

@implementation ReactNativeBlurViewManager

RCT_EXPORT_MODULE(ReactNativeBlurView)

- (UIView *)view
{
  return [[UIView alloc] init];
}

// Legacy view manager - properties are now handled by Fabric
RCT_EXPORT_VIEW_PROPERTY(blurType, NSString)
RCT_EXPORT_VIEW_PROPERTY(blurAmount, NSNumber)
RCT_EXPORT_VIEW_PROPERTY(reducedTransparencyFallbackColor, NSString)

@end
