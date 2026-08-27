#import "ReactNativeProgressiveBlurView.h"
#import "Helpers/ColorHelpers.h"

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

@interface ReactNativeProgressiveBlurView () <RCTReactNativeProgressiveBlurViewViewProtocol>
@end

@implementation ReactNativeProgressiveBlurView {
  ProgressiveBlurView *_progressiveBlurView;
}

+ (UIColor *)colorFromString:(NSString *)colorString {
  return RNBlurColorFromString(colorString);
}

+ (ComponentDescriptorProvider)componentDescriptorProvider
{
  return concreteComponentDescriptorProvider<ReactNativeProgressiveBlurViewComponentDescriptor>();
}

- (instancetype)initWithFrame:(CGRect)frame
{
  if (self = [super initWithFrame:frame]) {
    static const auto defaultProps = std::make_shared<const ReactNativeProgressiveBlurViewProps>();
    _props = defaultProps;

    const auto &pbvProps = *std::static_pointer_cast<const ReactNativeProgressiveBlurViewProps>(defaultProps);

    _progressiveBlurView = [ReactNativeProgressiveBlurViewHelper createProgressiveBlurViewWithFrame:frame];

    // Set initial properties from default props
    [ReactNativeProgressiveBlurViewHelper updateProgressiveBlurView:_progressiveBlurView withBlurAmount:pbvProps.blurAmount];

    // This component's default blurType is Regular (not Xlight); compare
    // against the correct default so the initial apply is skipped only when the
    // value actually is the default.
    if (pbvProps.blurType != facebook::react::ReactNativeProgressiveBlurViewBlurType::Regular) {
      NSString *blurTypeString = [[NSString alloc] initWithUTF8String:toString(pbvProps.blurType).c_str()];
      [ReactNativeProgressiveBlurViewHelper updateProgressiveBlurView:_progressiveBlurView withBlurType:blurTypeString];
    }

    if (pbvProps.direction != facebook::react::ReactNativeProgressiveBlurViewDirection::BlurredTopClearBottom) {
      NSString *directionString = [[NSString alloc] initWithUTF8String:toString(pbvProps.direction).c_str()];
      [ReactNativeProgressiveBlurViewHelper updateProgressiveBlurView:_progressiveBlurView withDirection:directionString];
    }

    [ReactNativeProgressiveBlurViewHelper updateProgressiveBlurView:_progressiveBlurView withStartOffset:pbvProps.startOffset];

    if (!pbvProps.reducedTransparencyFallbackColor.empty()) {
      NSString *fallbackColorString = [[NSString alloc] initWithUTF8String:pbvProps.reducedTransparencyFallbackColor.c_str()];
      UIColor *fallbackColor = [ReactNativeProgressiveBlurView colorFromString:fallbackColorString];
      [ReactNativeProgressiveBlurViewHelper updateProgressiveBlurView:_progressiveBlurView withReducedTransparencyFallbackColor:fallbackColor];
    }

    [self addSubview:_progressiveBlurView];
  }
  return self;
}

- (void)updateProps:(Props::Shared const &)props oldProps:(Props::Shared const &)oldProps
{
  const auto &oldViewProps = *std::static_pointer_cast<ReactNativeProgressiveBlurViewProps const>(_props);
  const auto &newViewProps = *std::static_pointer_cast<ReactNativeProgressiveBlurViewProps const>(props);

  if (oldViewProps.blurAmount != newViewProps.blurAmount) {
    [ReactNativeProgressiveBlurViewHelper updateProgressiveBlurView:_progressiveBlurView withBlurAmount:newViewProps.blurAmount];
  }

  if (oldViewProps.blurType != newViewProps.blurType) {
    NSString *blurTypeString = [[NSString alloc] initWithUTF8String:toString(newViewProps.blurType).c_str()];
    [ReactNativeProgressiveBlurViewHelper updateProgressiveBlurView:_progressiveBlurView withBlurType:blurTypeString];
  }

  if (oldViewProps.direction != newViewProps.direction) {
    NSString *directionString = [[NSString alloc] initWithUTF8String:toString(newViewProps.direction).c_str()];
    [ReactNativeProgressiveBlurViewHelper updateProgressiveBlurView:_progressiveBlurView withDirection:directionString];
  }

  if (oldViewProps.startOffset != newViewProps.startOffset) {
    [ReactNativeProgressiveBlurViewHelper updateProgressiveBlurView:_progressiveBlurView withStartOffset:newViewProps.startOffset];
  }

  // Apply even when empty so clearing the prop resets rather than stranding the
  // old colour (the conditional-skip was this view's recycling-staleness vector).
  if (oldViewProps.reducedTransparencyFallbackColor != newViewProps.reducedTransparencyFallbackColor) {
    NSString *fallbackColorString = [[NSString alloc] initWithUTF8String:newViewProps.reducedTransparencyFallbackColor.c_str()];
    UIColor *fallbackColor = [ReactNativeProgressiveBlurView colorFromString:fallbackColorString];
    [ReactNativeProgressiveBlurViewHelper updateProgressiveBlurView:_progressiveBlurView withReducedTransparencyFallbackColor:fallbackColor];
  }

  [super updateProps:props oldProps:oldProps];
}

// Fabric recycles component views. Reset cached props and the inner view's
// visual state to defaults so no blur setting leaks into the next mount.
- (void)prepareForRecycle
{
  [super prepareForRecycle];

  static const auto defaultProps = std::make_shared<const ReactNativeProgressiveBlurViewProps>();
  _props = defaultProps;

  const auto &pbvProps = *std::static_pointer_cast<const ReactNativeProgressiveBlurViewProps>(defaultProps);

  [ReactNativeProgressiveBlurViewHelper updateProgressiveBlurView:_progressiveBlurView withBlurAmount:pbvProps.blurAmount];

  NSString *blurTypeString = [[NSString alloc] initWithUTF8String:toString(pbvProps.blurType).c_str()];
  [ReactNativeProgressiveBlurViewHelper updateProgressiveBlurView:_progressiveBlurView withBlurType:blurTypeString];

  NSString *directionString = [[NSString alloc] initWithUTF8String:toString(pbvProps.direction).c_str()];
  [ReactNativeProgressiveBlurViewHelper updateProgressiveBlurView:_progressiveBlurView withDirection:directionString];

  [ReactNativeProgressiveBlurViewHelper updateProgressiveBlurView:_progressiveBlurView withStartOffset:pbvProps.startOffset];

  NSString *fallbackColorString = [[NSString alloc] initWithUTF8String:pbvProps.reducedTransparencyFallbackColor.c_str()];
  UIColor *fallbackColor = [ReactNativeProgressiveBlurView colorFromString:fallbackColorString];
  [ReactNativeProgressiveBlurViewHelper updateProgressiveBlurView:_progressiveBlurView withReducedTransparencyFallbackColor:fallbackColor];
}

- (void)layoutSubviews
{
  [super layoutSubviews];
  _progressiveBlurView.frame = self.bounds;
}

- (void)mountChildComponentView:(UIView<RCTComponentViewProtocol> *)childComponentView index:(NSInteger)index
{
  [_progressiveBlurView addSubview:childComponentView];
}

- (void)unmountChildComponentView:(UIView<RCTComponentViewProtocol> *)childComponentView index:(NSInteger)index
{
  [childComponentView removeFromSuperview];
}

- (void)dealloc
{
  [_progressiveBlurView removeFromSuperview];
  _progressiveBlurView = nil;
}

@end

Class<RCTComponentViewProtocol> ProgressiveBlurryViewCls(void)
{
  return ReactNativeProgressiveBlurView.class;
}
