import Foundation

// Tests for the Foundation-only Swift files, compiled and run by run.sh.
@main
struct IOSMathTests {
  static var failures = 0

  static func check(_ name: String, _ condition: Bool) {
    print(condition ? "ok   \(name)" : "FAIL \(name)")
    if !condition { failures += 1 }
  }

  static func main() {
    liquidGlassRules()
    if failures > 0 {
      print("\(failures) failed")
      exit(1)
    }
    print("all passed")
  }

  static func liquidGlassRules() {
    let rules = LiquidGlassRules.self
    check("false before iOS 26", !rules.isAvailable(osMajor: 25, compilerHasGlass: true, sdkMajor: 26, requiresCompatibility: nil))
    check("false without the compiler", !rules.isAvailable(osMajor: 26, compilerHasGlass: false, sdkMajor: 26, requiresCompatibility: nil))
    check("true on iOS 26 without the key", rules.isAvailable(osMajor: 26, compilerHasGlass: true, sdkMajor: 26, requiresCompatibility: nil))
    check("false on iOS 26 in compatibility mode", !rules.isAvailable(osMajor: 26, compilerHasGlass: true, sdkMajor: 26, requiresCompatibility: true))
    check("true on iOS 27 with SDK 27 in compatibility mode", rules.isAvailable(osMajor: 27, compilerHasGlass: true, sdkMajor: 27, requiresCompatibility: true))
    check("false on iOS 27 with SDK 26 in compatibility mode", !rules.isAvailable(osMajor: 27, compilerHasGlass: true, sdkMajor: 26, requiresCompatibility: true))
    check("sdk 0 counts as older", !rules.isAvailable(osMajor: 27, compilerHasGlass: true, sdkMajor: 0, requiresCompatibility: true))
  }
}
