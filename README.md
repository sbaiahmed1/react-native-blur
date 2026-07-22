# @sbaiahmed1/react-native-blur

Native blur, vibrancy, and iOS 26 liquid-glass effects for React Native — on iOS, Android, and Web. Six focused components: `BlurView`, `ProgressiveBlurView`, `VibrancyView`, `LiquidGlassView`, `LiquidGlassContainer`, and `BlurSwitch`. Built for the New Architecture (Fabric).

<div align="center">
  <p>
    <img src="https://img.shields.io/npm/v/@sbaiahmed1/react-native-blur?style=for-the-badge&color=blue" alt="npm version" />
    <img src="https://img.shields.io/npm/dm/%40sbaiahmed1%2Freact-native-blur?style=for-the-badge" alt="downloads per month" />
    <img src="https://img.shields.io/github/license/sbaiahmed1/react-native-blur?style=for-the-badge&color=orange" alt="license" />
    <img src="https://img.shields.io/github/stars/sbaiahmed1/react-native-blur?style=for-the-badge&color=yellow" alt="stars" />
  </p>
  <p>
    <img src="https://img.shields.io/badge/New%20Architecture-Required-purple?style=for-the-badge" alt="New Architecture" />
    <img src="https://img.shields.io/badge/iOS%2026+-Liquid%20Glass-blue?style=for-the-badge" alt="Liquid Glass" />
  </p>
</div>

## 📖 Documentation

Full documentation, guides, and the complete API reference live on the docs site:

### 👉 https://sbaiahmed1.github.io/react-native-blur/docs

- [Installation & requirements](https://sbaiahmed1.github.io/react-native-blur/docs/installation)
- [BlurView](https://sbaiahmed1.github.io/react-native-blur/docs/blur-view) · [ProgressiveBlurView](https://sbaiahmed1.github.io/react-native-blur/docs/progressive-blur-view) · [VibrancyView](https://sbaiahmed1.github.io/react-native-blur/docs/vibrancy-view)
- [LiquidGlassView](https://sbaiahmed1.github.io/react-native-blur/docs/liquid-glass-view) · [LiquidGlassContainer](https://sbaiahmed1.github.io/react-native-blur/docs/liquid-glass-container) · [BlurSwitch](https://sbaiahmed1.github.io/react-native-blur/docs/blur-switch)
- [Props reference](https://sbaiahmed1.github.io/react-native-blur/docs/props-reference)
- [Migration & breaking changes](https://sbaiahmed1.github.io/react-native-blur/docs/migration)

> ⚠️ **v5 is New Architecture only** (React Native 0.76+) and drops legacy Paper support. See [Migration & breaking changes](https://sbaiahmed1.github.io/react-native-blur/docs/migration).

## Demo

<div align="center">
  <img src="ios-blur-glass-demo.gif" alt="iOS Demo" width="300" />
  <img src="android-blur-glass-demo.gif" alt="Android Demo" width="300" />
  <br>
  <em>iOS (left) and Android (right) blur effects in action</em>
</div>

## Features

- Six focused components for blur, vibrancy, progressive/gradient blur, iOS 26 liquid glass, and a blurred switch.
- True native effects: `UIVisualEffectView` / `UIGlassEffect` on iOS, hardware-accelerated blur on Android.
- Web support out of the box (Expo Web / react-native-web) via CSS `backdrop-filter`, including a real progressive-blur ramp.
- iOS 26 liquid glass with automatic fallback to an enhanced blur on older iOS, Android, and Web.
- New Architecture (Fabric) components with full TypeScript types.

## Requirements

| Platform | Minimum version |
| --- | --- |
| iOS | 13.0+ (Xcode 16; 26.0+ for liquid glass) |
| React Native | 0.76+ (New Architecture required) |
| Android | API 24+, AGP 8.9.1+ |
| Web | react-native-web (blur needs `backdrop-filter`, ~97% browser support) |

## Installation

```sh
yarn add @sbaiahmed1/react-native-blur
# then, for iOS:
cd ios && pod install
```

Requires React Native 0.76+ with the New Architecture enabled. Full setup notes: [Installation docs](https://sbaiahmed1.github.io/react-native-blur/docs/installation).

## Quick start

```tsx
import { BlurView } from '@sbaiahmed1/react-native-blur';

<BlurView blurType="light" blurAmount={20} style={{ flex: 1 }}>
  <Text>Content on top of blur</Text>
</BlurView>;
```

Every component, prop, and platform note is documented on the [docs site](https://sbaiahmed1.github.io/react-native-blur/docs).

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md). The documentation site lives in [`website/`](./website) — when you change the public API, update the website in the same pull request.

## License

MIT

## Credits

Built with [create-react-native-library](https://github.com/callstack/react-native-builder-bob). Android blur is powered by [QmBlurView](https://github.com/QmDeve/QmBlurView).
