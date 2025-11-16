#import "ReactNativeProgressiveBlurView.h"

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
  Props::Shared _props;
}

+ (UIColor *)colorFromString:(NSString *)colorString {
  // Input validation
  if (!colorString || [colorString isEqualToString:@""] || colorString.length == 0) {
    return [UIColor clearColor];
  }

  if (colorString.length > 50) {
    NSLog(@"[ReactNativeProgressiveBlurView] Warning: Color string too long, using default clear color");
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

  // Handle hex colors
  NSString *hexString = colorString;
  if ([hexString hasPrefix:@"#"]) {
    if (hexString.length < 2) {
      NSLog(@"[ReactNativeProgressiveBlurView] Warning: Invalid hex color format '%@'", colorString);
      return [UIColor clearColor];
    }
    hexString = [hexString substringFromIndex:1];
  }

  NSCharacterSet *hexCharacterSet = [NSCharacterSet characterSetWithCharactersInString:@"0123456789ABCDEFabcdef"];
  NSCharacterSet *invalidCharacters = [hexCharacterSet invertedSet];
  if ([hexString rangeOfCharacterFromSet:invalidCharacters].location != NSNotFound) {
    NSLog(@"[ReactNativeProgressiveBlurView] Warning: Invalid hex color format '%@'", colorString);
    return [UIColor clearColor];
  }

  if (hexString.length == 6) {
    unsigned int hexValue;
    NSScanner *scanner = [NSScanner scannerWithString:hexString];
    if ([scanner scanHexInt:&hexValue] && [scanner isAtEnd]) {
      return [UIColor colorWithRed:((hexValue & 0xFF0000) >> 16) / 255.0
                             green:((hexValue & 0x00FF00) >> 8) / 255.0
                              blue:(hexValue & 0x0000FF) / 255.0
                             alpha:1.0];
    }
  } else if (hexString.length == 8) {
    unsigned long long hexValue;
    NSScanner *scanner = [NSScanner scannerWithString:hexString];
    if ([scanner scanHexLongLong:&hexValue] && [scanner isAtEnd]) {
      return [UIColor colorWithRed:((hexValue & 0xFF000000) >> 24) / 255.0
                             green:((hexValue & 0x00FF0000) >> 16) / 255.0
                              blue:((hexValue & 0x0000FF00) >> 8) / 255.0
                             alpha:(hexValue & 0x000000FF) / 255.0];
    }
  } else if (hexString.length == 3) {
    unsigned int hexValue;
    NSScanner *scanner = [NSScanner scannerWithString:hexString];
    if ([scanner scanHexInt:&hexValue] && [scanner isAtEnd]) {
      unsigned int r = (hexValue & 0xF00) >> 8;
      unsigned int g = (hexValue & 0x0F0) >> 4;
      unsigned int b = (hexValue & 0x00F);
      return [UIColor colorWithRed:(r | (r << 4)) / 255.0
                             green:(g | (g << 4)) / 255.0
                              blue:(b | (b << 4)) / 255.0
                             alpha:1.0];
    }
  }

  NSLog(@"[ReactNativeProgressiveBlurView] Warning: Could not parse color '%@'", colorString);
  return [UIColor clearColor];
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

    if (pbvProps.blurType != facebook::react::ReactNativeProgressiveBlurViewBlurType::Xlight) {
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

  if (oldViewProps.reducedTransparencyFallbackColor != newViewProps.reducedTransparencyFallbackColor) {
    if (!newViewProps.reducedTransparencyFallbackColor.empty()) {
      NSString *fallbackColorString = [[NSString alloc] initWithUTF8String:newViewProps.reducedTransparencyFallbackColor.c_str()];
      UIColor *fallbackColor = [ReactNativeProgressiveBlurView colorFromString:fallbackColorString];
      [ReactNativeProgressiveBlurViewHelper updateProgressiveBlurView:_progressiveBlurView withReducedTransparencyFallbackColor:fallbackColor];
    }
  }

  _props = props;
  [super updateProps:props oldProps:oldProps];
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
