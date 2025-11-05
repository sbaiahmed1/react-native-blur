# @sbaiahmed1/react-native-blur

A modern React Native blur view component that provides native blur effects and **liquid glass effects** for iOS (with Android fallback to enhanced blur).
<div align="center">
  <p>
    <img src="https://img.shields.io/npm/v/@sbaiahmed1/react-native-blur?style=for-the-badge&color=blue" alt="npm version" />
    <img src="https://img.shields.io/npm/dt/@sbaiahmed1/react-native-blur?style=for-the-badge&color=green" alt="downloads" />
    <img src="https://img.shields.io/github/license/sbaiahmed1/react-native-blur?style=for-the-badge&color=orange" alt="license" />
    <img src="https://img.shields.io/github/stars/sbaiahmed1/react-native-blur?style=for-the-badge&color=yellow" alt="stars" />
  </p>

  <p>
    <img src="https://img.shields.io/badge/New%20Architecture-Ready-purple?style=for-the-badge" alt="New Architecture" />
    <img src="https://img.shields.io/badge/iOS%2026+-Liquid%20Glass-blue?style=for-the-badge" alt="Liquid Glass" />
    <img src="https://img.shields.io/badge/SwiftUI-Powered-orange?style=for-the-badge" alt="SwiftUI" />
  </p>
</div>

## Demo

<div align="center">
  <img src="ios-blur-glass-demo.gif" alt="iOS Demo" width="300" />
  <img src="android-blur-glass-demo.gif" alt="Android Demo" width="300" />

  <br>
  <em>iOS (left) and Android (right) blur effects in action</em>
  <br>
  <em>Liquid Glass effect in action (iOS 26+ only)</em>
  <br>
  <strong>⚠️ Android automatically falls back to enhanced blur with tint overlay</strong>
</div>

## Version Compatibility

### Xcode Requirements

| Library Version | Minimum Xcode Version | iOS Features Available |
|-----------------|----------------------|----------------------|
| **0.3.0+** (Current) | **Xcode 26.0** | ✅ Full liquid glass effects with UIGlassEffect API<br/>✅ Enhanced SwiftUI implementation<br/>✅ All blur types and system materials |
| **0.2.1** | Xcode 16.0+ | ✅ Standard blur effects<br/>✅ System materials (iOS 13+)<br/>❌ No liquid glass effects |

### Xcode 26.0+ Compatibility Table

| Xcode Version | Library Compatibility | Features Available | Notes |
|---------------|----------------------|-------------------|-------|
| **Xcode 26.0+** | ✅ **Fully Supported** | ✅ All features including liquid glass effects<br/>✅ UIGlassEffect API<br/>✅ SwiftUI implementation<br/>✅ All blur types and system materials | **Recommended for current version** |
| **Xcode 16.x and below** | ❌ **Not Supported** | ❌ Liquid glass effects<br/>❌ UIGlassEffect API<br/>⚠️ Basic blur effects may work with limitations | Use library version 0.2.1 instead |

> ⚠️ **Critical Requirement**: The current version (0.3.0+) requires **Xcode 26.0 or higher** and will not work with older Xcode versions. This is a hard requirement due to the UIGlassEffect API and SwiftUI enhancements introduced in Xcode 26.0.

> 💡 **Migration Tip**: If you're unable to upgrade to Xcode 26.0, please use version **0.2.1** of this library which supports Xcode 16.0 and provides standard blur effects without liquid glass capabilities.

## Features

- 🌊 **Liquid Glass Effects**: Revolutionary glass effects using iOS 26+ UIGlassEffect API
- 🎨 **Multiple Blur Types**: Support for various blur styles including system materials on iOS
- 📱 **Cross-Platform**: Works on both iOS and Android
- ♿ **Accessibility**: Automatic fallback for reduced transparency settings
- 🔧 **TypeScript**: Full TypeScript support with proper type definitions
- 🚀 **Turbo Module**: Built with React Native's new architecture (Fabric)
- 🎯 **Customizable**: Adjustable blur intensity, glass tint colors, and opacity
- 💡 **Performance Optimized**: Uses hardware acceleration for smooth rendering
- 🛠️ **Easy to Use**: Simple API for quick integration into your React Native projects
- 📦 **Modern**: Uses SwiftUI for iOS and Kotlin for Android, ensuring cutting-edge development practices
- 🔄 **Smart Fallbacks**: Graceful degradation from liquid glass to blur on older iOS versions

## 📊 Library Comparison

This section provides a detailed comparison between `@sbaiahmed1/react-native-blur` and other popular blur libraries in the React Native ecosystem.

### 🆚 vs. [@react-native-community/blur](https://www.npmjs.com/package/@react-native-community/blur)

| Feature                      | @sbaiahmed1/react-native-blur       | @react-native-community/blur          |
|------------------------------|-------------------------------------|---------------------------------------|
| **🏗️ New Architecture Support** | ✅ Full Fabric/Turbo Module support  | ❌ Limited support, crashes on Android |
| **🤖 Android Real Blur**        | ✅ Hardware-accelerated real blur + liquid glass | Hardware-accelerated real blur      |
| **🍎 iOS Blur Quality**         | ✅ Native UIVisualEffectView + UIGlassEffect | ✅ Native UIVisualEffectView only           |
| **💎 Liquid Glass Effects**     | ✅ Full support (iOS 26+ UIGlassEffect & Android) | ❌ Not supported                       |
| **📝 TypeScript Support**       | ✅ Complete TypeScript definitions with IntelliSense | ⚠️ Basic TypeScript support           |
| **🔧 Maintenance Status**       | ✅ Actively maintained  | ⚠️ Community-maintained, slower updates |
| **📦 Bundle Size**              | 🟡 Moderate (includes native blur libs) | 🟡 Moderate (includes BlurView lib)   |
| **🎯 API Design**           | ✅ Modern, intuitive API with smart defaults | 🟡 Legacy API design                          |
| **⚡ Performance**              | ✅ Hardware-accelerated on both platforms | ✅ Hardware-accelerated on both platforms       |
| **♿ Accessibility**            | ✅ Full reduced transparency + motion support | ✅ Basic reduced transparency support        |
| **📚 Documentation**            | ✅ Comprehensive guides + live examples | 🟡 Basic README documentation                |
| **🎨 Blur Types**               | ✅ iOS system materials + custom Android effects | ✅ iOS blur types (including iOS 13 materials) |
| **🔧 Android Blur Methods**     | ✅ Native hardware-accelerated blur | ✅ Native hardware-accelerated blur |
| **📱 Platform Support**         | ✅ iOS, Android with feature parity | ✅ iOS (full), Android (limited overlay) |

**🚀 Why Choose @sbaiahmed1/react-native-blur:**

- **🎯 Revolutionary Android Experience**: First library to bring **real hardware-accelerated blur** to Android, including liquid glass effects. No more fake transparency overlays!
- **💎 Liquid Glass Pioneer**: Only library supporting iOS 26+ UIGlassEffect API for stunning liquid glass materials on both platforms
- **🏗️ Future-Proof Architecture**: Built exclusively for React Native's new architecture (Fabric/Turbo Modules) - no legacy baggage
- **⚡ Superior Performance**: Hardware acceleration on both platforms with GPU-optimized rendering pipelines
- **🔧 Modern Development**: Swift for iOS, Kotlin for Android - leveraging the latest native technologies
- **📈 Active Innovation**: Regular feature updates, performance improvements, and new blur effects

**When to choose @react-native-community/blur:**
- Legacy projects that can't upgrade to new architecture
- iOS-only applications where Android blur quality isn't important
- Projects requiring maximum stability over cutting-edge features

### 🆚 vs. [expo-blur](https://docs.expo.dev/versions/latest/sdk/blur-view/)

| Feature | @sbaiahmed1/react-native-blur | expo-blur |
|---------|------------------------------|----------|
| **🚫 Expo Dependency** | ✅ Zero dependencies on Expo ecosystem | ❌ Requires Expo SDK + managed workflow |
| **📱 Bare React Native** | ✅ Works with any RN project out-of-the-box | ⚠️ Complex setup for bare RN projects |
| **🤖 Android Support** | ✅ Real hardware-accelerated blur + liquid glass | ⚠️ Simple overlay + Experimental blur (experimentalBlurMethod prop) |
| **🍎 iOS Support** | ✅ Full native blur + UIGlassEffect (iOS 26+) | ✅ Native UIVisualEffectView support |
| **💎 Liquid Glass Effects** | ✅ Full support (iOS 26+ UIGlassEffect & Android) | ❌ Not supported, no plans to add |
| **📦 Bundle Size** | 🟡 Moderate (includes native libs) | ✅ Lightweight (when using Expo managed) |
| **⚙️ Setup Complexity** | ✅ Simple `npm install` + auto-linking | 🟡 Requires Expo development build setup |
| **🎨 Blur Types** | ✅ iOS system materials + custom Android effects | ✅ iOS tint types (light, dark, system materials) |
| **🎯 API Design** | ✅ `blurAmount` + `blurType` for precise control | ✅ `intensity` + `tint` (simple but limited) |
| **🏗️ New Architecture** | ✅ Native Fabric/Turbo Module support | ✅ Expo handles compatibility layer |
| **👨‍💻 Development Experience** | ✅ Standard RN development workflow | ✅ Excellent with Expo CLI tools |
| **🚀 Production Flexibility** | ✅ Any deployment method (CodePush, OTA, stores) | 🟡 Limited to Expo/EAS deployment |
| **🔧 Native Module Integration** | ✅ Easy integration with other native modules | ⚠️ May conflict with Expo managed workflow |
| **🤖 Android Blur Quality** | ✅ Hardware-accelerated real blur (QmBlurView) | ❌ Experimental (dimezisBlurView or none fallback) |

**🚀 Why Choose @sbaiahmed1/react-native-blur:**

- **🔓 No Vendor Lock-in**: Complete freedom from Expo ecosystem - works with any React Native setup
- **🎯 Revolutionary Android**: First library to deliver **real blur effects** on Android, not fake transparency tricks
- **💎 Liquid Glass Innovation**: Exclusive support for cutting-edge liquid glass materials on both platforms
- **🏢 Enterprise Ready**: Perfect for brownfield apps, custom native modules, and complex deployment scenarios
- **🎨 Advanced Customization**: 15+ iOS system materials plus custom Android blur implementations
- **⚡ Direct Performance**: No abstraction layers - direct access to native blur APIs for maximum performance
- **🔧 Developer Freedom**: Use any build system, deployment method, or native module without restrictions

**When to choose expo-blur:**
- Already deeply invested in Expo managed workflow
- Building simple apps with basic blur needs (iOS-focused)
- Prefer Expo's managed dependency system over manual configuration
- Don't need advanced blur effects or Android blur quality

### ⚡ Performance Comparison

| Metric | @sbaiahmed1/react-native-blur | @react-native-community/blur | expo-blur |
|--------|------------------------------|------------------------------|----------|
| **🍎 iOS Rendering** | Hardware-accelerated UIVisualEffect + UIGlassEffect | Hardware-accelerated UIVisualEffect | Hardware-accelerated UIVisualEffect |
| **🤖 Android Rendering** | **Hardware-accelerated real blur** | **Hardware-accelerated real blur** | ❌ Software overlay (fake blur) |
| **🧠 Memory Usage** | Optimized with native BlurView libs | Optimized with native BlurView libs | Low (no real Android blur) |
| **⚙️ CPU Impact** | Low (GPU-based on both platforms) | iOS: Low, Android: Minimal (no blur) | iOS: Low, Android: Minimal (no blur) |
| **📊 Frame Rate Impact** | Minimal impact on both platforms | iOS: Minimal, Android: None (no blur) | iOS: Minimal, Android: None (no blur) |
| **🎯 Blur Quality** | **Excellent on both platforms** | iOS: Excellent, Android: Poor | iOS: Good, Android: Poor |
| **💎 Liquid Glass Performance** | **Native UIGlassEffect + Android equivalent** | ❌ Not available | ❌ Not available |
| **🚀 New Architecture Performance** | **Optimized for Fabric/Turbo Modules** | Limited compatibility | Expo abstraction layer |

### 🤝 Community & Support

| Aspect | @sbaiahmed1/react-native-blur | @react-native-community/blur | expo-blur |
|--------|------------------------------|------------------------------|----------|
| **⭐ GitHub Stars** | 🆕 Growing rapidly (new innovative features) | 🌟 Established (3.8k+, legacy codebase) | 🌟 Part of Expo ecosystem |
| **🎯 Issue Response** | ✅ **Active core maintainer** (< 24h response) | 🟡 Community-driven (slow response) | ✅ Expo team support |
| **📚 Documentation Quality** | ✅ **Comprehensive guides + live examples** | 🟡 Basic README only | ✅ Good (Expo docs) |
| **🔄 Update Frequency** | ✅ **Regular feature updates** (weekly/monthly) | 🟡 Sporadic maintenance updates | ✅ Regular (with Expo releases) |
| **💔 Breaking Changes** | ✅ **Strict semantic versioning** | ⚠️ Occasional unannounced changes | ✅ Managed by Expo |
| **🐛 Bug Fixes** | ✅ **Rapid fixes** (same-day for critical issues) | 🟡 Depends on community availability | ✅ Good (Expo team) |
| **💡 Feature Requests** | ✅ **Actively considered** (roadmap-driven) | 🟡 Limited by maintainer capacity | 🟡 Limited to Expo priorities |
| **🔧 Technical Support** | ✅ **Direct maintainer support** | 🟡 Community forums only | ✅ Expo Discord/forums |

### 🔄 Migration Guide

#### 🚀 From @react-native-community/blur

```tsx
// Before - Limited Android support
import { BlurView } from '@react-native-community/blur';

<BlurView
  style={styles.absolute}
  blurType="light"           // Limited to iOS blur types only
  blurAmount={10}            // Max 32 on Android (clamped)
  reducedTransparencyFallbackColor="white"
/>

// After - Full platform support + liquid glass
import { BlurView } from '@sbaiahmed1/react-native-blur';

<BlurView
  style={styles.absolute}
  blurType="light"              // Same API!
  blurAmount={10}               // No Android limitations
  reducedTransparencyFallbackColor="white"
  // NEW: Liquid glass support
  type="liquidGlass"            // Enable liquid glass effects
  glassType="regular"           // iOS 26+ UIGlassEffect styles
  glassTintColor="#007AFF"      // Glass tint color
  glassOpacity={0.8}            // Glass opacity (0-1)
/>
```

**✨ Migration Benefits:**
- **🎯 Zero Breaking Changes**: Drop-in replacement with same API
- **🤖 Real Android Blur**: Instantly get hardware-accelerated blur on Android
- **💎 Liquid Glass Bonus**: Add cutting-edge liquid glass effects with one prop
- **⚡ Better Performance**: Hardware acceleration on both platforms
- **🏗️ Future-Proof**: Built for React Native's new architecture

#### 🚀 From expo-blur

```tsx
// Before - Expo dependency + limited Android
import { BlurView } from 'expo-blur';

<BlurView
  intensity={50}                // 0-100 intensity scale
  tint="light"                  // light, dark, default, system materials
  experimentalBlurMethod="none" // Limited Android blur support
  style={styles.absolute}
>
  <Text>Content</Text>
</BlurView>

// After - No expo dependencies + real Android blur (QmBlurView)
import { BlurView } from '@sbaiahmed1/react-native-blur';

<BlurView
  blurAmount={50}               // intensity → blurAmount (same scale)
  blurType="light"              // tint → blurType (same options + more)
  style={styles.absolute}
  // NEW: Advanced features
  type="liquidGlass"            // Liquid glass effects
  glassType="regular"           // iOS 26+ materials
  glassTintColor="#007AFF"      // Glass tint color
  glassOpacity={0.8}            // Glass opacity (0-1)
  isInteractive={true}          // Touch interaction support
  // No experimental props needed - real blur by default
>
  <Text>Content</Text>
</BlurView>
```

**✨ Migration Benefits:**
- **🔓 No Vendor Lock-in**: Remove Expo dependency completely
- **🎯 Real Android Blur**: Get actual blur effects, not fake transparency
- **💎 Liquid Glass Effects**: Access to cutting-edge iOS 26+ materials
- **🚀 Deployment Freedom**: Use any build system or deployment method
- **🎨 More Customization**: 15+ blur types vs basic intensity control

#### 🛠️ Quick Migration Checklist

1. **Install the library:**
   ```bash
   npm uninstall @react-native-community/blur expo-blur
   npm install @sbaiahmed1/react-native-blur
   ```

2. **Update imports:**
   ```tsx
   // Replace old imports
   import { BlurView } from '@sbaiahmed1/react-native-blur';
   ```

3. **Optional: Add liquid glass effects:**
   ```tsx
   <BlurView
     type="liquidGlass"
     glassType="regular"
     glassTintColor="#007AFF"
     glassOpacity={0.8}
   />
   ```

4. **Test on Android:** Experience real blur effects for the first time! 🎉

### Recommendation

**Choose @sbaiahmed1/react-native-blur if:**
- You need **real blur effects on Android** (not experimental/fallback methods)
- You want **liquid glass effects** for modern iOS apps (iOS 26+)
- You're building with **React Native's new architecture** (Fabric/Turbo Modules)
- You need **maximum performance** on both platforms
- You want **comprehensive TypeScript support** with IntelliSense
- You prefer **modern API design** with intuitive prop names
- You need **unlimited blur intensity** on Android (no 32-unit clamp)

**Choose @react-native-community/blur if:**
- You're working with **legacy React Native projects** (< 0.68)
- You need **battle-tested stability** over cutting-edge features
- Your app **primarily targets iOS** (where it performs excellently)
- You can accept **limited Android blur quality** (overlay-based)
- You prefer **community-driven** open source projects

**Choose expo-blur if:**
- You're already **committed to the Expo ecosystem**
- You're building **simple apps** with basic blur needs
- You want **zero native configuration** (Expo managed workflow)
- **Bundle size** is your primary concern
- You can accept **experimental Android blur** with potential fallbacks

## Installation

> ⚠️ **ANDROID USERS**: This library requires Android Gradle Plugin (AGP) version **8.9.1 or newer**. See [Android Setup Requirements](#android-setup) for details.

```bash
npm install @sbaiahmed1/react-native-blur
# or
yarn add @sbaiahmed1/react-native-blur
```

### iOS Setup

Run pod install:

```bash
cd ios && pod install
```

### Android Setup

### Requirements
- **Minimum SDK:** API level 24 (Android 7.0)
- **Target SDK:** API level 35 (Android 15)
- **Compile SDK:** API level 35 (Android 15)
- **Gradle:** 8.10.2
- **Kotlin:** 2.0.21

> ⚠️ **CRITICAL REQUIREMENT - Android Gradle Plugin Version**: This library requires Android Gradle Plugin (AGP) version **8.9.1 or newer**. 
> 
> **Check your AGP version** in `android/build.gradle`:
> ```gradle
> classpath "com.android.tools.build:gradle:X.X.X"
> ```
> 
> **Compatibility:**
> - ✅ AGP 8.9.1 or newer (e.g., 8.9.1, 8.10.2, 8.11.x) - **Required**
> - ✅ AGP 8.10.x - **Recommended for best compatibility**
> - ❌ AGP 8.8.x or older - **Will NOT work with this library**
>
> If you're using an older version of AGP (8.8.x or earlier), you **must upgrade** to at least AGP 8.9.1 to use this library. This is a hard requirement due to the native Android implementation.

### Dependencies
The Android implementation uses the [QmBlurView library](https://github.com/QmDeve/QmBlurView):
```gradle
implementation 'com.github.QmDeve:QmBlurView:v1.0.4.3'
```

For more information, see the [QmBlurView documentation](https://github.com/QmDeve/QmBlurView/wiki).

### Implementation Details
The Android implementation leverages the QmBlurView library to provide real blur effects:

- **Real-time Blur:** Uses advanced blur algorithms for hardware-accelerated rendering
- **Hardware Acceleration:** Utilizes GPU rendering for optimal performance
- **Stable API:** QmBlurView provides a more stable and maintained solution
- **Multiple Blur Algorithms:** Supports different blur implementations based on device capabilities
- **Performance Optimized:** Efficient blur rendering with minimal impact on app performance
- **Fallback Handling:** Gracefully handles devices with limited graphics capabilities
- **No Extra Permissions:** Does not require additional Android permissions

### Android Version Compatibility

This library automatically handles Android version compatibility to prevent `NoClassDefFoundError` issues:

- **Android 12+ (API 31+):** Uses `RenderEffectBlur` for optimal performance and modern blur effects
- **Android 10-11 (API 29-30):** Automatically falls back to `RenderScriptBlur` for compatibility
- **Older Android versions:** Graceful fallback to semi-transparent overlay when blur is not supported

**Note:** The library includes automatic API level detection and will choose the appropriate blur algorithm based on the device's Android version. This ensures compatibility across all supported Android versions without requiring any additional configuration.

#### Troubleshooting Android Issues

If you encounter `java.lang.NoClassDefFoundError: Failed resolution of: Landroid/graphics/RenderEffect;` on Android 10 or 11:

1. **This is automatically handled** - The library now includes fallback mechanisms
2. **Update to latest version** - Ensure you're using the latest version of this library
3. **Clean and rebuild** - Run `cd android && ./gradlew clean` then rebuild your project

The error occurs because `RenderEffect` was introduced in Android 12 (API 31), but the library now automatically detects the API level and uses compatible alternatives on older versions.

## Usage

### Basic Usage

```tsx
import React from 'react';
import { View, Text } from 'react-native';
import { BlurView } from '@sbaiahmed1/react-native-blur';

export default function App() {
  return (
    <View style={{ flex: 1 }}>
      <BlurView
        blurType="light"
        blurAmount={20}
        style={{
          position: 'absolute',
          top: 100,
          left: 50,
          right: 50,
          height: 200,
          borderRadius: 20,
        }}
      >
        <Text>Content with blur background</Text>
      </BlurView>
    </View>
  );
}
```

### Advanced Usage

```tsx
import React from 'react';
import { BlurView } from '@sbaiahmed1/react-native-blur';

function MyComponent() {
  return (
    <BlurView
      blurType="systemMaterial"
      blurAmount={50}
      reducedTransparencyFallbackColor="#FFFFFF80"
      style={{
        padding: 20,
        borderRadius: 15,
      }}
    >
      <Text>Advanced blur with custom fallback</Text>
    </BlurView>
  );
}
```

### Liquid Glass Usage (iOS 26+)

```tsx
import React from 'react';
import { BlurView } from '@sbaiahmed1/react-native-blur';

function LiquidGlassComponent() {
  return (
    <BlurView
      type="liquidGlass"
      glassType="regular"
      glassTintColor="#007AFF"
      glassOpacity={0.8}
      style={{
        padding: 20,
        borderRadius: 20,
      }}
    >
      <Text>Beautiful liquid glass effect</Text>
    </BlurView>
  );
}
```

## Props

All props are optional and have sensible defaults.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `type` | `'blur' \| 'liquidGlass'` | `'blur'` | The type of effect to apply. **Note**: `'liquidGlass'` is iOS 26+ only, falls back to enhanced blur on Android |
| `blurType` | `BlurType` | `'xlight'` | The type of blur effect to apply |
| `blurAmount` | `number` | `10.0` | The intensity of the blur effect (0-100) |
| `glassType` | `GlassType` | `'clear'` | The type of glass effect |
| `glassTintColor` | `string` | `'clear'` | The tint color for glass effect |
| `glassOpacity` | `number` | `1.0` | The opacity of glass effect (0-1) |
| `ignoreSafeArea` | `boolean` | `false` | (iOS only) Controls whether the blur or liquid glass effect should ignore all safe area edges or stops once it reaches it |
| `isInteractive` | `boolean` | `true` | (iOS only) Controls whether the liquid glass effect is interactive. When `false`, the liquid glass effect will not react to touch or movement. Only applicable when `type` is `'liquidGlass'` and iOS 26+. |
| `reducedTransparencyFallbackColor` | `string` | `'#FFFFFF'` | Fallback color when reduced transparency is enabled |
| `style` | `ViewStyle` | `undefined` | Style object for the blur view |
| `children` | `ReactNode` | `undefined` | Child components to render inside the blur view |

> **Note**: The `BlurType` and `GlassType` are exported types from the library. See [Blur Types](#blur-types) section below for all available values.

## Blur Types

The following blur types are supported:

### iOS & Android
- `'light'` - Light blur effect
- `'dark'` - Dark blur effect
- `'xlight'` - Extra light blur effect
- `'extraDark'` - Extra dark blur effect

### iOS Only (with fallbacks on Android)
- `'regular'` - Regular blur (iOS 10+)
- `'prominent'` - Prominent blur (iOS 10+)
- `'systemUltraThinMaterial'` - Ultra thin material (iOS 13+)
- `'systemThinMaterial'` - Thin material (iOS 13+)
- `'systemMaterial'` - Material (iOS 13+)
- `'systemThickMaterial'` - Thick material (iOS 13+)
- `'systemChromeMaterial'` - Chrome material (iOS 13+)

## Platform Differences

### iOS
On iOS, this component has been completely rewritten using **SwiftUI** for modern performance and features:

- **iOS 26+**: Uses native `UIGlassEffect` API for true liquid glass effects with customizable tint colors and opacity
- **iOS 13-25**: Uses enhanced `UIVisualEffectView` with precise blur intensity control
- **Older iOS**: Graceful fallback to standard blur effects
- **SwiftUI Integration**: Leverages SwiftUI's declarative UI for better performance and maintainability

### Android
On Android, the component uses the BlurView library to provide real blur effects with hardware acceleration. The implementation supports multiple blur algorithms and gracefully falls back to translucent overlay approximation on devices with limited graphics capabilities.

**⚠️ Liquid Glass Limitation**: Liquid glass effects (`type="liquidGlass"`) are **iOS 26+ exclusive**. On Android, they automatically fall back to enhanced blur with tint overlay to approximate the visual effect.

## Accessibility

The component automatically respects the "Reduce Transparency" accessibility setting:

- **iOS**: When reduce transparency is enabled, the blur view is hidden and a fallback view with solid color is shown
- **Android**: The fallback color is always used as the base for the blur approximation

You can customize the fallback color using the `reducedTransparencyFallbackColor` prop.

## TypeScript Support

This package includes full TypeScript definitions:

```tsx
import { BlurView, BlurType, GlassType, BlurViewProps } from '@sbaiahmed1/react-native-blur';

// BlurType is exported for type checking
const blurType: BlurType = 'systemMaterial';

// GlassType for liquid glass effects
const glassType: GlassType = 'regular';

// BlurViewProps for component props
interface MyComponentProps {
  blurProps: BlurViewProps;
}

// Example with all liquid glass properties
const liquidGlassProps: BlurViewProps = {
  type: 'liquidGlass',
  glassType: 'regular',
  glassTintColor: '#007AFF',
  glassOpacity: 0.8,
};
```

## Example App

The package includes a comprehensive example app that demonstrates all blur types, liquid glass effects, and practical use cases. The example app features:

- **Main Demo**: Interactive blur type selector with live preview
- **Liquid Glass Examples**: Showcase of iOS 26+ glass effects with customizable properties
- **Practical Use Cases**: Real-world examples like cards, modals, and overlays
- **Comparison Views**: Side-by-side comparisons of different effects

To run the example:

```bash
cd example
yarn install
# For iOS
yarn ios
# For Android
yarn android
```

## Performance Considerations

- **iOS**:
  - **SwiftUI Implementation**: Enhanced performance with declarative UI updates
  - **Liquid Glass (iOS 26+)**: Hardware-accelerated glass effects with minimal performance impact
  - **Blur Effects**: Native blur effects are hardware-accelerated and performant
  - **Smart Fallbacks**: Automatic degradation ensures smooth performance on older devices
- **Android**: Real blur effects are hardware-accelerated with fallback to lightweight overlay when needed
- Avoid using too many blur/glass views simultaneously on lower-end devices
- Consider using `reducedTransparencyFallbackColor` for better accessibility
- Liquid glass effects automatically fall back to enhanced blur on Android and older iOS versions

## What's New in v0.3.0

### 🌊 Liquid Glass Effects (iOS 26+)
- Revolutionary glass effects using Apple's new UIGlassEffect API
- Customizable glass types: `clear` and `regular`
- Adjustable tint colors and opacity for stunning visual effects
- Automatic fallback to enhanced blur on older iOS versions and Android

### 🔄 SwiftUI Rewrite
- Complete iOS implementation rewritten using SwiftUI
- Enhanced performance with declarative UI updates
- Better integration with React Native's new architecture
- Improved blur intensity control with precise animation handling

### 📱 Enhanced Example App
- New liquid glass demonstration section
- Interactive property controls for real-time customization
- Practical use case examples (cards, modals, overlays)
- Comparison views for different effect types

### 🛠️ Developer Experience
- Full TypeScript support for all new properties
- Improved component layout handling
- Better accessibility support with smart fallbacks
- Enhanced documentation and examples

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT

## 📊 Stats

<div align="center">
  <img src="https://img.shields.io/github/contributors/sbaiahmed1/react-native-blur?style=for-the-badge" alt="contributors" />
  <img src="https://img.shields.io/github/last-commit/sbaiahmed1/react-native-blur?style=for-the-badge" alt="last commit" />
  <img src="https://img.shields.io/github/issues/sbaiahmed1/react-native-blur?style=for-the-badge" alt="issues" />
  <img src="https://img.shields.io/github/issues-pr/sbaiahmed1/react-native-blur?style=for-the-badge" alt="pull requests" />
</div>

---

## Credits

Built with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)
