// VariableBlurDirection.swift

import Foundation

public enum VariableBlurDirection: String {
  case blurredTopClearBottom
  case blurredBottomClearTop
  case blurredCenterClearTopAndBottom
  case blurredLeftToClearRight
  case blurredRightToClearLeft
  case blurredTopAndBottomClearCenter

  init(fromString string: String) {
    switch string.lowercased() {
    case "blurredbottomcleartop", "bottomtotop", "bottom":
      self = .blurredBottomClearTop
    case "blurredcentercleartopandbottom", "center":
      self = .blurredCenterClearTopAndBottom
    case "blurredlefttoclearright", "lefttoright", "left":
      self = .blurredLeftToClearRight
    case "blurredrighttoclearleft", "righttoleft", "right":
      self = .blurredRightToClearLeft
    case "blurredtopandbottomclearcenter", "edges":
      self = .blurredTopAndBottomClearCenter
    default:
      self = .blurredTopClearBottom
    }
  }
}
