// ReactNativeBlurView.swift
// Main entry point for React Native Blur functionality
// This file now imports all the separated components for better maintainability

import SwiftUI
import UIKit

// Import all the separated components
// Note: These files contain the actual implementations that were previously in this file

// The following classes are automatically available in the same module:
// - BlurEffectView (from BlurEffectView.swift)
// - Blur (from BlurEffectView.swift) 
// - BasicColoredView (from BasicColoredView.swift)
// - AdvancedBlurView (from AdvancedBlurView.swift)
// - ReactNativeBlurViewHelper (from ReactNativeBlurViewHelper.swift)
// - Helper functions: blurStyleFromString, glassEffectFromString, mapBlurAmountToIntensity (from BlurStyleHelpers.swift)

// All functionality is now available through the imported components above
// This modular approach improves code organization and maintainability
// The Objective-C bridge can access these classes through the Swift bridging header

