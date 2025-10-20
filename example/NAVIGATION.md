# React Native Blur - Example App with Navigation

This example app demonstrates the React Native Blur library with a complete navigation setup using React Navigation.

## Features

### Navigation Structure

The app uses **React Navigation** with a native stack navigator:

- **Home Screen** - Main landing page with menu navigation
- **Blur Demo** - Interactive blur type and intensity controls
- **Liquid Glass** - iOS-specific liquid glass effects showcase
- **Cards** - Various blurred card designs
- **Gallery** - Image gallery with blurred overlays

### Screens Overview

#### 1. Home Screen (`HomeScreen.tsx`)
- Hero card with blur effect
- Quick navigation menu to all sections
- Background image cycling
- Glass morphism menu items

#### 2. Blur Demo (`BlurDemoScreen.tsx`)
- Interactive blur amount slider
- All blur type options (xlight, light, dark, extraDark, etc.)
- Live preview card
- Real-time blur adjustments

#### 3. Liquid Glass (`LiquidGlassScreen.tsx`)
- iOS 26+ liquid glass effects
- Multiple tint color examples
- Opacity variations
- Automatic fallback for older iOS versions

#### 4. Cards (`CardsScreen.tsx`)
- Different blur types as card backgrounds
- Variable intensity demonstrations
- Practical UI component examples
- Button interactions with blur

#### 5. Gallery (`GalleryScreen.tsx`)
- Horizontal scrolling image gallery
- Grid layout with blur overlays
- Mixed blur types
- Caption overlays with blur

## Running the App

### iOS
```bash
cd example
yarn ios
```

### Android
```bash
cd example
yarn android
```

## Key Concepts Demonstrated

### 1. TargetView Usage
Each screen uses `TargetView` with id="background" to enable real blur on Android:

```tsx
<TargetView id="background" style={styles.blurTarget}>
  <Image source={{ uri: imageUrl }} style={styles.backgroundImage} />
</TargetView>
```

### 2. BlurView with targetId
All blur components reference the TargetView:

```tsx
<BlurView
  targetId="background"
  blurType="light"
  blurAmount={20}
  style={StyleSheet.absoluteFill}
/>
```

### 3. Liquid Glass (iOS Only)
```tsx
<BlurView
  targetId="background"
  type="liquidGlass"
  glassTintColor="#4A90E2"
  glassOpacity={0.4}
  blurAmount={25}
/>
```

### 4. Navigation Setup
The app uses `@react-navigation/native` and `@react-navigation/native-stack`:

```tsx
// navigation/RootNavigator.tsx
<Stack.Navigator>
  <Stack.Screen name="Home" component={HomeScreen} />
  <Stack.Screen name="BlurDemo" component={BlurDemoScreen} />
  // ... other screens
</Stack.Navigator>
```

## File Structure

```
example/src/
├── App.tsx                        # Main app entry point
├── navigation/
│   ├── RootNavigator.tsx         # Navigation setup
│   └── types.ts                  # Navigation types
├── screens/
│   ├── HomeScreen.tsx            # Home/landing page
│   ├── BlurDemoScreen.tsx        # Blur controls
│   ├── LiquidGlassScreen.tsx     # iOS glass effects
│   ├── CardsScreen.tsx           # Card examples
│   ├── GalleryScreen.tsx         # Gallery examples
│   └── index.ts                  # Screen exports
├── components/                    # Reusable components
└── constants/                     # App constants
```

## Dependencies

- `@react-navigation/native` - Navigation container
- `@react-navigation/native-stack` - Native stack navigator
- `react-native-screens` - Native navigation primitives
- `react-native-safe-area-context` - Safe area handling

## Learn More

For more information about the blur library, see the main [README](../README.md).
