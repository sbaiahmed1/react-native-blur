import React from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { Platform, View } from 'react-native';
import TargetViewNativeComponent from './TargetViewNativeComponent';

export interface BlurTargetViewProps {
  /**
   * The unique identifier for this target view
   * This must match the `targetId` prop of a BlurView component
   */
  id?: string;

  /**
   * Style object for the target view
   */
  style?: StyleProp<ViewStyle>;

  /**
   * Child components to render inside the target view
   */
  children?: React.ReactNode;
}

/**
 * BlurTargetView component using Dimezis BlurView v3.
 *
 * This component serves as the target for blur effects on Android.
 * On iOS, this renders as a regular View since iOS doesn't need the target system.
 *
 * It must be used with a BlurView component that references this view's `id`.
 *
 * @example
 * ```tsx
 * <BlurView
 *   targetId="myTarget"
 *   overlayColor="light"
 *   blurRadius={10}
 *   style={{ position: 'absolute', width: '100%', height: 200 }}
 * >
 *   <Text>Blurred content</Text>
 * </BlurView>
 *
 * <BlurTargetView id="myTarget" style={{ flex: 1 }}>
 *   <YourContent />
 * </BlurTargetView>
 * ```
 */
export const BlurTargetView: React.FC<BlurTargetViewProps> = ({
  id,
  style,
  children,
}) => {
  // On iOS, just render a regular View since iOS doesn't need the target system
  if (Platform.OS === 'ios') {
    return <View style={style}>{children}</View>;
  }

  // On Android, use the native TargetView component
  return (
    <TargetViewNativeComponent id={id} style={style}>
      {children}
    </TargetViewNativeComponent>
  );
};
