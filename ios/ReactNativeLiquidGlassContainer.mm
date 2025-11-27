#import "ReactNativeLiquidGlassContainer.h"

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

@interface ReactNativeLiquidGlassContainer () <RCTReactNativeLiquidGlassContainerViewProtocol>
@end

@implementation ReactNativeLiquidGlassContainer {
  LiquidGlassContainer *_containerView;
  Props::Shared _props;
  LayoutMetrics _layoutMetrics;
}

+ (ComponentDescriptorProvider)componentDescriptorProvider
{
  return concreteComponentDescriptorProvider<ReactNativeLiquidGlassContainerComponentDescriptor>();
}

- (instancetype)initWithFrame:(CGRect)frame
{
  if (self = [super initWithFrame:frame]) {
    static const auto defaultProps = std::make_shared<const ReactNativeLiquidGlassContainerProps>();
    _props = defaultProps;

    const auto &containerProps = *std::static_pointer_cast<const ReactNativeLiquidGlassContainerProps>(defaultProps);

    _containerView = [ReactNativeLiquidGlassContainerHelper createLiquidGlassContainerWithFrame:frame];

    // Set initial spacing from default props
    [ReactNativeLiquidGlassContainerHelper updateLiquidGlassContainer:_containerView withSpacing:containerProps.spacing];

    [self addSubview:_containerView];
  }
  return self;
}

- (void)updateProps:(Props::Shared const &)props oldProps:(Props::Shared const &)oldProps
{
  const auto &oldViewProps = *std::static_pointer_cast<ReactNativeLiquidGlassContainerProps const>(_props);
  const auto &newViewProps = *std::static_pointer_cast<ReactNativeLiquidGlassContainerProps const>(props);

  // Update spacing if it has changed
  if (oldViewProps.spacing != newViewProps.spacing) {
    [ReactNativeLiquidGlassContainerHelper updateLiquidGlassContainer:_containerView withSpacing:newViewProps.spacing];
  }

  // Store the new props
  _props = props;

  [super updateProps:props oldProps:oldProps];
}

- (void)finalizeUpdates:(RNComponentViewUpdateMask)updateMask
{
  [super finalizeUpdates:updateMask];

  // Apply border radius from layout metrics to the container view
  if (@available(iOS 26.0, *)) {
    const auto &props = *std::static_pointer_cast<ReactNativeLiquidGlassContainerProps const>(_props);
    const auto borderMetrics = props.resolveBorderMetrics(_layoutMetrics);

    // Use topLeft.horizontal same as React Native RCTViewComponentView implementation
    CGFloat radius = borderMetrics.borderRadii.topLeft.horizontal;

    if (radius > 0) {
      _containerView.layer.cornerRadius = radius;
      _containerView.layer.masksToBounds = YES;
    }
  }
}

- (void)layoutSubviews
{
  [super layoutSubviews];
  _containerView.frame = self.bounds;

  // Copy corner radius from the Fabric view to the container view
  _containerView.layer.cornerRadius = self.layer.cornerRadius;
  _containerView.layer.cornerCurve = self.layer.cornerCurve;
  _containerView.layer.masksToBounds = self.layer.masksToBounds;
}

- (void)updateLayoutMetrics:(const LayoutMetrics &)layoutMetrics oldLayoutMetrics:(const LayoutMetrics &)oldLayoutMetrics
{
  _layoutMetrics = layoutMetrics;
  [super updateLayoutMetrics:layoutMetrics oldLayoutMetrics:oldLayoutMetrics];
}

- (void)mountChildComponentView:(UIView<RCTComponentViewProtocol> *)childComponentView index:(NSInteger)index
{
  if (@available(iOS 26.0, *)) {
    // On iOS 26+, add children to the contentView if available
    if ([_containerView isKindOfClass:[UIVisualEffectView class]]) {
      UIVisualEffectView *effectView = (UIVisualEffectView *)_containerView;
      [effectView.contentView insertSubview:childComponentView atIndex:index];
      return;
    }
  }

  // Fallback: add directly to container view
  [_containerView insertSubview:childComponentView atIndex:index];
}

- (void)unmountChildComponentView:(UIView<RCTComponentViewProtocol> *)childComponentView index:(NSInteger)index
{
  [childComponentView removeFromSuperview];
}

- (void)dealloc
{
  [_containerView removeFromSuperview];
  _containerView = nil;
}

@end

Class<RCTComponentViewProtocol> LiquidGlassContainerCls(void)
{
  return ReactNativeLiquidGlassContainer.class;
}
