// PrivateApiSupport.swift

import Foundation

/// Whether this build contains the private variable blur filter, which `REACT_NATIVE_BLUR_NO_PRIVATE_API` compiles out.
enum PrivateApiSupport {
  #if REACT_NATIVE_BLUR_NO_PRIVATE_API
  static let compiledIn = false
  #else
  static let compiledIn = true
  #endif
}
