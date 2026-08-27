#import "ColorHelpers.h"

UIColor *RNBlurColorFromString(NSString *colorString) {
  // Input validation
  if (!colorString || [colorString isEqualToString:@""] || colorString.length == 0) {
    return [UIColor clearColor]; // Default color
  }

  // Prevent excessively long strings that could cause performance issues
  if (colorString.length > 50) {
    NSLog(@"[ReactNativeBlur] Warning: Color string too long, using default clear color");
    return [UIColor clearColor];
  }

  // Handle common color names
  static NSDictionary<NSString *, UIColor *> *colorMap;
  static NSCharacterSet *invalidCharacters;
  static dispatch_once_t onceToken;
  dispatch_once(&onceToken, ^{
    colorMap = @{
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
    invalidCharacters = [[NSCharacterSet characterSetWithCharactersInString:@"0123456789ABCDEFabcdef"] invertedSet];
  });

  UIColor *namedColor = colorMap[colorString.lowercaseString];
  if (namedColor) {
    return namedColor;
  }

  // Handle hex colors (e.g., "#FF0000", "FF0000", "#FF00FF00", "FF00FF00")
  NSString *hexString = colorString;
  if ([hexString hasPrefix:@"#"]) {
    if (hexString.length < 2) {
      NSLog(@"[ReactNativeBlur] Warning: Invalid hex color format '%@', using default clear color", colorString);
      return [UIColor clearColor];
    }
    hexString = [hexString substringFromIndex:1];
  }

  // Validate hex string contains only valid hex characters
  if ([hexString rangeOfCharacterFromSet:invalidCharacters].location != NSNotFound) {
    NSLog(@"[ReactNativeBlur] Warning: Invalid hex color format '%@', contains non-hex characters", colorString);
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
    NSLog(@"[ReactNativeBlur] Warning: Unsupported hex color length (%lu) for '%@', expected 3, 4, 6, or 8 characters",
          (unsigned long)hexString.length, colorString);
  }

  NSLog(@"[ReactNativeBlur] Warning: Could not parse color '%@', using default clear color", colorString);
  return [UIColor clearColor]; // Fallback to clear
}
