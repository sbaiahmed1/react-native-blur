// swift-tools-version: 6.0

import Foundation
import PackageDescription

let reactHeaders: [Target.Dependency] = [
    .product(name: "ReactHeaders", package: "ReactNative"),
    .product(name: "ReactNativeHeaders", package: "ReactNative"),
    .product(name: "ReactNativeDependenciesHeaders", package: "ReactNative"),
    .product(name: "ReactAppHeaders", package: "React-GeneratedCode"),
]

let usedRootEntries: Set<String> = ["ios", "spm-headers", "spm-support", "Package.swift"]
let unusedRootEntries = try! FileManager.default.contentsOfDirectory(atPath: Context.packageDirectory)
    .filter { !usedRootEntries.contains($0) }
    .sorted()

let reactNativeSettings: [CSetting] = [
    .define("RCT_NEW_ARCH_ENABLED", to: "1"),
    .define("DEBUG", .when(configuration: .debug)),
    .define("NDEBUG", .when(configuration: .release)),
]

let reactNativeCxxSettings: [CXXSetting] = [
    .define("RCT_NEW_ARCH_ENABLED", to: "1"),
    .define("DEBUG", .when(configuration: .debug)),
    .define("NDEBUG", .when(configuration: .release)),
    .headerSearchPath("spm-headers"),
]

let package = Package(
    name: "ReactNativeBlur",
    platforms: [.iOS("15.1")],
    products: [
        .library(
            name: "ReactNativeBlur",
            targets: ["ReactNativeBlur", "ReactNativeBlurObjC"]
        ),
    ],
    dependencies: [
        .package(name: "ReactNative", path: "../../../../xcframeworks"),
        .package(name: "React-GeneratedCode", path: "../../../ios"),
    ],
    targets: [
        .target(
            name: "ReactNativeBlur",
            path: ".",
            exclude: unusedRootEntries + ["spm-headers"],
            sources: ["ios/Helpers", "ios/Views", "spm-support"]
        ),
        .target(
            name: "ReactNativeBlurObjC",
            dependencies: ["ReactNativeBlur"] + reactHeaders,
            path: ".",
            exclude: unusedRootEntries + [
                "ios/Helpers",
                "ios/Views",
                "spm-support",
                "spm-headers/ReactNativeBlur-Swift.h",
            ],
            sources: ["ios"],
            publicHeadersPath: "spm-headers/public",
            cSettings: reactNativeSettings + [
                .headerSearchPath("spm-headers"),
            ],
            cxxSettings: reactNativeCxxSettings
        ),
    ],
    swiftLanguageModes: [.v5],
    cxxLanguageStandard: .cxx20
)
