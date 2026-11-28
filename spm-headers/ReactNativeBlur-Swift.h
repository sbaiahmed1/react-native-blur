// This header mirrors the @objc API of the Swift files in ios/Helpers and ios/Views.
// If spm-support/SwiftHeaderPin.swift fails to compile, update both files together.
#pragma once

#import <UIKit/UIKit.h>

NS_ASSUME_NONNULL_BEGIN

__attribute__((objc_runtime_name("_TtC15ReactNativeBlur16AdvancedBlurView")))
@interface AdvancedBlurView : UIView
- (void)beginBatchUpdate;
- (void)endBatchUpdate;
@end

__attribute__((objc_runtime_name("_TtC15ReactNativeBlur20LiquidGlassContainer")))
@interface LiquidGlassContainer : UIVisualEffectView
@end

__attribute__((objc_runtime_name("_TtC15ReactNativeBlur24LiquidGlassContainerView")))
@interface LiquidGlassContainerView : UIView
- (void)beginBatchUpdate;
- (void)endBatchUpdate;
- (void)setBorderRadiiWithTopLeft:(CGFloat)topLeft
                         topRight:(CGFloat)topRight
                       bottomLeft:(CGFloat)bottomLeft
                      bottomRight:(CGFloat)bottomRight;
- (nullable UIView *)getContentView;
@end

__attribute__((objc_runtime_name("_TtC15ReactNativeBlur19ProgressiveBlurView")))
@interface ProgressiveBlurView : UIView
- (void)beginBatchUpdate;
- (void)endBatchUpdate;
@end

__attribute__((objc_runtime_name("_TtC15ReactNativeBlur18VibrancyEffectView")))
@interface VibrancyEffectView : UIView
- (void)beginBatchUpdate;
- (void)endBatchUpdate;
@end

__attribute__((objc_runtime_name("_TtC15ReactNativeBlur25ReactNativeBlurViewHelper")))
@interface ReactNativeBlurViewHelper : NSObject
+ (AdvancedBlurView *)createBlurViewWithFrame:(CGRect)frame;
+ (void)updateBlurView:(AdvancedBlurView *)blurView withBlurAmount:(double)blurAmount;
+ (void)updateBlurView:(AdvancedBlurView *)blurView withBlurType:(NSString *)blurType;
+ (void)updateBlurView:(AdvancedBlurView *)blurView withReducedTransparencyFallbackColor:(UIColor *)color;
+ (void)updateBlurView:(AdvancedBlurView *)blurView withIgnoringSafeArea:(BOOL)ignoreSafeArea;
@end

__attribute__((objc_runtime_name("_TtC15ReactNativeBlur37ReactNativeLiquidGlassContainerHelper")))
@interface ReactNativeLiquidGlassContainerHelper : NSObject
+ (LiquidGlassContainer *)createLiquidGlassContainerWithFrame:(CGRect)frame;
+ (void)updateLiquidGlassContainer:(LiquidGlassContainer *)container withSpacing:(double)spacing;
@end

__attribute__((objc_runtime_name("_TtC15ReactNativeBlur32ReactNativeLiquidGlassViewHelper")))
@interface ReactNativeLiquidGlassViewHelper : NSObject
+ (LiquidGlassContainerView *)createLiquidGlassViewWithFrame:(CGRect)frame;
+ (void)updateLiquidGlassView:(LiquidGlassContainerView *)view withGlassTintColor:(UIColor *)color;
+ (void)updateLiquidGlassView:(LiquidGlassContainerView *)view withGlassOpacity:(double)opacity;
+ (void)updateLiquidGlassView:(LiquidGlassContainerView *)view withGlassType:(NSString *)type;
+ (void)updateLiquidGlassView:(LiquidGlassContainerView *)view withIsInteractive:(BOOL)isInteractive;
+ (void)updateLiquidGlassView:(LiquidGlassContainerView *)view withIgnoringSafeArea:(BOOL)ignoreSafeArea;
+ (void)updateLiquidGlassView:(LiquidGlassContainerView *)view withReducedTransparencyFallbackColor:(UIColor *)color;
+ (BOOL)isLiquidGlassAvailable;
@end

__attribute__((objc_runtime_name("_TtC15ReactNativeBlur36ReactNativeProgressiveBlurViewHelper")))
@interface ReactNativeProgressiveBlurViewHelper : NSObject
+ (ProgressiveBlurView *)createProgressiveBlurViewWithFrame:(CGRect)frame;
+ (void)updateProgressiveBlurView:(ProgressiveBlurView *)view withBlurAmount:(double)amount;
+ (void)updateProgressiveBlurView:(ProgressiveBlurView *)view withDirection:(NSString *)direction;
+ (void)updateProgressiveBlurView:(ProgressiveBlurView *)view withStartOffset:(double)offset;
+ (void)updateProgressiveBlurView:(ProgressiveBlurView *)view withBlurType:(NSString *)type;
+ (void)updateProgressiveBlurView:(ProgressiveBlurView *)view withReducedTransparencyFallbackColor:(UIColor *)color;
+ (void)updateProgressiveBlurView:(ProgressiveBlurView *)view withMaterialTint:(nullable UIColor *)materialTint;
+ (void)updateProgressiveBlurView:(ProgressiveBlurView *)view withMaterialRadius:(double)materialRadius;
+ (BOOL)usesPrivateApi;
@end

__attribute__((objc_runtime_name("_TtC15ReactNativeBlur29ReactNativeVibrancyViewHelper")))
@interface ReactNativeVibrancyViewHelper : NSObject
+ (VibrancyEffectView *)createVibrancyViewWithFrame:(CGRect)frame;
+ (void)updateVibrancyView:(VibrancyEffectView *)view withBlurType:(NSString *)type;
+ (void)updateVibrancyView:(VibrancyEffectView *)view withBlurAmount:(double)amount;
+ (UIView *)getContentView:(VibrancyEffectView *)view;
@end

NS_ASSUME_NONNULL_END
