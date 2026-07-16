# Consumer ProGuard/R8 rules shipped inside the AAR and applied automatically
# to any app that depends on @sbaiahmed1/react-native-blur.
#
# ReactNativeBlurView and ReactNativeProgressiveBlurView redirect the blur
# capture root by reflecting on the bundled QmBlurView library
# (com.github.qmdeve:qmblurview) by field name: mBaseBlurViewGroup,
# mDecorView, preDrawListener, mDifferentRoot and mForceRedraw. If R8 renames
# or removes those fields in a minified release build, the reflection throws
# NoSuchFieldException, the code silently falls back to capturing the whole
# activity decor view, and the app regresses to full-screen blur and
# navigation flicker (issue #89). Keep the library's classes and fields intact.
-keep class com.qmdeve.blurview.** { *; }
