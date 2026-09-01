#import "ReactNativeLiquidGlassView.h"
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

@interface ReactNativeLiquidGlassView () <RCTReactNativeLiquidGlassViewViewProtocol>
@end

@implementation ReactNativeLiquidGlassView {
  LiquidGlassContainerView *_liquidGlassView;
  LayoutMetrics _layoutMetrics;
}

+ (ComponentDescriptorProvider)componentDescriptorProvider
{
  return concreteComponentDescriptorProvider<ReactNativeLiquidGlassViewComponentDescriptor>();
}

- (instancetype)initWithFrame:(CGRect)frame
{
  if (self = [super initWithFrame:frame]) {
    static const auto defaultProps = std::make_shared<const ReactNativeLiquidGlassViewProps>();
    _props = defaultProps;

    const auto &lgProps = *std::static_pointer_cast<const ReactNativeLiquidGlassViewProps>(defaultProps);

    _liquidGlassView = [ReactNativeLiquidGlassViewHelper createLiquidGlassViewWithFrame:frame];

    // Coalesce the initial prop setters into a single effect rebuild.
    [_liquidGlassView beginBatchUpdate];

    // Set initial glassTintColor from default props
    UIColor *defaultGlassTintColor = RCTUIColorFromSharedColor(lgProps.glassTintColor) ?: [UIColor clearColor];
    [ReactNativeLiquidGlassViewHelper updateLiquidGlassView:_liquidGlassView withGlassTintColor:defaultGlassTintColor];

    // Set initial glassOpacity from default props
    [ReactNativeLiquidGlassViewHelper updateLiquidGlassView:_liquidGlassView withGlassOpacity:lgProps.glassOpacity];

    // Set initial glassType from default props
    if (lgProps.glassType != facebook::react::ReactNativeLiquidGlassViewGlassType::Clear) {
      NSString *glassTypeString = [[NSString alloc] initWithUTF8String:toString(lgProps.glassType).c_str()];
      [ReactNativeLiquidGlassViewHelper updateLiquidGlassView:_liquidGlassView withGlassType:glassTypeString];
    }

    // Set initial isInteractive from default props
    [ReactNativeLiquidGlassViewHelper updateLiquidGlassView:_liquidGlassView withIsInteractive:lgProps.isInteractive];

    // Set initial ignoreSafeArea from default props
    [ReactNativeLiquidGlassViewHelper updateLiquidGlassView:_liquidGlassView withIgnoringSafeArea:lgProps.ignoreSafeArea];

    // Set initial reducedTransparencyFallbackColor from default props
    UIColor *fallbackColor = RCTUIColorFromSharedColor(lgProps.reducedTransparencyFallbackColor) ?: [UIColor whiteColor];
    [ReactNativeLiquidGlassViewHelper updateLiquidGlassView:_liquidGlassView withReducedTransparencyFallbackColor:fallbackColor];

    [_liquidGlassView endBatchUpdate];

    [self addSubview:_liquidGlassView];
  }
  return self;
}

- (void)updateProps:(Props::Shared const &)props oldProps:(Props::Shared const &)oldProps
{
  const auto &oldViewProps = *std::static_pointer_cast<ReactNativeLiquidGlassViewProps const>(_props);
  const auto &newViewProps = *std::static_pointer_cast<ReactNativeLiquidGlassViewProps const>(props);

  // Coalesce the individual prop setters below into a single effect rebuild.
  [_liquidGlassView beginBatchUpdate];

  // Apply null as clear so removing a previously-set tint takes effect.
  if (oldViewProps.glassTintColor != newViewProps.glassTintColor) {
    UIColor *newGlassTintColor = RCTUIColorFromSharedColor(newViewProps.glassTintColor) ?: [UIColor clearColor];
    [ReactNativeLiquidGlassViewHelper updateLiquidGlassView:_liquidGlassView withGlassTintColor:newGlassTintColor];
  }

  // Update glassOpacity if it has changed
  if (oldViewProps.glassOpacity != newViewProps.glassOpacity) {
    [ReactNativeLiquidGlassViewHelper updateLiquidGlassView:_liquidGlassView withGlassOpacity:newViewProps.glassOpacity];
  }

  // Update glassType if it has changed. Apply unconditionally — including
  // Clear. Skipping the Clear case left recycled views stuck on the previous
  // mount's "regular" style (clear glass rendering as regular after
  // re-visiting a screen).
  if (oldViewProps.glassType != newViewProps.glassType) {
    NSString *glassTypeString = [[NSString alloc] initWithUTF8String:toString(newViewProps.glassType).c_str()];
    [ReactNativeLiquidGlassViewHelper updateLiquidGlassView:_liquidGlassView withGlassType:glassTypeString];
  }

  // Update isInteractive if it has changed
  if (oldViewProps.isInteractive != newViewProps.isInteractive) {
    [ReactNativeLiquidGlassViewHelper updateLiquidGlassView:_liquidGlassView withIsInteractive:newViewProps.isInteractive];
  }

  // Update ignoreSafeArea if it has changed
  if (oldViewProps.ignoreSafeArea != newViewProps.ignoreSafeArea) {
    [ReactNativeLiquidGlassViewHelper updateLiquidGlassView:_liquidGlassView withIgnoringSafeArea:newViewProps.ignoreSafeArea];
  }

  // Update reducedTransparencyFallbackColor if it has changed. Apply even when
  // empty so clearing the prop resets to the parsed default rather than
  // stranding the previous colour.
  if (oldViewProps.reducedTransparencyFallbackColor != newViewProps.reducedTransparencyFallbackColor) {
    UIColor *fallbackColor = RCTUIColorFromSharedColor(newViewProps.reducedTransparencyFallbackColor) ?: [UIColor whiteColor];
    [ReactNativeLiquidGlassViewHelper updateLiquidGlassView:_liquidGlassView withReducedTransparencyFallbackColor:fallbackColor];
  }

  // Apply all of the above in one effect rebuild.
  [_liquidGlassView endBatchUpdate];

  [super updateProps:props oldProps:oldProps];
}

// Fabric recycles component views: after unmount this instance returns to a
// pool and is reused for a future mount, whose updateProps diffs against
// whatever _props holds. Reset both the cached props and the inner container's
// visual state to defaults so no glass type/tint/opacity leaks between mounts.
- (void)prepareForRecycle
{
  [super prepareForRecycle];

  static const auto defaultProps = std::make_shared<const ReactNativeLiquidGlassViewProps>();
  _props = defaultProps;

  const auto &lgProps = *std::static_pointer_cast<const ReactNativeLiquidGlassViewProps>(defaultProps);

  NSString *defaultGlassTypeString = [[NSString alloc] initWithUTF8String:toString(lgProps.glassType).c_str()];
  [ReactNativeLiquidGlassViewHelper updateLiquidGlassView:_liquidGlassView withGlassType:defaultGlassTypeString];

  UIColor *defaultGlassTintColor = RCTUIColorFromSharedColor(lgProps.glassTintColor) ?: [UIColor clearColor];
  [ReactNativeLiquidGlassViewHelper updateLiquidGlassView:_liquidGlassView withGlassTintColor:defaultGlassTintColor];

  [ReactNativeLiquidGlassViewHelper updateLiquidGlassView:_liquidGlassView withGlassOpacity:lgProps.glassOpacity];
  [ReactNativeLiquidGlassViewHelper updateLiquidGlassView:_liquidGlassView withIsInteractive:lgProps.isInteractive];
  [ReactNativeLiquidGlassViewHelper updateLiquidGlassView:_liquidGlassView withIgnoringSafeArea:lgProps.ignoreSafeArea];

  // Reset the fallback colour too; the component default is white.
  UIColor *defaultFallbackColor = RCTUIColorFromSharedColor(lgProps.reducedTransparencyFallbackColor) ?: [UIColor whiteColor];
  [ReactNativeLiquidGlassViewHelper updateLiquidGlassView:_liquidGlassView withReducedTransparencyFallbackColor:defaultFallbackColor];
}

- (void)finalizeUpdates:(RNComponentViewUpdateMask)updateMask
{
  [super finalizeUpdates:updateMask];

  // Apply per-corner border radius from layout metrics to the inner glass view.
  // Applied unconditionally (including 0) so animating a radius down to 0 or
  // recycling a rounded view into an unrounded mount actually squares the
  // corners instead of keeping the stale radius.
  if (@available(iOS 26.0, *)) {
    const auto &props = *std::static_pointer_cast<ReactNativeLiquidGlassViewProps const>(_props);
    const auto borderMetrics = props.resolveBorderMetrics(_layoutMetrics);

    [_liquidGlassView setBorderRadiiWithTopLeft:borderMetrics.borderRadii.topLeft.horizontal
                                       topRight:borderMetrics.borderRadii.topRight.horizontal
                                     bottomLeft:borderMetrics.borderRadii.bottomLeft.horizontal
                                    bottomRight:borderMetrics.borderRadii.bottomRight.horizontal];
  }
}

- (void)layoutSubviews
{
  [super layoutSubviews];
  _liquidGlassView.frame = self.bounds;

  // Copy corner radius from the Fabric view to the inner glass view (Callstack pattern)
  _liquidGlassView.layer.cornerRadius = self.layer.cornerRadius;
  _liquidGlassView.layer.cornerCurve = self.layer.cornerCurve;

  // On iOS 26+, don't clip bounds to allow interactive glass animations to be visible
  // The glass effect view handles its own clipping via cornerConfiguration
  if (@available(iOS 26.0, *)) {
    _liquidGlassView.layer.masksToBounds = NO;
  } else {
    _liquidGlassView.layer.masksToBounds = YES;
  }
}

- (void)updateLayoutMetrics:(const LayoutMetrics &)layoutMetrics oldLayoutMetrics:(const LayoutMetrics &)oldLayoutMetrics
{
  _layoutMetrics = layoutMetrics;
  [super updateLayoutMetrics:layoutMetrics oldLayoutMetrics:oldLayoutMetrics];
}

- (void)mountChildComponentView:(UIView<RCTComponentViewProtocol> *)childComponentView index:(NSInteger)index
{
  UIView *contentView = [_liquidGlassView getContentView];
  if (contentView) {
    [contentView insertSubview:childComponentView atIndex:index];
  } else {
    [_liquidGlassView addSubview:childComponentView];
  }
}

- (void)unmountChildComponentView:(UIView<RCTComponentViewProtocol> *)childComponentView index:(NSInteger)index
{
  [childComponentView removeFromSuperview];
}

- (void)dealloc
{
  [_liquidGlassView removeFromSuperview];
  _liquidGlassView = nil;
}

@end

Class<RCTComponentViewProtocol> LiquidGlassViewCls(void)
{
  return ReactNativeLiquidGlassView.class;
}
