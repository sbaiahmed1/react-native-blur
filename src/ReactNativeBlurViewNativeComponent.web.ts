// Web counterpart of the codegen spec module. The native module calls
// codegenNativeComponent() at load time, which cannot run under
// react-native-web — Metro resolves this file instead on web, keeping the
// deprecated raw export in ./index.tsx importable there. The platform suffix
// also excludes this file from iOS/Android codegen.
export { default } from './BlurView.web';
export type {
  BlurType,
  NativeProps,
} from './ReactNativeBlurViewNativeComponent';
