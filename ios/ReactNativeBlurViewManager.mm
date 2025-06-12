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

RCT_EXPORT_VIEW_PROPERTY(color, NSString)

@end
