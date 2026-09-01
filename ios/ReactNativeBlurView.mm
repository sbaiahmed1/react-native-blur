#import "ReactNativeBlurView.h"
#import <react/RCTConversions.h>

#import <react/renderer/components/ReactNativeBlurViewSpec/ComponentDescriptors.h>
#import <react/renderer/components/ReactNativeBlurViewSpec/EventEmitters.h>
#import <react/renderer/components/ReactNativeBlurViewSpec/Props.h>
#import <react/renderer/components/ReactNativeBlurViewSpec/RCTComponentViewHelpers.h>

#import "RCTFabricComponentsPlugins.h"

#if __has_include("ReactNativeBlur-Swift.h")
#import "ReactNativeBlur-Swift.h"
#else
#import <ReactNativeBlur/ReactNativeBlur-Swift.h>
#endif

using namespace facebook::react;

@interface ReactNativeBlurView () <RCTReactNativeBlurViewViewProtocol>
@end

@implementation ReactNativeBlurView {
  AdvancedBlurView *_advancedBlurView;
}

+ (ComponentDescriptorProvider)componentDescriptorProvider
{
  return concreteComponentDescriptorProvider<ReactNativeBlurViewComponentDescriptor>();
}

- (instancetype)initWithFrame:(CGRect)frame
{
  if (self = [super initWithFrame:frame]) {
    static const auto defaultProps = std::make_shared<const ReactNativeBlurViewProps>();
    _props = defaultProps;

    const auto &bvProps = *std::static_pointer_cast<const ReactNativeBlurViewProps>(defaultProps);

    _advancedBlurView = [ReactNativeBlurViewHelper createBlurViewWithFrame:frame];

    // Set initial blurAmount from default props
    [ReactNativeBlurViewHelper updateBlurView:_advancedBlurView withBlurAmount:bvProps.blurAmount];

    // Set initial blurType from default props
    if (bvProps.blurType != facebook::react::ReactNativeBlurViewBlurType::Xlight) {
      NSString *blurTypeString = [[NSString alloc] initWithUTF8String:toString(bvProps.blurType).c_str()];
      [ReactNativeBlurViewHelper updateBlurView:_advancedBlurView withBlurType:blurTypeString];
    }

    // Set initial reducedTransparencyFallbackColor from default props
    UIColor *fallbackColor = RCTUIColorFromSharedColor(bvProps.reducedTransparencyFallbackColor) ?: [UIColor whiteColor];
    [ReactNativeBlurViewHelper updateBlurView:_advancedBlurView withReducedTransparencyFallbackColor:fallbackColor];

    // Set initial ignoreSafeArea from default props
    [ReactNativeBlurViewHelper updateBlurView:_advancedBlurView withIgnoringSafeArea:bvProps.ignoreSafeArea];

    [self addSubview:_advancedBlurView];
  }
  return self;
}

- (void)updateProps:(Props::Shared const &)props oldProps:(Props::Shared const &)oldProps
{
  const auto &oldViewProps = *std::static_pointer_cast<ReactNativeBlurViewProps const>(_props);
  const auto &newViewProps = *std::static_pointer_cast<ReactNativeBlurViewProps const>(props);

  // Update blurAmount if it has changed
  if (oldViewProps.blurAmount != newViewProps.blurAmount) {
    [ReactNativeBlurViewHelper updateBlurView:_advancedBlurView withBlurAmount:newViewProps.blurAmount];
  }

  // Update blurType if it has changed
  if (oldViewProps.blurType != newViewProps.blurType) {
    NSString *blurTypeString = [[NSString alloc] initWithUTF8String:toString(newViewProps.blurType).c_str()];
    [ReactNativeBlurViewHelper updateBlurView:_advancedBlurView withBlurType:blurTypeString];
  }

  // Update reducedTransparencyFallbackColor if it has changed. Apply even when
  // empty so clearing the prop resets rather than stranding the old colour
  // (this conditional-skip was the recycling-staleness vector for this view).
  if (oldViewProps.reducedTransparencyFallbackColor != newViewProps.reducedTransparencyFallbackColor) {
    UIColor *fallbackColor = RCTUIColorFromSharedColor(newViewProps.reducedTransparencyFallbackColor) ?: [UIColor whiteColor];
    [ReactNativeBlurViewHelper updateBlurView:_advancedBlurView withReducedTransparencyFallbackColor:fallbackColor];
  }

  // Update ignoreSafeArea if it has changed
  if (oldViewProps.ignoreSafeArea != newViewProps.ignoreSafeArea) {
    [ReactNativeBlurViewHelper updateBlurView:_advancedBlurView withIgnoringSafeArea:newViewProps.ignoreSafeArea];
  }

  [super updateProps:props oldProps:oldProps];
}

// Fabric recycles component views. Reset cached props and the inner view's
// visual state to defaults so no blur amount/type/fallback/safe-area setting
// leaks into the next mount.
- (void)prepareForRecycle
{
  [super prepareForRecycle];

  static const auto defaultProps = std::make_shared<const ReactNativeBlurViewProps>();
  _props = defaultProps;

  const auto &bvProps = *std::static_pointer_cast<const ReactNativeBlurViewProps>(defaultProps);

  [ReactNativeBlurViewHelper updateBlurView:_advancedBlurView withBlurAmount:bvProps.blurAmount];

  NSString *blurTypeString = [[NSString alloc] initWithUTF8String:toString(bvProps.blurType).c_str()];
  [ReactNativeBlurViewHelper updateBlurView:_advancedBlurView withBlurType:blurTypeString];

  UIColor *fallbackColor = RCTUIColorFromSharedColor(bvProps.reducedTransparencyFallbackColor) ?: [UIColor whiteColor];
  [ReactNativeBlurViewHelper updateBlurView:_advancedBlurView withReducedTransparencyFallbackColor:fallbackColor];

  [ReactNativeBlurViewHelper updateBlurView:_advancedBlurView withIgnoringSafeArea:bvProps.ignoreSafeArea];
}

- (void)layoutSubviews
{
  [super layoutSubviews];
  _advancedBlurView.frame = self.bounds;
}

- (void)mountChildComponentView:(UIView<RCTComponentViewProtocol> *)childComponentView index:(NSInteger)index
{
  [_advancedBlurView addSubview:childComponentView];
}

- (void)unmountChildComponentView:(UIView<RCTComponentViewProtocol> *)childComponentView index:(NSInteger)index
{
  [childComponentView removeFromSuperview];
}

- (void)dealloc
{
  [_advancedBlurView removeFromSuperview];
  _advancedBlurView = nil;
}

@end

Class<RCTComponentViewProtocol> BlurryViewCls(void)
{
  return ReactNativeBlurView.class;
}
