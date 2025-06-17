# @sbaiahmed1/react-native-blur

A modern React Native blur view component that provides native blur effects for both iOS and Android platforms.
<div align="center">
  <p>
    <img src="https://img.shields.io/npm/v/@sbaiahmed1/react-native-blur?style=for-the-badge&color=blue" alt="npm version" />
    <img src="https://img.shields.io/npm/dm/@sbaiahmed1/react-native-blur?style=for-the-badge&color=green" alt="downloads" />
    <img src="https://img.shields.io/github/license/sbaiahmed1/react-native-blur?style=for-the-badge&color=orange" alt="license" />
    <img src="https://img.shields.io/github/stars/sbaiahmed1/react-native-blur?style=for-the-badge&color=yellow" alt="stars" />
  </p>

  <p>
    <img src="https://img.shields.io/badge/New%20Architecture-Ready-purple?style=for-the-badge" alt="New Architecture" />
  </p>
</div>
## Demo

<div align="center">
  <img src="iOS-demo.gif" alt="iOS Demo" width="300" />
  <img src="android-demo.gif" alt="Android Demo" width="300" />
  <br>
  <em>iOS (left) and Android (right) blur effects in action</em>
</div>

## Features

- 🎨 **Multiple Blur Types**: Support for various blur styles including system materials on iOS
- 📱 **Cross-Platform**: Works on both iOS and Android
- ♿ **Accessibility**: Automatic fallback for reduced transparency settings
- 🔧 **TypeScript**: Full TypeScript support with proper type definitions
- 🚀 **Turbo Module**: Built with React Native's new architecture (Fabric)
- 🎯 **Customizable**: Adjustable blur intensity and fallback colors
- 💡 **Performance Optimized**: Uses hardware acceleration for smooth rendering
- 🛠️ **Easy to Use**: Simple API for quick integration into your React Native projects
- 📦 **Modern**: Uses Kotlin for Android implementation and *will* use Swift for iOS, ensuring modern development practices

## Architecture Compatibility

This library is fully compatible with both React Native architectures:

- ✅ **New Architecture (Fabric)**: Full support with Turbo Modules
- ✅ **Old Architecture (Paper)**: Backward compatibility maintained

Both architectures have been tested and work perfectly without any additional configuration required.

## Installation

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

### Dependencies
The Android implementation uses the [BlurView library by Dimezis](https://github.com/Dimezis/BlurView):
```gradle
implementation 'com.github.Dimezis:BlurView:version-2.0.6'
```

### Implementation Details
The Android implementation leverages the BlurView library to provide real blur effects:

- **Real-time Blur:** Uses `RenderEffectBlur` for hardware-accelerated blur rendering
- **Hardware Acceleration:** Utilizes GPU rendering for optimal performance
- **Multiple Blur Algorithms:** Supports different blur implementations based on device capabilities
- **Performance Optimized:** Efficient blur rendering with minimal impact on app performance
- **Fallback Handling:** Gracefully handles devices with limited graphics capabilities
- **No Extra Permissions:** Does not require additional Android permissions

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

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `blurType` | `BlurType` | `'light'` | The type of blur effect to apply |
| `blurAmount` | `number` | `10` | The intensity of the blur effect (0-100) |
| `reducedTransparencyFallbackColor` | `string` | `undefined` | Fallback color when reduced transparency is enabled |
| `style` | `ViewStyle` | `undefined` | Style object for the blur view |
| `children` | `ReactNode` | `undefined` | Child components to render inside the blur view |

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
On iOS, this component uses `UIVisualEffectView` to provide true blur effects. All blur types are supported with their native implementations.

### Android
On Android, the component uses the BlurView library to provide real blur effects with hardware acceleration. The implementation supports multiple blur algorithms and gracefully falls back to translucent overlay approximation on devices with limited graphics capabilities.

## Accessibility

The component automatically respects the "Reduce Transparency" accessibility setting:

- **iOS**: When reduce transparency is enabled, the blur view is hidden and a fallback view with solid color is shown
- **Android**: The fallback color is always used as the base for the blur approximation

You can customize the fallback color using the `reducedTransparencyFallbackColor` prop.

## TypeScript Support

This package includes full TypeScript definitions:

```tsx
import { BlurView, BlurType, BlurViewProps } from '@sbaiahmed1/react-native-blur';

// BlurType is exported for type checking
const blurType: BlurType = 'systemMaterial';

// BlurViewProps for component props
interface MyComponentProps {
  blurProps: BlurViewProps;
}
```

## Example App

The package includes a comprehensive example app that demonstrates all blur types and features. To run the example:

```bash
cd example
npm install
# For iOS
npx react-native run-ios
# For Android
npx react-native run-android
```

## Performance Considerations

- **iOS**: Native blur effects are hardware-accelerated and performant
- **Android**: Real blur effects are hardware-accelerated with fallback to lightweight overlay when needed
- Avoid using too many blur views simultaneously on lower-end devices
- Consider using `reducedTransparencyFallbackColor` for better accessibility

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT

## Credits

Built with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)
