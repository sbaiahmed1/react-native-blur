export const blurTypeValues: { value: string; description: string }[] = [
  { value: 'light', description: 'Light blur effect.' },
  { value: 'dark', description: 'Dark blur effect.' },
  { value: 'xlight', description: 'Extra light blur effect (default for BlurView/VibrancyView).' },
  { value: 'extraDark', description: 'Extra dark blur effect.' },
  { value: 'regular', description: 'Regular blur (iOS 10+).' },
  { value: 'prominent', description: 'Prominent blur (iOS 10+).' },
  { value: 'systemUltraThinMaterial', description: 'Ultra thin material (iOS 13+).' },
  { value: 'systemThinMaterial', description: 'Thin material (iOS 13+).' },
  { value: 'systemMaterial', description: 'Material (iOS 13+).' },
  { value: 'systemThickMaterial', description: 'Thick material (iOS 13+).' },
  { value: 'systemChromeMaterial', description: 'Chrome material (iOS 13+).' },
  { value: 'systemUltraThinMaterialLight', description: 'Ultra thin light material (iOS 13+).' },
  { value: 'systemThinMaterialLight', description: 'Thin light material (iOS 13+).' },
  { value: 'systemMaterialLight', description: 'Light material (iOS 13+).' },
  { value: 'systemThickMaterialLight', description: 'Thick light material (iOS 13+).' },
  { value: 'systemChromeMaterialLight', description: 'Chrome light material (iOS 13+).' },
  { value: 'systemUltraThinMaterialDark', description: 'Ultra thin dark material (iOS 13+).' },
  { value: 'systemThinMaterialDark', description: 'Thin dark material (iOS 13+).' },
  { value: 'systemMaterialDark', description: 'Dark material (iOS 13+).' },
  { value: 'systemThickMaterialDark', description: 'Thick dark material (iOS 13+).' },
  { value: 'systemChromeMaterialDark', description: 'Chrome dark material (iOS 13+).' },
];

export const glassTypeValues: { value: string; description: string }[] = [
  { value: 'clear', description: 'Clear glass effect (default).' },
  { value: 'regular', description: 'Regular glass effect with a more pronounced appearance.' },
];

export const progressiveBlurDirectionValues: { value: string; description: string }[] = [
  { value: 'blurredTopClearBottom', description: 'Blurred at the top, fading to clear at the bottom (default).' },
  { value: 'blurredBottomClearTop', description: 'Blurred at the bottom, fading to clear at the top.' },
  {
    value: 'blurredCenterClearTopAndBottom',
    description: 'Blur peaks in the center and fades to clear at both edges.',
  },
];
