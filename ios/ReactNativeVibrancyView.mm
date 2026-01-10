#import "ReactNativeVibrancyView.h"

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

@interface ReactNativeVibrancyView () <RCTReactNativeVibrancyViewViewProtocol>
@end

@implementation ReactNativeVibrancyView {
  VibrancyEffectView *_vibrancyView;
  Props::Shared _props;
}

+ (ComponentDescriptorProvider)componentDescriptorProvider
{
  return concreteComponentDescriptorProvider<ReactNativeVibrancyViewComponentDescriptor>();
}

- (instancetype)initWithFrame:(CGRect)frame
{
  if (self = [super initWithFrame:frame]) {
    static const auto defaultProps = std::make_shared<const ReactNativeVibrancyViewProps>();
    _props = defaultProps;
    
    _vibrancyView = [ReactNativeVibrancyViewHelper createVibrancyViewWithFrame:frame];
    
    // Initialize props
    const auto &props = *std::static_pointer_cast<const ReactNativeVibrancyViewProps>(_props);
    NSString *blurType = [[NSString alloc] initWithUTF8String:toString(props.blurType).c_str()];
    [ReactNativeVibrancyViewHelper updateVibrancyView:_vibrancyView withBlurType:blurType];
      
    [ReactNativeVibrancyViewHelper updateVibrancyView:_vibrancyView withBlurAmount:props.blurAmount];
    
    _vibrancyView.autoresizingMask = UIViewAutoresizingFlexibleWidth | UIViewAutoresizingFlexibleHeight;
    [self addSubview:_vibrancyView];
  }
  return self;
}

- (void)updateProps:(Props::Shared const &)props oldProps:(Props::Shared const &)oldProps
{
  const auto &oldViewProps = *std::static_pointer_cast<ReactNativeVibrancyViewProps const>(_props);
  const auto &newViewProps = *std::static_pointer_cast<ReactNativeVibrancyViewProps const>(props);

  if (oldViewProps.blurType != newViewProps.blurType) {
    NSString *blurType = [[NSString alloc] initWithUTF8String:toString(newViewProps.blurType).c_str()];
    [ReactNativeVibrancyViewHelper updateVibrancyView:_vibrancyView withBlurType:blurType];
  }

  if (oldViewProps.blurAmount != newViewProps.blurAmount) {
      [ReactNativeVibrancyViewHelper updateVibrancyView:_vibrancyView withBlurAmount:newViewProps.blurAmount];
  }

  _props = props;
  [super updateProps:props oldProps:oldProps];
}

- (void)layoutSubviews
{
  [super layoutSubviews];
  _vibrancyView.frame = self.bounds;
}

- (void)mountChildComponentView:(UIView<RCTComponentViewProtocol> *)childComponentView index:(NSInteger)index
{
    UIView *contentView = [ReactNativeVibrancyViewHelper getContentView:_vibrancyView];
    [contentView insertSubview:childComponentView atIndex:index];
}

- (void)unmountChildComponentView:(UIView<RCTComponentViewProtocol> *)childComponentView index:(NSInteger)index
{
    [childComponentView removeFromSuperview];
}

@end

Class<RCTComponentViewProtocol> ReactNativeVibrancyViewCls(void)
{
  return ReactNativeVibrancyView.class;
}
