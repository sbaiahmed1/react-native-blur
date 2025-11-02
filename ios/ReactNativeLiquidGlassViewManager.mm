#import "ReactNativeLiquidGlassViewManager.h"
#import "ReactNativeLiquidGlassView.h"

@implementation ReactNativeLiquidGlassViewManager

RCT_EXPORT_MODULE(ReactNativeLiquidGlassView)

- (UIView *)view
{
  return [[ReactNativeLiquidGlassView alloc] init];
}

RCT_EXPORT_VIEW_PROPERTY(glassType, NSString)
RCT_EXPORT_VIEW_PROPERTY(glassTintColor, NSString)
RCT_EXPORT_VIEW_PROPERTY(glassOpacity, NSNumber)
RCT_EXPORT_VIEW_PROPERTY(reducedTransparencyFallbackColor, NSString)
RCT_EXPORT_VIEW_PROPERTY(isInteractive, BOOL)
RCT_EXPORT_VIEW_PROPERTY(ignoreSafeArea, BOOL)
RCT_EXPORT_VIEW_PROPERTY(borderRadius, NSNumber)

@end
