#import "ReactNativeBlurModule.h"

#if __has_include("ReactNativeBlur-Swift.h")
#import "ReactNativeBlur-Swift.h"
#else
#import <ReactNativeBlur/ReactNativeBlur-Swift.h>
#endif

@implementation ReactNativeBlurModule

RCT_EXPORT_MODULE(ReactNativeBlur)

+ (BOOL)requiresMainQueueSetup
{
  return NO;
}

- (facebook::react::ModuleConstants<JS::NativeReactNativeBlur::Constants>)constantsToExport
{
  return [self getConstants];
}

- (facebook::react::ModuleConstants<JS::NativeReactNativeBlur::Constants>)getConstants
{
  return facebook::react::typedConstants<JS::NativeReactNativeBlur::Constants>({
    .isLiquidGlassAvailable = [ReactNativeLiquidGlassViewHelper isLiquidGlassAvailable],
    .usesPrivateIOSApi = [ReactNativeProgressiveBlurViewHelper usesPrivateApi],
  });
}

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:(const facebook::react::ObjCTurboModule::InitParams &)params
{
  return std::make_shared<facebook::react::NativeReactNativeBlurSpecJSI>(params);
}

@end
