import { useEffect, useState } from 'react';
import { AccessibilityInfo, Platform } from 'react-native';

/** True while iOS Reduce Transparency is on, so a playground can say why the effect is flat. */
export function useReduceTransparency(): boolean {
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    if (Platform.OS !== 'ios') return;
    let alive = true;
    AccessibilityInfo.isReduceTransparencyEnabled().then((value) => {
      if (alive) setEnabled(value);
    });
    const subscription = AccessibilityInfo.addEventListener(
      'reduceTransparencyChanged',
      setEnabled
    );
    return () => {
      alive = false;
      subscription.remove();
    };
  }, []);
  return enabled;
}
