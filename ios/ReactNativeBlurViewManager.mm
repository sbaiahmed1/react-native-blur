#import "ReactNativeBlurViewManager.h"

#if __has_include("ReactNativeBlur-Swift.h")
#import "ReactNativeBlur-Swift.h"
#else
#import <ReactNativeBlur/ReactNativeBlur-Swift.h>
#endif

#import <React/RCTUIManager.h>
#import <React/RCTBridge.h>

@interface ReactNativeBlurViewManager ()

@end

@implementation ReactNativeBlurViewManager

RCT_EXPORT_MODULE(ReactNativeBlurView)

- (UIView *)view
{
  return [ReactNativeBlurViewHelper createBlurViewWithFrame:CGRectZero];
}

// Export properties

// Custom setters for proper type conversion

RCT_CUSTOM_VIEW_PROPERTY(blurAmount, NSNumber, AdvancedBlurView)
{
  double amount = json ? [RCTConvert double:json] : 10.0;
  [ReactNativeBlurViewHelper updateBlurView:view withBlurAmount:amount];
}

RCT_CUSTOM_VIEW_PROPERTY(blurType, NSString, AdvancedBlurView)
{
  NSString *blurType = json ? [RCTConvert NSString:json] : @"xlight";
  [ReactNativeBlurViewHelper updateBlurView:view withBlurType:blurType];
}

RCT_CUSTOM_VIEW_PROPERTY(reducedTransparencyFallbackColor, NSString, AdvancedBlurView)
{
  NSString *colorString = json ? [RCTConvert NSString:json] : @"#FFFFFF";
  UIColor *color = [self colorFromString:colorString];
  [ReactNativeBlurViewHelper updateBlurView:view withReducedTransparencyFallbackColor:color];
}

// Color parsing helper method (copied from ReactNativeBlurView.mm)
- (UIColor *)colorFromString:(NSString *)colorString {
  // Input validation
  if (!colorString || [colorString isEqualToString:@""] || colorString.length == 0) {
    return [UIColor clearColor]; // Default color
  }

  // Prevent excessively long strings that could cause performance issues
  if (colorString.length > 50) {
    NSLog(@"[ReactNativeBlurViewManager] Warning: Color string too long, using default clear color");
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
      NSLog(@"[ReactNativeBlurViewManager] Warning: Invalid hex color format '%@', using default clear color", colorString);
      return [UIColor clearColor];
    }
    hexString = [hexString substringFromIndex:1];
  }

  // Validate hex string contains only valid hex characters
  NSCharacterSet *hexCharacterSet = [NSCharacterSet characterSetWithCharactersInString:@"0123456789ABCDEFabcdef"];
  NSCharacterSet *invalidCharacters = [hexCharacterSet invertedSet];
  if ([hexString rangeOfCharacterFromSet:invalidCharacters].location != NSNotFound) {
    NSLog(@"[ReactNativeBlurViewManager] Warning: Invalid hex color format '%@', contains non-hex characters", colorString);
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
    NSLog(@"[ReactNativeBlurViewManager] Warning: Unsupported hex color length (%lu) for '%@', expected 3, 6, or 8 characters",
          (unsigned long)hexString.length, colorString);
  }

  NSLog(@"[ReactNativeBlurViewManager] Warning: Could not parse color '%@', using default clear color", colorString);
  return [UIColor clearColor]; // Fallback to clear
}

@end

