#import "ReactNativeProgressiveBlurViewManager.h"

#if __has_include("ReactNativeBlur-Swift.h")
#import "ReactNativeBlur-Swift.h"
#else
#import <ReactNativeBlur/ReactNativeBlur-Swift.h>
#endif

#import <React/RCTUIManager.h>
#import <React/RCTBridge.h>

@interface ReactNativeProgressiveBlurViewManager ()

@end

@implementation ReactNativeProgressiveBlurViewManager

RCT_EXPORT_MODULE(ReactNativeProgressiveBlurView)

- (UIView *)view
{
  return [ReactNativeProgressiveBlurViewHelper createProgressiveBlurViewWithFrame:CGRectZero];
}

// Export properties

RCT_CUSTOM_VIEW_PROPERTY(blurAmount, NSNumber, ProgressiveBlurView)
{
  double amount = json ? [RCTConvert double:json] : 20.0;
  [ReactNativeProgressiveBlurViewHelper updateProgressiveBlurView:view withBlurAmount:amount];
}

RCT_CUSTOM_VIEW_PROPERTY(blurType, NSString, ProgressiveBlurView)
{
  NSString *blurType = json ? [RCTConvert NSString:json] : @"regular";
  [ReactNativeProgressiveBlurViewHelper updateProgressiveBlurView:view withBlurType:blurType];
}

RCT_CUSTOM_VIEW_PROPERTY(direction, NSString, ProgressiveBlurView)
{
  NSString *direction = json ? [RCTConvert NSString:json] : @"blurredTopClearBottom";
  [ReactNativeProgressiveBlurViewHelper updateProgressiveBlurView:view withDirection:direction];
}

RCT_CUSTOM_VIEW_PROPERTY(startOffset, NSNumber, ProgressiveBlurView)
{
  double offset = json ? [RCTConvert double:json] : 0.0;
  [ReactNativeProgressiveBlurViewHelper updateProgressiveBlurView:view withStartOffset:offset];
}

RCT_CUSTOM_VIEW_PROPERTY(reducedTransparencyFallbackColor, NSString, ProgressiveBlurView)
{
  NSString *colorString = json ? [RCTConvert NSString:json] : @"#FFFFFF";
  UIColor *color = [self colorFromString:colorString];
  [ReactNativeProgressiveBlurViewHelper updateProgressiveBlurView:view withReducedTransparencyFallbackColor:color];
}

// Color parsing helper method
- (UIColor *)colorFromString:(NSString *)colorString {
  if (!colorString || [colorString isEqualToString:@""] || colorString.length == 0) {
    return [UIColor clearColor];
  }

  if (colorString.length > 50) {
    NSLog(@"[ReactNativeProgressiveBlurViewManager] Warning: Color string too long");
    return [UIColor clearColor];
  }

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

  NSString *hexString = colorString;
  if ([hexString hasPrefix:@"#"]) {
    if (hexString.length < 2) {
      return [UIColor clearColor];
    }
    hexString = [hexString substringFromIndex:1];
  }

  NSCharacterSet *hexCharacterSet = [NSCharacterSet characterSetWithCharactersInString:@"0123456789ABCDEFabcdef"];
  NSCharacterSet *invalidCharacters = [hexCharacterSet invertedSet];
  if ([hexString rangeOfCharacterFromSet:invalidCharacters].location != NSNotFound) {
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

  return [UIColor clearColor];
}

@end
