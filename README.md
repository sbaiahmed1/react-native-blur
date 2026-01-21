# @sbaiahmed1/react-native-blur

A modern React Native library providing **six specialized components** for advanced visual effects: `BlurView` for native blur effects, `VibrancyView` for iOS vibrancy effects, `LiquidGlassView` for cutting-edge liquid glass effects on iOS 26+ (with Android fallback to enhanced blur), `LiquidGlassContainer` for iOS 26+ glass container effects with configurable spacing, `ProgressiveBlurView` for smooth, variable blur transitions, and `BlurSwitch` for beautiful blur switch buttons on Android.

> **⚠️ Breaking Changes**: If upgrading from 3.x, see [Breaking Changes](#️-breaking-changes-in-v400) section.

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
  <br>
  <a href="demos/vibrancy_iOS.mp4">
    <img src="https://img.shields.io/badge/▶️_Watch-Vibrancy_Demo-blue?style=for-the-badge" alt="Vibrancy Demo" />
  </a>
  <br>
  <em>Vibrancy Effect (iOS only) - Click badge to watch video</em>
  <br>
  <br>
  <a href="demos/Progressive-Blur-iOS.mp4">
    <img src="https://img.shields.io/badge/▶️_Watch-Progressive_Blur_iOS-purple?style=for-the-badge" alt="Progressive Blur iOS" />
  </a>
  <a href="demos/Progressive-Blur-Android.mp4">
    <img src="https://img.shields.io/badge/▶️_Watch-Progressive_Blur_Android-green?style=for-the-badge" alt="Progressive Blur Android" />
  </a>
  <br>
  <em>Progressive Blur Effect (iOS & Android) - Click badges to watch videos</em>
  <br>
  <br>
  <em>Liquid Glass effect in action (iOS 26+ only)</em>
  <br>
  <strong>⚠️ Android automatically falls back to enhanced blur with tint overlay</strong>
</div>

## Requirements

| Platform                  | Minimum Version                        |
| ------------------------- | -------------------------------------- |
| **iOS**                   | iOS 13.0+                              |
| **Xcode**                 | Xcode 26.0+ (for liquid glass support) |
| **React Native**          | 0.68+ (New Architecture)               |
| **Android**               | API 24+ (Android 7.0)                  |
| **Android Gradle Plugin** | 8.9.1+                                 |

> ⚠️ **Note**: LiquidGlassView requires Xcode 26.0+ and iOS 26+ for full glass effects. The component automatically falls back to enhanced blur on older versions.

## ⚠️ Breaking Changes in v4.0.0

> **Important**: Version 4.0.0 introduces significant API changes. If you're upgrading from 3.x, please read this section carefully.

### What Changed

In version 3.x, we had a **single `BlurView` component** with a `type` prop that switched between blur and liquid glass modes:

```tsx
// ❌ Old API (v3.x) - DEPRECATED
<BlurView
  type="blur" // or "liquidGlass"
  blurType="light"
  blurAmount={10}
  glassType="regular" // Mixed blur and glass props
  glassTintColor="#007AFF"
/>
```

In version 4.0.0, we've **separated concerns** into **two dedicated components** for better architecture and cleaner APIs:

```tsx
// ✅ New API (v4.0.0) - Current
import { BlurView, LiquidGlassView } from '@sbaiahmed1/react-native-blur';

// For blur effects
<BlurView
  blurType="light"
  blurAmount={10}
/>

// For liquid glass effects (iOS 26+)
<LiquidGlassView
  glassType="regular"
  glassTintColor="#007AFF"
  glassOpacity={0.8}
/>
```

### Migration from 3.x to 4.0.0

**If you were using blur mode:**

```tsx
// Before (3.x)
<BlurView type="blur" blurType="light" blurAmount={10} />

// After (4.0.0)
<BlurView blurType="light" blurAmount={10} />
```

**If you were using liquid glass mode:**

```tsx
// Before (3.x)
<BlurView
  type="liquidGlass"
  glassType="regular"
  glassTintColor="#007AFF"
  glassOpacity={0.8}
/>;

// After (4.0.0)
import { LiquidGlassView } from '@sbaiahmed1/react-native-blur';

<LiquidGlassView
  glassType="regular"
  glassTintColor="#007AFF"
  glassOpacity={0.8}
/>;
```

### Why This Change?

- **🎯 Cleaner APIs**: Each component now has focused props relevant to its purpose
- **📦 Better Tree-Shaking**: Import only what you need
- **🔧 Type Safety**: Separate TypeScript definitions prevent mixing incompatible props
- **🏗️ Better Architecture**: Separation of concerns following React best practices
- **📖 Clearer Code**: More explicit about which effect you're using

### Summary

- **v3.x**: Single `BlurView` component with `type` prop (blur or liquidGlass)
- **v4.0.0**: Two components - `BlurView` for blur, `LiquidGlassView` for glass effects
- **Action Required**: Update imports and split your components based on the effect type you need

## Features

- ✨ **Five Specialized Components**:
  - `BlurView` - Dedicated blur effects component with multiple blur types
  - `ProgressiveBlurView` - Variable/gradient blur transitions (iOS & Android)
  - `LiquidGlassView` - Separate component for iOS 26+ liquid glass effects
  - `LiquidGlassContainer` - iOS 26+ glass container with configurable spacing for grouping glass elements
  - `BlurSwitch` - Beautiful blur switch button using QmBlurView (Android)
- �🌊 **Liquid Glass Effects**: Revolutionary glass effects using iOS 26+ UIGlassEffect API
- 🎨 **Multiple Blur Types**: Support for various blur styles including system materials on iOS
- 📱 **Cross-Platform**: Works on both iOS and Android
- ♿ **Accessibility**: Automatic fallback for reduced transparency settings
- 🔧 **TypeScript**: Full TypeScript support with proper type definitions for all components
- 🚀 **Turbo Module**: Built with React Native's new architecture (Fabric)
- 🎯 **Customizable**: Adjustable blur intensity, glass tint colors, and opacity
- 💡 **Performance Optimized**: Uses hardware acceleration for smooth rendering
- 🛠️ **Easy to Use**: Simple, focused APIs for each effect type
- 📦 **Modern**: Uses SwiftUI for iOS and Kotlin for Android, ensuring cutting-edge development practices
- 🔄 **Smart Fallbacks**: Graceful degradation from liquid glass to blur on older iOS versions

## Comparison with Other Libraries

### Key Advantages

- **Five Specialized Components**: Separate `BlurView`, `LiquidGlassView`, `LiquidGlassContainer`, `ProgressiveBlurView`, and `BlurSwitch` components for clean architecture
- **Liquid Glass Effects**: Only library with iOS 26+ UIGlassEffect and UIGlassContainerEffect support
- **Real Android Blur**: Hardware-accelerated blur on Android (not overlay)
- **New Architecture**: Built for Fabric/Turbo Modules
- **Modern Stack**: SwiftUI for iOS, Kotlin for Android
- **Full TypeScript**: Complete type definitions for all components

### vs. @react-native-community/blur

- ✅ Dedicated components vs single component with mode switching
- ✅ Liquid glass effects (iOS 26+)
- ✅ Better new architecture support
- ✅ Separate prop types for each component

### vs. expo-blur

- ✅ No Expo dependency required
- ✅ Real Android blur (not experimental)
- ✅ Works with bare React Native projects
- ✅ Liquid glass effects support

## Migration Guide

### From @react-native-community/blur

```tsx
// Before
import { BlurView } from '@react-native-community/blur';

// After - same API, now with dedicated components
import { BlurView, LiquidGlassView } from '@sbaiahmed1/react-native-blur';

// Use BlurView for standard blur
<BlurView blurType="light" blurAmount={10} />

// Or LiquidGlassView for glass effects (iOS 26+)
<LiquidGlassView glassType="regular" glassTintColor="#007AFF" glassOpacity={0.8} />
```

### From expo-blur

```tsx
// Before
import { BlurView } from 'expo-blur';
<BlurView intensity={50} tint="light" />;

// After
import { BlurView } from '@sbaiahmed1/react-native-blur';
<BlurView blurAmount={50} blurType="light" />;
```

**Migration Steps:**

1. Uninstall old library: `npm uninstall @react-native-community/blur expo-blur`
2. Install: `npm install @sbaiahmed1/react-native-blur`
3. Update imports
4. Run `cd ios && pod install`

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

The library uses native Android blur with automatic platform detection. No additional configuration required beyond ensuring minimum requirements:

- **Min SDK:** API 24 (Android 7.0)
- **Android Gradle Plugin:** 8.9.1+

> ⚠️ **AGP Requirement**: Requires Android Gradle Plugin **8.9.1 or newer**. Check `android/build.gradle`:
>
> ```gradle
> classpath "com.android.tools.build:gradle:8.9.1" // or higher
> ```

> 📦 **Dependency**: The library uses [QmBlurView](https://github.com/QmDeve/QmBlurView) from Maven Central:
>
> ```gradle
> implementation 'com.qmdeve.blurview:core:1.1.3'
> ```

The implementation automatically handles different Android versions:

- Android 12+: Uses `RenderEffectBlur`
- Android 10-11: Falls back to `RenderScriptBlur`
- Older versions: Lightweight overlay fallback

## Usage

The library now provides **six specialized components** for different visual effects:

### BlurView - Standard Blur Effects

Use `BlurView` for standard blur effects across all platforms:

#### Basic Usage

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

#### Advanced Blur Usage

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

### ProgressiveBlurView - Variable/Gradient Blur

NOTE: Progressive blur offset works different between android and iOS

Use `ProgressiveBlurView` for smooth, gradient blur transitions. This component works on both **iOS** and **Android**.

```tsx
import React from 'react';
import { ProgressiveBlurView } from '@sbaiahmed1/react-native-blur';

function GradientBlurComponent() {
  return (
    <ProgressiveBlurView
      blurType="light"
      blurAmount={30}
      direction="blurredTopClearBottom"
      startOffset={0}
      style={{ height: 200 }}
    >
      <Text>Progressive blur from top (blurred) to bottom (clear)</Text>
    </ProgressiveBlurView>
  );
}
```

#### Center Blur (new direction)

`direction="blurredCenterClearTopAndBottom"` creates a long blur body that peaks in the center and fades to clear at both edges.

```tsx
<ProgressiveBlurView
  blurType="regular"
  blurAmount={35}
  direction="blurredCenterClearTopAndBottom"
  startOffset={0} // keep 0 for longest blur body; raise toward 0.3 to shorten
  style={{ height: 220, borderRadius: 16 }}
>
  <Text>Clear at top</Text>
  <Text>Blurred at center</Text>
  <Text>Clear at bottom</Text>
</ProgressiveBlurView>
```

Tips:
- `startOffset` shifts where the blur plateau begins; 0 = longest body, higher = shorter.
- `blurAmount` controls peak intensity; center direction balances strength per platform.
- Works on iOS and Android with matching props.

#### Locked Content Example

Perfect for paywall/premium content:

```tsx
<View style={{ position: 'relative' }}>
  <Text>Long content here...</Text>

  {/* Progressive blur overlay */}
  <ProgressiveBlurView
    blurType="light"
    blurAmount={20}
    direction="blurredBottomClearTop"
    startOffset={0.2}
    style={{
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: 200,
    }}
  >
    <Text>🔒 Unlock to Read More</Text>
    <Button title="Purchase" />
  </ProgressiveBlurView>
</View>
```

### LiquidGlassView - Liquid Glass Effects (iOS 26+)

Use `LiquidGlassView` for cutting-edge liquid glass effects. **Note:** This component automatically falls back to enhanced blur on Android and older iOS versions.

```tsx
import React from 'react';
import { LiquidGlassView } from '@sbaiahmed1/react-native-blur';

function LiquidGlassComponent() {
  return (
    <LiquidGlassView
      glassType="regular"
      glassTintColor="#007AFF"
      glassOpacity={0.8}
      style={{
        padding: 20,
        borderRadius: 20,
      }}
    >
      <Text>Beautiful liquid glass effect</Text>
    </LiquidGlassView>
  );
}
```

#### Interactive Liquid Glass

```tsx
import React from 'react';
import { LiquidGlassView } from '@sbaiahmed1/react-native-blur';

function InteractiveGlass() {
  return (
    <LiquidGlassView
      glassType="regular"
      glassTintColor="#007AFF"
      glassOpacity={0.9}
      isInteractive={true} // Enables touch interaction (iOS 26+ only)
      ignoreSafeArea={false}
      style={{
        flex: 1,
        padding: 30,
      }}
    >
      <Text>Interactive liquid glass that responds to touch</Text>
    </LiquidGlassView>
  );
}
```

### LiquidGlassContainer - Glass Container Effects (iOS 26+)

Use `LiquidGlassContainer` to create a glass container with configurable spacing between glass elements. This component uses iOS 26+ `UIGlassContainerEffect` to create beautiful grouped glass effects.

**Note:** This component automatically falls back to a regular View on Android and older iOS versions.

#### Basic Usage

```tsx
import React from 'react';
import {
  LiquidGlassContainer,
  LiquidGlassView,
} from '@sbaiahmed1/react-native-blur';

function GlassContainerExample() {
  return (
    <LiquidGlassContainer spacing={20} style={{ flex: 1 }}>
      <LiquidGlassView
        glassType="clear"
        glassTintColor="#000000"
        glassOpacity={0.3}
        style={{ width: 120, height: 120, borderRadius: 60 }}
      >
        <Text>Circle 1</Text>
      </LiquidGlassView>
      <LiquidGlassView
        glassType="clear"
        glassTintColor="#000000"
        glassOpacity={0.3}
        style={{ width: 120, height: 120, borderRadius: 60 }}
      >
        <Text>Circle 2</Text>
      </LiquidGlassView>
    </LiquidGlassContainer>
  );
}
```

#### Animated Glass Container

```tsx
import React, { useRef } from 'react';
import { Animated } from 'react-native';
import {
  LiquidGlassContainer,
  LiquidGlassView,
} from '@sbaiahmed1/react-native-blur';

function AnimatedGlassContainer() {
  const translateX = useRef(new Animated.Value(0)).current;

  const animateElements = () => {
    Animated.sequence([
      Animated.timing(translateX, {
        toValue: -50,
        duration: 2000,
        useNativeDriver: true,
      }),
      Animated.timing(translateX, {
        toValue: 30,
        duration: 2000,
        useNativeDriver: true,
      }),
    ]).start();
  };

  return (
    <LiquidGlassContainer spacing={30} style={{ flexDirection: 'row' }}>
      <LiquidGlassView
        glassType="clear"
        style={{ width: 100, height: 100, borderRadius: 50 }}
      >
        <Text>Static</Text>
      </LiquidGlassView>
      <Animated.View style={{ transform: [{ translateX }] }}>
        <LiquidGlassView
          glassType="clear"
          style={{ width: 100, height: 100, borderRadius: 50 }}
        >
          <Text>Animated</Text>
        </LiquidGlassView>
      </Animated.View>
    </LiquidGlassContainer>
  );
}
```

### BlurSwitch - Blur Switch Button (Android)

Use `BlurSwitch` for beautiful switch buttons with blur effects. On Android, this uses QmBlurView's `BlurSwitchButtonView`. On iOS, it falls back to the native `Switch` component.

> **Note**: On Android, you only need to set the base color (`trackColor.true`), and QmBlurView will automatically calculate the colors for on/off states. The `thumbColor` and `trackColor.false` props are only supported on iOS.

#### Basic Usage

```tsx
import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { BlurSwitch } from '@sbaiahmed1/react-native-blur';

function BlurSwitchExample() {
  const [isEnabled, setIsEnabled] = useState(false);

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <Text>Enable Feature</Text>
      <BlurSwitch
        value={isEnabled}
        onValueChange={setIsEnabled}
        blurAmount={20}
        trackColor={{ true: '#34C759' }}
      />
    </View>
  );
}
```

#### With Custom Colors

```tsx
import React, { useState } from 'react';
import { BlurSwitch } from '@sbaiahmed1/react-native-blur';

function CustomBlurSwitch() {
  const [darkMode, setDarkMode] = useState(false);

  return (
    <BlurSwitch
      value={darkMode}
      onValueChange={setDarkMode}
      blurAmount={15}
      trackColor={{ true: '#8B5CF6' }} // Purple when on
      disabled={false}
    />
  );
}
```

#### Disabled State

```tsx
<BlurSwitch
  value={true}
  onValueChange={() => {}}
  blurAmount={20}
  trackColor={{ true: '#10B981' }}
  disabled={true} // Prevents user interaction, maintains current value
/>
```

## Props

The library now provides five separate components with their own props:

### BlurView Props

All props are optional and have sensible defaults.

| Prop                               | Type         | Default     | Description                                                                   |
| ---------------------------------- | ------------ | ----------- | ----------------------------------------------------------------------------- |
| `blurType`                         | `BlurType`   | `'xlight'`  | The type of blur effect to apply                                              |
| `blurAmount`                       | `number`     | `10.0`      | The intensity of the blur effect (0-100)                                      |
| `ignoreSafeArea`                   | `boolean`    | `false`     | (iOS only) Controls whether the blur effect should ignore all safe area edges |
| `reducedTransparencyFallbackColor` | `string`     | `'#FFFFFF'` | Fallback color when reduced transparency is enabled                           |
| `overlayColor`                     | `ColorValue` | `undefined` | The overlay color to apply on top of the blur effect                          |
| `style`                            | `ViewStyle`  | `undefined` | Style object for the blur view                                                |
| `children`                         | `ReactNode`  | `undefined` | Child components to render inside the blur view                               |

### VibrancyView Props

All props are optional and have sensible defaults.

| Prop         | Type         | Default     | Description                                     |
| ------------ | ------------ | ----------- | ----------------------------------------------- |
| `blurType`   | `BlurType`   | `'xlight'`  | The type of blur/vibrancy effect to apply       |
| `blurAmount` | `number`     | `10.0`      | The intensity of the blur effect (0-100)        |
| `style`      | `ViewStyle`  | `undefined` | Style object for the vibrancy view              |
| `children`   | `ReactNode`  | `undefined` | Child components to render inside the vibrancy view |

### ProgressiveBlurView Props

All props are optional and have sensible defaults.

| Prop                               | Type                                                 | Default                   | Description                                          |
| ---------------------------------- | ---------------------------------------------------- | ------------------------- | ---------------------------------------------------- |
| `blurType`                         | `BlurType`                                           | `'regular'`               | The type of blur effect to apply                     |
| `blurAmount`                       | `number`                                             | `20.0`                    | Maximum blur radius in pixels                        |
| `direction`                        | `'blurredTopClearBottom' \| 'blurredBottomClearTop' \| 'blurredCenterClearTopAndBottom'` | `'blurredTopClearBottom'` | Direction of the blur gradient                       |
| `startOffset`                      | `number`                                             | `0.0`                     | Where the gradient starts (0.0 to 1.0)               |
| `reducedTransparencyFallbackColor` | `string`                                             | `'#FFFFFF'`               | Fallback color when reduced transparency is enabled  |
| `overlayColor`                     | `ColorValue`                                         | `undefined`               | The overlay color to apply on top of the blur effect |
| `style`                            | `ViewStyle`                                          | `undefined`               | Style object for the blur view                       |
| `children`                         | `ReactNode`                                          | `undefined`               | Child components to render inside the blur view      |

> **Platform Note**: `ProgressiveBlurView` works on both **iOS** and **Android**.
>
> - **iOS**: Uses private Core Animation filters for variable blur effects
> - **Android**: Extends QMBlur's BlurView with custom gradient masking to create progressive blur effect

### LiquidGlassView Props

All props are optional and have sensible defaults.

| Prop                               | Type        | Default     | Description                                                                                |
| ---------------------------------- | ----------- | ----------- | ------------------------------------------------------------------------------------------ |
| `glassType`                        | `GlassType` | `'clear'`   | The type of glass effect (iOS 26+ only)                                                    |
| `glassTintColor`                   | `string`    | `'clear'`   | The tint color for glass effect. Accepts hex colors or color names                         |
| `glassOpacity`                     | `number`    | `1.0`       | The opacity of glass effect (0-1)                                                          |
| `isInteractive`                    | `boolean`   | `true`      | (iOS 26+ only) Controls whether the liquid glass effect is interactive and reacts to touch |
| `ignoreSafeArea`                   | `boolean`   | `false`     | (iOS only) Controls whether the glass effect should ignore all safe area edges             |
| `reducedTransparencyFallbackColor` | `string`    | `'#FFFFFF'` | Fallback color when reduced transparency is enabled or on older iOS versions               |
| `style`                            | `ViewStyle` | `undefined` | Style object for the glass view                                                            |
| `children`                         | `ReactNode` | `undefined` | Child components to render inside the glass view                                           |

### LiquidGlassContainer Props

All props are optional and have sensible defaults.

| Prop       | Type        | Default     | Description                                                                                    |
| ---------- | ----------- | ----------- | ---------------------------------------------------------------------------------------------- |
| `spacing`  | `number`    | `0`         | (iOS 26+ only) The spacing value between glass elements in the container                       |
| `style`    | `ViewStyle` | `undefined` | Style object for the glass container                                                           |
| `children` | `ReactNode` | `undefined` | Child components to render inside the glass container (typically `LiquidGlassView` components) |

### BlurSwitch Props

All props are optional and have sensible defaults.

| Prop           | Type                                      | Default                                   | Description                                                                                                                    |
| -------------- | ----------------------------------------- | ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `value`        | `boolean`                                 | `false`                                   | The current value of the switch                                                                                                |
| `onValueChange`| `(value: boolean) => void`                | `undefined`                               | Callback invoked when the switch value changes                                                                                 |
| `blurAmount`   | `number`                                  | `10`                                      | (Android only) The intensity of the blur effect (0-100)                                                                        |
| `thumbColor`   | `ColorValue`                              | `'#FFFFFF'`                               | (iOS only) The color of the switch thumb                                                                                       |
| `trackColor`   | `{ false?: ColorValue; true?: ColorValue }`| `{ false: '#E5E5EA', true: '#34C759' }`  | Track colors. On Android, only `true` is used - QmBlurView auto-calculates on/off colors from base color                      |
| `disabled`     | `boolean`                                 | `false`                                   | Whether the switch is disabled (prevents interaction but maintains current value)                                              |
| `style`        | `ViewStyle`                               | `undefined`                               | Style object for the switch view                                                                                               |

> **Note**: The `BlurType` and `GlassType` are exported types from the library. See [Blur Types](#blur-types) and [Glass Types](#glass-types) sections below for all available values.

> **Platform Note**: `LiquidGlassView` automatically falls back to `BlurView` on Android and iOS versions older than iOS 26.

> **Platform Note**: `LiquidGlassContainer` automatically falls back to a regular `View` on Android and iOS versions older than iOS 26.

## Blur Types (BlurView)

The following blur types are supported for `BlurView`:

- `'light'` - Light blur effect
- `'dark'` - Dark blur effect
- `'xlight'` - Extra light blur effect
- `'extraDark'` - Extra dark blur effect
- `'regular'` - Regular blur (iOS 10+)
- `'prominent'` - Prominent blur (iOS 10+)
- `'systemUltraThinMaterial'` - Ultra thin material (iOS 13+)
- `'systemThinMaterial'` - Thin material (iOS 13+)
- `'systemMaterial'` - Material (iOS 13+)
- `'systemThickMaterial'` - Thick material (iOS 13+)
- `'systemChromeMaterial'` - Chrome material (iOS 13+)
- `'systemUltraThinMaterialLight'` - Ultra thin light material (iOS 13+)
- `'systemThinMaterialLight'` - Thin light material (iOS 13+)
- `'systemMaterialLight'` - Light material (iOS 13+)
- `'systemThickMaterialLight'` - Thick light material (iOS 13+)
- `'systemChromeMaterialLight'` - Chrome light material (iOS 13+)
- `'systemUltraThinMaterialDark'` - Ultra thin dark material (iOS 13+)
- `'systemThinMaterialDark'` - Thin dark material (iOS 13+)
- `'systemMaterialDark'` - Dark material (iOS 13+)
- `'systemThickMaterialDark'` - Thick dark material (iOS 13+)
- `'systemChromeMaterialDark'` - Chrome dark material (iOS 13+)

## Glass Types (LiquidGlassView)

The following glass types are supported for `LiquidGlassView` on iOS 26+:

- `'clear'` - Clear glass effect (default)
- `'regular'` - Regular glass effect with more pronounced appearance

> **Note**: On Android and iOS versions older than iOS 26, `LiquidGlassView` automatically falls back to an enhanced blur effect that approximates the glass appearance.

## Platform Differences

### iOS

Both components have been completely rewritten using **SwiftUI** for modern performance and features:

#### BlurView

- **iOS 13+**: Uses native `UIVisualEffectView` with precise blur intensity control
- **Older iOS**: Graceful fallback to standard blur effects
- **SwiftUI Integration**: Leverages SwiftUI's declarative UI for better performance and maintainability

#### VibrancyView

- **iOS**: Uses native `UIVibrancyEffect` to create vibrant content that shines through the blur
- **Integration**: Works seamlessly with `UIVisualEffectView` hierarchies

#### LiquidGlassView

- **iOS 26+**: Uses native `UIGlassEffect` API for true liquid glass effects with customizable tint colors and opacity
- **iOS < 26**: Automatically falls back to `BlurView` with enhanced blur effects
- **SwiftUI Implementation**: Full hardware-accelerated glass effects with interactive touch support

### Android

#### BlurView

The component uses the QmBlurView library to provide real blur effects with hardware acceleration. The implementation supports multiple blur algorithms and gracefully falls back to translucent overlay approximation on devices with limited graphics capabilities.

#### L+ssibility

All components automatically respect the "Reduce Transparency" accessibility setting:

### BlurView

- **iOS**: When reduce transparency is enabled, the blur view is hidden and a fallback view with solid color is shown
- **Android**: The fallback color is always used as the base for the blur approximation

### LiquidGlassView

- **iOS 26+**: When reduce transparency is enabled, the liquid glass effect is hidden and a fallback view with solid color is shown
- **iOS < 26 & Android**: Automatically falls back to `BlurView` behavior

### LiquidGlassContainer

- **iOS 26+**: When reduce transparency is enabled, falls back to regular View
- **iOS < 26 & Android**: Always renders as regular View

You can customize the fallback color using the `reducedTransparencyFallbackColor` prop on `BlurView` and `LiquidGlassView` components.

## TypeScript Support

This package includes full TypeScript definitions for all components:

```tsx
import {
  BlurView,
  LiquidGlassView,
  LiquidGlassContainer,
  ProgressiveBlurView,
  BlurView,
  VibrancySwitch,
  BlurType,
  GlassType,
  BlurViewProps,
  LiquidGlassViewProps,
  LiquidGlassContainerProps,
  ProgressiveBlurViewProps,
  BlurViewProps,
  VibrancySwitchProps,
} from '@sbaiahmed1/react-native-blur';

// BlurType is exported for type checking
const blurType: BlurType = 'systemMaterial';

// GlassType for liquid glass effects
const glassType: GlassType = 'regular';

// BlurViewProps for component props
interface MyBlurComponentProps {
  blurProps: BlurViewProps;
}

// VibrancyViewProps for vibrancy component props
interface MyVibrancyComponentProps {
  vibrancyProps: VibrancyViewProps;
}

// LiquidGlassViewProps for glass component props
interface MyGlassComponentProps {
  glassProps: LiquidGlassViewProps;
}

// LiquidGlassContainerProps for glass container props
interface MyGlassContainerProps {
  containerProps: LiquidGlassContainerProps;
}

// Example with BlurView properties
const blurProps: BlurViewProps = {
  blurType: 'systemMaterial',
  blurAmount: 50,
  reducedTransparencyFallbackColor: '#FFFFFF',
  overlayColor: '#FF000040',
};

// Example with LiquidGlassView properties
const liquidGlassProps: LiquidGlassViewProps = {
  glassType: 'regular',
  glassTintColor: '#007AFF',
  glassOpacity: 0.8,
  isInteractive: true,
};

// Example with LiquidGlassContainer properties
const liquidGlassContainerProps: LiquidGlassContainerProps = {
  spacing: 20,
};

// Example with BlurSwitch properties
const blurSwitchProps: BlurSwitchProps = {
  value: true,
  onValueChange: (value) => console.log(value),
  blurAmount: 20,
  trackColor: { true: '#34C759' },
  disabled: false,
};
```

## Example App

The package includes a comprehensive example app that demonstrates all components with all their features. The example app features:

- **BlurView Demo**: Interactive blur type selector with live preview of all blur types
- **LiquidGlassView Demo**: Showcase of iOS 26+ glass effects with customizable properties
- **LiquidGlassContainer Demo**: Interactive demonstrations of glass container spacing with animated examples
- **ProgressiveBlurView Demo**: Variable blur gradient examples for different use cases
- **BlurSwitch Demo**: Blur switch buttons with various color configurations
- **Practical Use Cases**: Real-world examples like cards, modals, and overlays using all components
- **Comparison Views**: Side-by-side comparisons between different effect types
- **Platform Fallbacks**: Visual demonstrations of how effects degrade gracefully on older platforms

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

### BlurView

- **iOS**:
  - **SwiftUI Implementation**: Enhanced performance with declarative UI updates
  - **Native Blur Effects**: Hardware-accelerated `UIVisualEffectView` for performant rendering
  - **Precise Control**: Adjustable blur intensity with smooth animations
- **Android**:
  - Real blur effects are hardware-accelerated with QmBlurView
  - Fallback to lightweight overlay when needed on limited devices

### LiquidGlassView

- **iOS 26+**:
  - **Hardware-Accelerated Glass**: Native `UIGlassEffect` API with minimal performance impact
  - **Interactive Effects**: Smooth touch interactions without performance degradation
  - **SwiftUI Powered**: Optimized declarative UI updates
- **iOS < 26 & Android**:
  - Automatic fallback to `BlurView` with enhanced blur effects
  - Same performance characteristics as `BlurView`

### LiquidGlassContainer

- **iOS 26+**:
  - **Native Container Effects**: Uses `UIGlassContainerEffect` API for efficient glass grouping
  - **Optimized Spacing**: Hardware-accelerated spacing calculations
  - **Animation Ready**: Smooth animations with no performance impact
- **iOS < 26 & Android**:
  - Lightweight View fallback with minimal overhead

### General Tips

- Avoid using too many blur/glass views simultaneously on lower-end devices
- Consider using `reducedTransparencyFallbackColor` for better accessibility
- `LiquidGlassView` and `LiquidGlassContainer` automatically fall back on unsupported platforms
- All components are optimized for React Native's new architecture (Fabric)

## What's New in v4.1.2

### 🌊 LiquidGlassContainer Component (NEW)

- **New Component**: `LiquidGlassContainer` for iOS 26+ glass container effects
- Uses iOS 26+ `UIGlassContainerEffect` API for grouping glass elements
- Configurable spacing between glass elements with the `spacing` prop
- Perfect for creating interactive, grouped glass interfaces
- Automatic fallback to regular View on Android and older iOS versions
- Fully integrated with animated components for dynamic effects

## What's New in v4.0.0

> **⚠️ Breaking Changes**: v4.0.0 introduces a major API redesign. See [Breaking Changes](#️-breaking-changes-in-v400) section above for migration guide.

### 🎯 Component Separation (BREAKING CHANGE)

- **Five Specialized Components**: Split single `BlurView` into dedicated `BlurView`, `LiquidGlassView`, `LiquidGlassContainer`, `ProgressiveBlurView`, and `BlurSwitch` components
- **Removed `type` prop**: No more switching between blur/liquidGlass modes - use the appropriate component instead
- **Cleaner APIs**: Each component has focused props without mixing blur and glass properties
- **Better Architecture**: True separation of concerns following React best practices
- **Improved Type Safety**: Separate TypeScript definitions prevent incompatible prop combinations

### 🌊 Liquid Glass Effects (iOS 26+)

- Revolutionary glass effects using Apple's new UIGlassEffect API
- Dedicated `LiquidGlassView` component for glass-specific effects
- Dedicated `LiquidGlassContainer` component for grouping glass elements with spacing
- Customizable glass types: `clear` and `regular`
- Adjustable tint colors and opacity for stunning visual effects
- Automatic fallback to enhanced blur on older iOS versions and Android

### 🔄 SwiftUI Rewrite

- Complete iOS implementation rewritten using SwiftUI
- Enhanced performance with declarative UI updates
- Better integration with React Native's new architecture
- Improved blur intensity control with precise animation handling

### 📱 Enhanced Example App

- Separate demonstrations for BlurView, LiquidGlassView, LiquidGlassContainer, and ProgressiveBlurView
- Interactive property controls for real-time customization
- Practical use case examples (cards, modals, overlays)
- Comparison views showing different components side by side
- Animated examples demonstrating LiquidGlassContainer spacing effects

### 🛠️ Developer Experience

- Full TypeScript support with separate prop types for each component (`BlurViewProps`, `LiquidGlassViewProps`, `LiquidGlassContainerProps`, `ProgressiveBlurViewProps`, `BlurSwitchProps`)
- Cleaner, more intuitive API design
- Improved component layout handling
- Better accessibility support with smart fallbacks
- Enhanced documentation with breaking changes guide

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

**Progressive Blur Implementation:**

- VariableBlur by [@nikstar](https://github.com/nikstar): https://github.com/nikstar/VariableBlur
- Original concept by [@jtrivedi](https://github.com/jtrivedi): https://github.com/jtrivedi/VariableBlurView

**Android Blur:**

- QMBlur library: https://github.com/QmDeve/QmBlurView

Built with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)
