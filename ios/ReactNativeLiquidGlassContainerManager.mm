#import "ReactNativeLiquidGlassContainerManager.h"
#import "ReactNativeLiquidGlassContainer.h"
#import <React/RCTUIManager.h>
#import <React/RCTLog.h>

@implementation ReactNativeLiquidGlassContainerManager

RCT_EXPORT_MODULE(ReactNativeLiquidGlassContainer)

RCT_EXPORT_VIEW_PROPERTY(spacing, double)

- (UIView *)view
{
  return [[ReactNativeLiquidGlassContainer alloc] init];
}

@end
