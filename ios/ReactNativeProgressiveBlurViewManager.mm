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
    @"black": [UIColor blackColor],
    @"blue": [UIColor blueColor],
    @"brown": [UIColor brownColor],
    @"clear": [UIColor clearColor],
    @"cyan": [UIColor cyanColor],
    @"magenta": [UIColor magentaColor],
    @"gray": [UIColor grayColor],
    @"green": [UIColor greenColor],
    @"orange": [UIColor orangeColor],
    @"purple": [UIColor purpleColor],
    @"red": [UIColor redColor],
    @"transparent": [UIColor clearColor],
    @"white": [UIColor whiteColor],
    @"yellow": [UIColor yellowColor],
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
  // Handle 4-character hex (RGBA shorthand)
  else if (hexString.length == 4) {
    unsigned int hexValue;
    NSScanner *scanner = [NSScanner scannerWithString:hexString];
    if ([scanner scanHexInt:&hexValue] && [scanner isAtEnd]) {
      // Expand 4-digit hex to 8-digit (e.g., "FFF0" -> "FFFFFF00")
      unsigned int r = (hexValue & 0xF000) >> 12;
      unsigned int g = (hexValue & 0x0F00) >> 8;
      unsigned int b = (hexValue & 0x00F0) >> 4;
      unsigned int a = (hexValue & 0x000F);

      return [UIColor colorWithRed:(r | (r << 4)) / 255.0 green:(g | (g << 4)) / 255.0 blue:(b | (b << 4)) / 255.0 alpha:(a | (a << 4)) / 255.0];
    }
  }
  // Handle 3-character hex (RGB shorthand)
  else if (hexString.length == 3) {
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
  } else {
    NSLog(@"[ReactNativeProgressiveBlurView] Warning: Unsupported hex color length (%lu) for '%@', expected 3, 4, 6, or 8 characters",
          (unsigned long)hexString.length, colorString);
  }

  return [UIColor clearColor];
}

@end
