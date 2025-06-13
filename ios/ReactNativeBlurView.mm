#import "ReactNativeBlurView.h"

#import <react/renderer/components/ReactNativeBlurViewSpec/ComponentDescriptors.h>
#import <react/renderer/components/ReactNativeBlurViewSpec/EventEmitters.h>
#import <react/renderer/components/ReactNativeBlurViewSpec/Props.h>
#import <react/renderer/components/ReactNativeBlurViewSpec/RCTComponentViewHelpers.h>

#import "RCTFabricComponentsPlugins.h"

using namespace facebook::react;

@interface ReactNativeBlurView () <RCTReactNativeBlurViewViewProtocol>

@end

@implementation ReactNativeBlurView {
    UIVisualEffectView * _blurView;
    UIView * _fallbackView;
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

    [self setupBlurView];
  }

  return self;
}

- (void)setupBlurView
{
    // Create blur effect
    UIBlurEffect *blurEffect = [UIBlurEffect effectWithStyle:UIBlurEffectStyleLight];
    _blurView = [[UIVisualEffectView alloc] initWithEffect:blurEffect];
    _blurView.frame = self.bounds;
    _blurView.autoresizingMask = UIViewAutoresizingFlexibleWidth | UIViewAutoresizingFlexibleHeight;
    
    // Create fallback view for reduced transparency
    _fallbackView = [[UIView alloc] init];
    _fallbackView.frame = self.bounds;
    _fallbackView.autoresizingMask = UIViewAutoresizingFlexibleWidth | UIViewAutoresizingFlexibleHeight;
    _fallbackView.backgroundColor = [UIColor colorWithWhite:0.8 alpha:0.8];
    _fallbackView.hidden = YES;
    
    // Insert blur views at index 0 to avoid interfering with React's child view management
    [self insertSubview:_blurView atIndex:0];
    [self insertSubview:_fallbackView atIndex:0];
    
    // Check for reduced transparency
    [self updateForReducedTransparency];
    
    // Listen for accessibility changes
    [[NSNotificationCenter defaultCenter] addObserver:self
                                             selector:@selector(updateForReducedTransparency)
                                                 name:UIAccessibilityReduceTransparencyStatusDidChangeNotification
                                               object:nil];
}

- (void)updateForReducedTransparency
{
    BOOL reduceTransparency = UIAccessibilityIsReduceTransparencyEnabled();
    _blurView.hidden = reduceTransparency;
    _fallbackView.hidden = !reduceTransparency;
}

- (UIBlurEffectStyle)blurEffectStyleFromString:(NSString *)blurType
{
    if ([blurType isEqualToString:@"xlight"]) {
        return UIBlurEffectStyleExtraLight;
    } else if ([blurType isEqualToString:@"light"]) {
        return UIBlurEffectStyleLight;
    } else if ([blurType isEqualToString:@"dark"]) {
        return UIBlurEffectStyleDark;
    } else if ([blurType isEqualToString:@"extraDark"]) {
        if (@available(iOS 10.0, *)) {
            return UIBlurEffectStyleProminent;
        } else {
            return UIBlurEffectStyleDark;
        }
    } else if ([blurType isEqualToString:@"regular"]) {
        if (@available(iOS 10.0, *)) {
            return UIBlurEffectStyleRegular;
        } else {
            return UIBlurEffectStyleLight;
        }
    } else if ([blurType isEqualToString:@"prominent"]) {
        if (@available(iOS 10.0, *)) {
            return UIBlurEffectStyleProminent;
        } else {
            return UIBlurEffectStyleLight;
        }
    } else if ([blurType isEqualToString:@"systemUltraThinMaterial"]) {
        if (@available(iOS 13.0, *)) {
            return UIBlurEffectStyleSystemUltraThinMaterial;
        } else {
            return UIBlurEffectStyleLight;
        }
    } else if ([blurType isEqualToString:@"systemThinMaterial"]) {
        if (@available(iOS 13.0, *)) {
            return UIBlurEffectStyleSystemThinMaterial;
        } else {
            return UIBlurEffectStyleLight;
        }
    } else if ([blurType isEqualToString:@"systemMaterial"]) {
        if (@available(iOS 13.0, *)) {
            return UIBlurEffectStyleSystemMaterial;
        } else {
            return UIBlurEffectStyleLight;
        }
    } else if ([blurType isEqualToString:@"systemThickMaterial"]) {
        if (@available(iOS 13.0, *)) {
            return UIBlurEffectStyleSystemThickMaterial;
        } else {
            return UIBlurEffectStyleLight;
        }
    } else if ([blurType isEqualToString:@"systemChromeMaterial"]) {
        if (@available(iOS 13.0, *)) {
            return UIBlurEffectStyleSystemChromeMaterial;
        } else {
            return UIBlurEffectStyleLight;
        }
    }
    
    return UIBlurEffectStyleLight; // Default
}

- (void)updateProps:(Props::Shared const &)props oldProps:(Props::Shared const &)oldProps
{
    const auto &oldViewProps = *std::static_pointer_cast<ReactNativeBlurViewProps const>(_props);
    const auto &newViewProps = *std::static_pointer_cast<ReactNativeBlurViewProps const>(props);

    // Update blur type
    if (oldViewProps.blurType != newViewProps.blurType) {
        std::string blurTypeStr = toString(newViewProps.blurType);
        NSString *blurTypeString = [[NSString alloc] initWithUTF8String:blurTypeStr.c_str()];
        UIBlurEffectStyle blurStyle = [self blurEffectStyleFromString:blurTypeString];
        UIBlurEffect *blurEffect = [UIBlurEffect effectWithStyle:blurStyle];
        _blurView.effect = blurEffect;
    }
    
    // Update blur amount (create custom blur effect)
    if (oldViewProps.blurAmount != newViewProps.blurAmount) {
        [self updateBlurEffectWithAmount:newViewProps.blurAmount];
    }
    
    // Update fallback color
    if (oldViewProps.reducedTransparencyFallbackColor != newViewProps.reducedTransparencyFallbackColor) {
        if (!newViewProps.reducedTransparencyFallbackColor.empty()) {
            NSString *colorString = [[NSString alloc] initWithUTF8String:newViewProps.reducedTransparencyFallbackColor.c_str()];
            _fallbackView.backgroundColor = [self hexStringToColor:colorString];
        }
    }

    [super updateProps:props oldProps:oldProps];
}

- (void)updateBlurEffectWithAmount:(double)amount
{
    // For amounts 0-30: Use alpha blending with UIVisualEffectView
    // For amounts 30+: Create custom blur effect with Core Image
    
    if (amount <= 30.0) {
        // Use standard UIVisualEffectView with alpha
        CGFloat alpha = amount / 30.0; // Scale to 0-1 for low amounts
        _blurView.alpha = alpha;
        
        // Remove any custom blur layer
        [self.layer.sublayers enumerateObjectsUsingBlock:^(CALayer *layer, NSUInteger idx, BOOL *stop) {
            if ([layer.name isEqualToString:@"customBlur"]) {
                [layer removeFromSuperlayer];
            }
        }];
    } else {
        // Use full opacity for the base blur
        _blurView.alpha = 1.0;
        
        // Add custom blur overlay for enhanced effect
        [self addCustomBlurOverlayWithIntensity:(amount - 30.0) / 70.0]; // Scale 30-100 to 0-1
    }
}

- (void)addCustomBlurOverlayWithIntensity:(CGFloat)intensity
{
    // Remove existing custom blur layer
    [self.layer.sublayers enumerateObjectsUsingBlock:^(CALayer *layer, NSUInteger idx, BOOL *stop) {
        if ([layer.name isEqualToString:@"customBlur"]) {
            [layer removeFromSuperlayer];
        }
    }];
    
    // Create a semi-transparent overlay that simulates additional blur
    CALayer *blurOverlay = [CALayer layer];
    blurOverlay.name = @"customBlur";
    blurOverlay.frame = self.bounds;
    
    // Create a gradient effect that simulates depth
    CAGradientLayer *gradientLayer = [CAGradientLayer layer];
    gradientLayer.frame = self.bounds;
    
    // Adjust colors based on blur type
    UIColor *overlayColor;
    if ([self.blurType isEqualToString:@"dark"] || [self.blurType isEqualToString:@"extraDark"]) {
        overlayColor = [UIColor colorWithWhite:0.0 alpha:intensity * 0.3];
    } else {
        overlayColor = [UIColor colorWithWhite:1.0 alpha:intensity * 0.2];
    }
    
    gradientLayer.colors = @[
        (id)[overlayColor colorWithAlphaComponent:intensity * 0.1].CGColor,
        (id)[overlayColor colorWithAlphaComponent:intensity * 0.3].CGColor,
        (id)[overlayColor colorWithAlphaComponent:intensity * 0.1].CGColor
    ];
    
    gradientLayer.locations = @[@0.0, @0.5, @1.0];
    
    [blurOverlay addSublayer:gradientLayer];
    [self.layer addSublayer:blurOverlay];
}

- (NSString *)blurType
{
    const auto &props = *std::static_pointer_cast<ReactNativeBlurViewProps const>(_props);
    std::string blurTypeStr = toString(props.blurType);
    return [[NSString alloc] initWithUTF8String:blurTypeStr.c_str()];
}

- (void)mountChildComponentView:(UIView<RCTComponentViewProtocol> *)childComponentView index:(NSInteger)index
{
    // Always insert React subviews after the blur views (which are at indices 0 and 1)
    NSInteger adjustedIndex = index + 2;
    [self insertSubview:childComponentView atIndex:adjustedIndex];
}

- (void)unmountChildComponentView:(UIView<RCTComponentViewProtocol> *)childComponentView index:(NSInteger)index
{
    [childComponentView removeFromSuperview];
}

- (void)layoutSubviews
{
    [super layoutSubviews];
    
    // Ensure blur view and fallback view cover the entire bounds
    if (_blurView) {
        _blurView.frame = self.bounds;
    }
    if (_fallbackView) {
        _fallbackView.frame = self.bounds;
    }
    
    // Keep blur views at the back without using sendSubviewToBack to avoid index conflicts
    if (_blurView && _blurView.superview == self) {
        // Move to index 0 if not already there
        NSInteger currentIndex = [self.subviews indexOfObject:_blurView];
        if (currentIndex != 0 && currentIndex != NSNotFound) {
            [_blurView removeFromSuperview];
            [self insertSubview:_blurView atIndex:0];
        }
    }
    if (_fallbackView && _fallbackView.superview == self) {
        // Move to index 1 if not already there (after blur view)
        NSInteger currentIndex = [self.subviews indexOfObject:_fallbackView];
        if (currentIndex != 1 && currentIndex != NSNotFound) {
            [_fallbackView removeFromSuperview];
            [self insertSubview:_fallbackView atIndex:1];
        }
    }
}

- (void)dealloc
{
    [[NSNotificationCenter defaultCenter] removeObserver:self];
    
    // Clean up blur views
    if (_blurView) {
        [_blurView removeFromSuperview];
        _blurView = nil;
    }
    if (_fallbackView) {
        [_fallbackView removeFromSuperview];
        _fallbackView = nil;
    }
}

Class<RCTComponentViewProtocol> ReactNativeBlurViewCls(void)
{
    return ReactNativeBlurView.class;
}

- (UIColor *)hexStringToColor:(NSString *)stringToConvert
{
    if (!stringToConvert || stringToConvert.length == 0) {
        return [UIColor clearColor];
    }
    
    NSString *noHashString = [stringToConvert stringByReplacingOccurrencesOfString:@"#" withString:@""];
    NSScanner *stringScanner = [NSScanner scannerWithString:noHashString];

    unsigned hex;
    if (![stringScanner scanHexInt:&hex]) {
        return [UIColor clearColor];
    }
    
    int r = (hex >> 16) & 0xFF;
    int g = (hex >> 8) & 0xFF;
    int b = (hex) & 0xFF;

    return [UIColor colorWithRed:r / 255.0f green:g / 255.0f blue:b / 255.0f alpha:1.0f];
}

@end
