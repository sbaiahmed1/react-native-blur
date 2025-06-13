# @sbaiahmed1/react-native-blur

A modern React Native blur view component that provides native blur effects for both iOS and Android platforms.

## Features

- 🎨 **Multiple Blur Types**: Support for various blur styles including system materials on iOS
- 📱 **Cross-Platform**: Works on both iOS and Android
- ♿ **Accessibility**: Automatic fallback for reduced transparency settings
- 🔧 **TypeScript**: Full TypeScript support with proper type definitions
- 🚀 **Turbo Module**: Built with React Native's new architecture (Fabric)
- 🎯 **Customizable**: Adjustable blur intensity and fallback colors

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

No additional setup required for Android.

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
On Android, the component provides a translucent overlay approximation of blur effects. While not a true blur, it provides a similar visual effect that's consistent across different Android versions.

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
- **Android**: The translucent overlay is lightweight but not a true blur
- Avoid using too many blur views simultaneously on lower-end devices
- Consider using `reducedTransparencyFallbackColor` for better accessibility

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT

## Credits

Built with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)
