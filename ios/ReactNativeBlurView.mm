#import "ReactNativeBlurView.h"

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
  Props::Shared _props;
}

+ (UIColor *)colorFromString:(NSString *)colorString {
  // Input validation
  if (!colorString || [colorString isEqualToString:@""] || colorString.length == 0) {
    return [UIColor clearColor]; // Default color
  }

  // Prevent excessively long strings that could cause performance issues
  if (colorString.length > 50) {
    NSLog(@"[ReactNativeBlurView] Warning: Color string too long, using default clear color");
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
      NSLog(@"[ReactNativeBlurView] Warning: Invalid hex color format '%@', using default clear color", colorString);
      return [UIColor clearColor];
    }
    hexString = [hexString substringFromIndex:1];
  }

  // Validate hex string contains only valid hex characters
  NSCharacterSet *hexCharacterSet = [NSCharacterSet characterSetWithCharactersInString:@"0123456789ABCDEFabcdef"];
  NSCharacterSet *invalidCharacters = [hexCharacterSet invertedSet];
  if ([hexString rangeOfCharacterFromSet:invalidCharacters].location != NSNotFound) {
    NSLog(@"[ReactNativeBlurView] Warning: Invalid hex color format '%@', contains non-hex characters", colorString);
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
    NSLog(@"[ReactNativeBlurView] Warning: Unsupported hex color length (%lu) for '%@', expected 3, 6, or 8 characters",
          (unsigned long)hexString.length, colorString);
  }

  NSLog(@"[ReactNativeBlurView] Warning: Could not parse color '%@', using default clear color", colorString);
  return [UIColor clearColor]; // Fallback to clear
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

    // Set initial glassTintColor from default props
    NSString *defaultGlassTintColorString = [[NSString alloc] initWithUTF8String:bvProps.glassTintColor.c_str()];
    UIColor *defaultGlassTintColor = [ReactNativeBlurView colorFromString:defaultGlassTintColorString];
    [ReactNativeBlurViewHelper updateBlurView:_advancedBlurView withGlassTintColor:defaultGlassTintColor];

    // Set initial glassOpacity from default props
    [ReactNativeBlurViewHelper updateBlurView:_advancedBlurView withGlassOpacity:bvProps.glassOpacity];

    // Set initial blurAmount from default props
    [ReactNativeBlurViewHelper updateBlurView:_advancedBlurView withBlurAmount:bvProps.blurAmount];

    // Set initial blurType from default props
    if (bvProps.blurType != facebook::react::ReactNativeBlurViewBlurType::Xlight) {
      NSString *blurTypeString = [[NSString alloc] initWithUTF8String:toString(bvProps.blurType).c_str()];
      [ReactNativeBlurViewHelper updateBlurView:_advancedBlurView withBlurType:blurTypeString];
    }

    // Set initial isInteractive from default props
      [ReactNativeBlurViewHelper updateBlurView:_advancedBlurView withIsInteractive:bvProps.isInteractive];

    [ReactNativeBlurViewHelper updateBlurView:_advancedBlurView withIgnoringSafeArea:bvProps.ignoreSafeArea];


    // Set initial glassType from default props
    if (bvProps.glassType != facebook::react::ReactNativeBlurViewGlassType::Clear) {
      NSString *glassTypeString = [[NSString alloc] initWithUTF8String:toString(bvProps.glassType).c_str()];
      [ReactNativeBlurViewHelper updateBlurView:_advancedBlurView withGlassType:glassTypeString];
    }

    // Set initial type from default props
    NSString *blurTypeString = [[NSString alloc] initWithUTF8String:toString(bvProps.type).c_str()];
    [ReactNativeBlurViewHelper updateBlurView:_advancedBlurView withType:blurTypeString];

    // Set initial reducedTransparencyFallbackColor from default props
    if (!bvProps.reducedTransparencyFallbackColor.empty()) {
      NSString *fallbackColorString = [[NSString alloc] initWithUTF8String:bvProps.reducedTransparencyFallbackColor.c_str()];
      UIColor *fallbackColor = [ReactNativeBlurView colorFromString:fallbackColorString];
      [ReactNativeBlurViewHelper updateBlurView:_advancedBlurView withReducedTransparencyFallbackColor:fallbackColor];
    }

    [self addSubview:_advancedBlurView];
  }
  return self;
}

- (void)updateProps:(Props::Shared const &)props oldProps:(Props::Shared const &)oldProps
{
  const auto &oldViewProps = *std::static_pointer_cast<ReactNativeBlurViewProps const>(_props);
  const auto &newViewProps = *std::static_pointer_cast<ReactNativeBlurViewProps const>(props);

  // Update glassTintColor if it has changed
  if (oldViewProps.glassTintColor != newViewProps.glassTintColor) {
    if (!newViewProps.glassTintColor.empty()) {
      NSString *glassTintColorString = [[NSString alloc] initWithUTF8String:newViewProps.glassTintColor.c_str()];
      UIColor *newGlassTintColor = [ReactNativeBlurView colorFromString:glassTintColorString];
      [ReactNativeBlurViewHelper updateBlurView:_advancedBlurView withGlassTintColor:newGlassTintColor];
    }
  }

  // Update glassOpacity if it has changed
  if (oldViewProps.glassOpacity != newViewProps.glassOpacity) {
    [ReactNativeBlurViewHelper updateBlurView:_advancedBlurView withGlassOpacity:newViewProps.glassOpacity];
  }

  // Update blurAmount if it has changed
  if (oldViewProps.blurAmount != newViewProps.blurAmount) {
    [ReactNativeBlurViewHelper updateBlurView:_advancedBlurView withBlurAmount:newViewProps.blurAmount];
  }

  // Update blurType if it has changed
  if (oldViewProps.blurType != newViewProps.blurType) {
    if (newViewProps.blurType != facebook::react::ReactNativeBlurViewBlurType::Xlight) {
      NSString *blurTypeString = [[NSString alloc] initWithUTF8String:toString(newViewProps.blurType).c_str()];
      [ReactNativeBlurViewHelper updateBlurView:_advancedBlurView withBlurType:blurTypeString];
    }
  }

  // Update glassType if it has changed
  if (oldViewProps.glassType != newViewProps.glassType) {
    if (newViewProps.glassType != facebook::react::ReactNativeBlurViewGlassType::Clear) {
      NSString *glassTypeString = [[NSString alloc] initWithUTF8String:toString(newViewProps.glassType).c_str()];
      [ReactNativeBlurViewHelper updateBlurView:_advancedBlurView withGlassType:glassTypeString];
    }
  }

  // Update type if it has changed
  if (oldViewProps.type != newViewProps.type) {
    NSString *blurTypeString = [[NSString alloc] initWithUTF8String:toString(newViewProps.type).c_str()];
    [ReactNativeBlurViewHelper updateBlurView:_advancedBlurView withType:blurTypeString];
  }

  // Update isInteractive if it has changed
  if (oldViewProps.isInteractive != newViewProps.isInteractive) {
    [ReactNativeBlurViewHelper updateBlurView:_advancedBlurView withIsInteractive:newViewProps.isInteractive];
  }

  if (oldViewProps.ignoreSafeArea != newViewProps.ignoreSafeArea) {
    [ReactNativeBlurViewHelper updateBlurView:_advancedBlurView withIgnoringSafeArea:newViewProps.ignoreSafeArea];
  }

  // Update reducedTransparencyFallbackColor if it has changed
  if (oldViewProps.reducedTransparencyFallbackColor != newViewProps.reducedTransparencyFallbackColor) {
    if (!newViewProps.reducedTransparencyFallbackColor.empty()) {
      NSString *fallbackColorString = [[NSString alloc] initWithUTF8String:newViewProps.reducedTransparencyFallbackColor.c_str()];
      UIColor *fallbackColor = [ReactNativeBlurView colorFromString:fallbackColorString];
      [ReactNativeBlurViewHelper updateBlurView:_advancedBlurView withReducedTransparencyFallbackColor:fallbackColor];
    }
  }

  // Store the new props
  _props = props;

  [super updateProps:props oldProps:oldProps];
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

