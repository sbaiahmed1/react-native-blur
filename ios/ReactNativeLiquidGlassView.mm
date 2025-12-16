#import "ReactNativeLiquidGlassView.h"

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
  Props::Shared _props;
  LayoutMetrics _layoutMetrics;
}

+ (UIColor *)colorFromString:(NSString *)colorString {
  // Input validation
  if (!colorString || [colorString isEqualToString:@""] || colorString.length == 0) {
    return [UIColor clearColor]; // Default color
  }

  // Prevent excessively long strings that could cause performance issues
  if (colorString.length > 50) {
    NSLog(@"[ReactNativeLiquidGlassView] Warning: Color string too long, using default clear color");
    return [UIColor clearColor];
  }

  // Handle common color names
  NSDictionary *colorMap = @{
    @"red": [UIColor redColor],
    @"blue": [UIColor blueColor],
    @"green": [UIColor greenColor],
    @"yellow": [UIColor yellowColor],
    @"orange": [UIColor orangeColor],
    @"purple": [UIColor purpleColor],
    @"black": [UIColor blackColor],
    @"white": [UIColor whiteColor],
    @"gray": [UIColor grayColor],
    @"clear": [UIColor clearColor],
    @"transparent": [UIColor clearColor]
  };

  UIColor *namedColor = colorMap[colorString.lowercaseString];
  if (namedColor) {
    return namedColor;
  }

  // Handle hex colors (e.g., "#FF0000", "FF0000", "#FF00FF00", "FF00FF00")
  NSString *hexString = colorString;
  if ([hexString hasPrefix:@"#"]) {
    if (hexString.length < 2) {
      NSLog(@"[ReactNativeLiquidGlassView] Warning: Invalid hex color format '%@', using default clear color", colorString);
      return [UIColor clearColor];
    }
    hexString = [hexString substringFromIndex:1];
  }

  // Validate hex string contains only valid hex characters
  NSCharacterSet *hexCharacterSet = [NSCharacterSet characterSetWithCharactersInString:@"0123456789ABCDEFabcdef"];
  NSCharacterSet *invalidCharacters = [hexCharacterSet invertedSet];
  if ([hexString rangeOfCharacterFromSet:invalidCharacters].location != NSNotFound) {
    NSLog(@"[ReactNativeLiquidGlassView] Warning: Invalid hex color format '%@', contains non-hex characters", colorString);
    return [UIColor clearColor];
  }

  // Handle 6-character hex (RGB)
  if (hexString.length == 6) {
    unsigned int hexValue;
    NSScanner *scanner = [NSScanner scannerWithString:hexString];
    if ([scanner scanHexInt:&hexValue] && [scanner isAtEnd]) {
      return [UIColor colorWithRed:((hexValue & 0xFF0000) >> 16) / 255.0
                             green:((hexValue & 0x00FF00) >> 8) / 255.0
                              blue:(hexValue & 0x0000FF) / 255.0
                             alpha:1.0];
    }
  }
  // Handle 8-character hex (RGBA)
  else if (hexString.length == 8) {
    unsigned long long hexValue;
    NSScanner *scanner = [NSScanner scannerWithString:hexString];
    if ([scanner scanHexLongLong:&hexValue] && [scanner isAtEnd]) {
      return [UIColor colorWithRed:((hexValue & 0xFF000000) >> 24) / 255.0
                             green:((hexValue & 0x00FF0000) >> 16) / 255.0
                              blue:((hexValue & 0x0000FF00) >> 8) / 255.0
                             alpha:(hexValue & 0x000000FF) / 255.0];
    }
  }
  // Handle 3-character hex (RGB shorthand)
  else if (hexString.length == 3) {
    unsigned int hexValue;
    NSScanner *scanner = [NSScanner scannerWithString:hexString];
    if ([scanner scanHexInt:&hexValue] && [scanner isAtEnd]) {
      // Expand 3-digit hex to 6-digit (e.g., "F0A" -> "FF00AA")
      unsigned int r = (hexValue & 0xF00) >> 8;
      unsigned int g = (hexValue & 0x0F0) >> 4;
      unsigned int b = (hexValue & 0x00F);

      return [UIColor colorWithRed:(r | (r << 4)) / 255.0
                             green:(g | (g << 4)) / 255.0
                              blue:(b | (b << 4)) / 255.0
                             alpha:1.0];
    }
  }
  else {
    NSLog(@"[ReactNativeLiquidGlassView] Warning: Unsupported hex color length (%lu) for '%@', expected 3, 6, or 8 characters",
          (unsigned long)hexString.length, colorString);
  }

  NSLog(@"[ReactNativeLiquidGlassView] Warning: Could not parse color '%@', using default clear color", colorString);
  return [UIColor clearColor]; // Fallback to clear
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

    // Set initial glassTintColor from default props
    NSString *defaultGlassTintColorString = [[NSString alloc] initWithUTF8String:lgProps.glassTintColor.c_str()];
    UIColor *defaultGlassTintColor = [ReactNativeLiquidGlassView colorFromString:defaultGlassTintColorString];
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
    if (!lgProps.reducedTransparencyFallbackColor.empty()) {
      NSString *fallbackColorString = [[NSString alloc] initWithUTF8String:lgProps.reducedTransparencyFallbackColor.c_str()];
      UIColor *fallbackColor = [ReactNativeLiquidGlassView colorFromString:fallbackColorString];
      [ReactNativeLiquidGlassViewHelper updateLiquidGlassView:_liquidGlassView withReducedTransparencyFallbackColor:fallbackColor];
    }

    // Set initial ignoreAccessibilityFallback from default props
    [ReactNativeLiquidGlassViewHelper updateLiquidGlassView:_liquidGlassView withIgnoringAccessibilityFallback:lgProps.ignoreAccessibilityFallback];

    [self addSubview:_liquidGlassView];
  }
  return self;
}

- (void)updateProps:(Props::Shared const &)props oldProps:(Props::Shared const &)oldProps
{
  const auto &oldViewProps = *std::static_pointer_cast<ReactNativeLiquidGlassViewProps const>(_props);
  const auto &newViewProps = *std::static_pointer_cast<ReactNativeLiquidGlassViewProps const>(props);

  // Update glassTintColor if it has changed
  if (oldViewProps.glassTintColor != newViewProps.glassTintColor) {
    if (!newViewProps.glassTintColor.empty()) {
      NSString *glassTintColorString = [[NSString alloc] initWithUTF8String:newViewProps.glassTintColor.c_str()];
      UIColor *newGlassTintColor = [ReactNativeLiquidGlassView colorFromString:glassTintColorString];
      [ReactNativeLiquidGlassViewHelper updateLiquidGlassView:_liquidGlassView withGlassTintColor:newGlassTintColor];
    }
  }

  // Update glassOpacity if it has changed
  if (oldViewProps.glassOpacity != newViewProps.glassOpacity) {
    [ReactNativeLiquidGlassViewHelper updateLiquidGlassView:_liquidGlassView withGlassOpacity:newViewProps.glassOpacity];
  }

  // Update glassType if it has changed
  if (oldViewProps.glassType != newViewProps.glassType) {
    if (newViewProps.glassType != facebook::react::ReactNativeLiquidGlassViewGlassType::Clear) {
      NSString *glassTypeString = [[NSString alloc] initWithUTF8String:toString(newViewProps.glassType).c_str()];
      [ReactNativeLiquidGlassViewHelper updateLiquidGlassView:_liquidGlassView withGlassType:glassTypeString];
    }
  }

  // Update isInteractive if it has changed
  if (oldViewProps.isInteractive != newViewProps.isInteractive) {
    [ReactNativeLiquidGlassViewHelper updateLiquidGlassView:_liquidGlassView withIsInteractive:newViewProps.isInteractive];
  }

  // Update ignoreSafeArea if it has changed
  if (oldViewProps.ignoreSafeArea != newViewProps.ignoreSafeArea) {
    [ReactNativeLiquidGlassViewHelper updateLiquidGlassView:_liquidGlassView withIgnoringSafeArea:newViewProps.ignoreSafeArea];
  }

  // Update reducedTransparencyFallbackColor if it has changed
  if (oldViewProps.reducedTransparencyFallbackColor != newViewProps.reducedTransparencyFallbackColor) {
    if (!newViewProps.reducedTransparencyFallbackColor.empty()) {
      NSString *fallbackColorString = [[NSString alloc] initWithUTF8String:newViewProps.reducedTransparencyFallbackColor.c_str()];
      UIColor *fallbackColor = [ReactNativeLiquidGlassView colorFromString:fallbackColorString];
      [ReactNativeLiquidGlassViewHelper updateLiquidGlassView:_liquidGlassView withReducedTransparencyFallbackColor:fallbackColor];
    }
  }

  // Update ignoreAccessibilityFallback if it has changed
  if (oldViewProps.ignoreAccessibilityFallback != newViewProps.ignoreAccessibilityFallback) {
    [ReactNativeLiquidGlassViewHelper updateLiquidGlassView:_liquidGlassView withIgnoringAccessibilityFallback:newViewProps.ignoreAccessibilityFallback];
  }

  // Store the new props
  _props = props;

  [super updateProps:props oldProps:oldProps];
}

- (void)finalizeUpdates:(RNComponentViewUpdateMask)updateMask
{
  [super finalizeUpdates:updateMask];
  
  // Apply border radius from layout metrics to the inner glass view (Callstack pattern)
  if (@available(iOS 26.0, *)) {
    const auto &props = *std::static_pointer_cast<ReactNativeLiquidGlassViewProps const>(_props);
    const auto borderMetrics = props.resolveBorderMetrics(_layoutMetrics);
    
    // Use topLeft.horizontal same as React Native RCTViewComponentView implementation
    CGFloat radius = borderMetrics.borderRadii.topLeft.horizontal;
    
    if (radius > 0) {
      [_liquidGlassView setBorderRadius:radius];
    }
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
