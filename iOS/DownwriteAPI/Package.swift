// swift-tools-version: 6.0

import PackageDescription

let package = Package(
    name: "DownwriteAPI",
    platforms: [
        .iOS(.v17),
        .macOS(.v14)
    ],
    products: [
        .library(name: "DownwriteAPI", targets: ["DownwriteAPI"])
    ],
    dependencies: [
        .package(url: "https://github.com/apple/swift-http-types", from: "1.6.0"),
        .package(url: "https://github.com/apple/swift-openapi-runtime", from: "1.12.0")
    ],
    targets: [
        .target(
            name: "DownwriteAPI",
            dependencies: [
                .product(name: "HTTPTypes", package: "swift-http-types"),
                .product(name: "OpenAPIRuntime", package: "swift-openapi-runtime")
            ]
        )
    ]
)
