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
    bandLayout()
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

  static func near(_ a: Double, _ b: Double, _ tolerance: Double = 1e-9) -> Bool {
    abs(a - b) <= tolerance
  }

  static func layout(_ amount: Double, _ radius: Double = 29.1, _ direction: String = "blurredTopClearBottom", _ offset: Double = 0) -> [ProgressiveBand] {
    ProgressiveBandLayout.bands(amount: amount, styleRadius: radius, direction: direction, startOffset: offset, axisLength: 800)
  }

  static func bandLayout() {
    check("plateau is twice the amount below the cap", near(layout(10)[0].fraction, 20 / 29.1))
    check("plateau stops at the style radius", near(layout(20, 19.2)[0].fraction, 1))
    let halving = layout(20)
    check("halves each band", zip(halving, halving.dropFirst()).allSatisfy { near($0.fraction, 2 * $1.fraction) })
    check("drops bands under 1 pt", layout(3).count == 3 && layout(4).count == 4 && layout(20, 48.4).count == 6)
    let counts = stride(from: 1.0, through: 100, by: 1).map { layout($0).count }
    check("band count never drops as the amount rises", zip(counts, counts.dropFirst()).allSatisfy { $0 <= $1 })
    check("bands keep their index as the amount changes", [5.0, 10, 20, 40].allSatisfy { amount in
      layout(amount).map(\.index) == Array(0..<layout(amount).count)
    })

    // Top to bottom at offset 0: the clear edge is at 1, so fade coordinate t sits at view position 1 - t.
    let reach = cbrt(29.1 / 40)
    check("opaque points follow the cube root curve", halving.allSatisfy { band in
      let opaqueAt = 1 - reach * pow(2, -Double(band.index) / 3)
      return near(band.alpha(at: opaqueAt), 1, 1e-6) && band.alpha(at: opaqueAt + 0.002) < 1
    })
    check("adjacent bands overlap only once", stride(from: 0.0, through: 1, by: 0.0005).allSatisfy { position in
      let alphas = halving.map { $0.alpha(at: position) }.filter { $0 > 1e-9 }
      return alphas.count <= 2 && (alphas.count < 2 || alphas.contains { $0 >= 1 - 1e-9 })
    })

    check("band 0 draws alone at the blurred edge", [(10.0, 29.1), (14, 29.1), (9.5, 19.2), (.nan, 29.1)].allSatisfy { amount, radius in
      layout(amount, radius).filter { $0.alpha(at: 0) > 1e-9 }.map(\.index) == [0]
    })

    let full = layout(.nan)
    check("reads edge amounts", near(full.first?.fraction ?? 0, 1) && near(layout(.infinity).first?.fraction ?? 0, 1)
      && layout(0).isEmpty && layout(-1).isEmpty && layout(-.infinity).isEmpty)
    check("one unmasked band from offset 1", [1.0, 1.5].allSatisfy { offset in
      let bands = layout(20, 29.1, "blurredTopClearBottom", offset)
      return bands.count == 1 && bands[0].start == 0 && bands[0].end == 1 && bands[0].stops.allSatisfy { $0.alpha == 1 }
    })
    let center = "blurredCenterClearTopAndBottom"
    check("clamps the center inset", layout(20, 29.1, center, 0) == layout(20, 29.1, center, 0.01)
      && layout(20, 29.1, center, 0.5) == layout(20, 29.1, center, 0.3))
    let bottom = layout(20, 29.1, "blurredBottomClearTop")
    check("mirrors bottom to top", bottom.count == halving.count && zip(bottom, halving).allSatisfy { up, down in
      near(up.start, 1 - down.end) && near(up.end, 1 - down.start)
        && stride(from: 0.0, through: 1, by: 0.01).allSatisfy { near(up.alpha(at: $0), down.alpha(at: 1 - $0), 1e-9) }
    })
    let centerBands = layout(20, 29.1, center)
    check("center merges band 0", centerBands.filter { $0.index == 0 }.count == 1
      && (1..<halving.count).allSatisfy { k in centerBands.filter { $0.index == k }.count == 2 })
    let edges = layout(20, 29.1, "blurredTopAndBottomClearCenter")
    check("edges keeps two sets", (0..<halving.count).allSatisfy { k in edges.filter { $0.index == k }.count == 2 })

    let band1 = halving[1]
    let firstNonzero = stride(from: 0.0, through: 1, by: 0.0001).first { band1.alpha(at: $0) > 0 } ?? 0
    let pad = 3 * band1.fraction * 29.1 / 800
    check("pads each frame by three sigma", near(band1.start, max(0, firstNonzero - pad), 2e-4))
    check("mask stays zero in the padding", stride(from: band1.start, to: firstNonzero - 2e-4, by: 0.0005).allSatisfy {
      band1.alpha(at: $0) == 0
    })
  }
}
