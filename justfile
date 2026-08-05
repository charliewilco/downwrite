set shell := ["bash", "-cu"]

default:
    @just --list

worker-dev:
    cd worker && npm run dev

worker-build:
    cd worker && npm run build

worker-format:
    cd worker && npm run format:check

worker-test:
    cd worker && npm run test

worker-validate:
    cd worker && npm run validate

generate-ios-client:
    cd worker && npm run generate:ios-client

ios-build:
    xcodebuild build -project iOS/Downwrite/Downwrite.xcodeproj -scheme Downwrite -destination 'platform=iOS Simulator,name=iPhone 17' -configuration Debug

ios-test:
    xcodebuild test -project iOS/Downwrite/Downwrite.xcodeproj -scheme Downwrite -destination 'platform=iOS Simulator,name=iPhone 17' -configuration Debug

validate:
    just generate-ios-client
    just worker-format
    just worker-validate
    just ios-test
