import Foundation
import Testing

@testable import Downwrite

@MainActor
struct InstanceConfigurationTests {
    @Test func normalizesInstanceInputToOrigin() throws {
        let instanceURL = try InstanceConfiguration.candidate(
            from: "  https://downwrite.example.com/some/path?ignored=true  "
        )

        #expect(instanceURL.absoluteString == "https://downwrite.example.com")
    }

    @Test func rejectsInsecureRemoteInstance() {
        #expect(throws: InstanceConfigurationError.insecureURL) {
            try InstanceConfiguration.candidate(from: "http://downwrite.example.com")
        }
    }

    @Test func acceptsLoopbackHTTPForDevelopment() throws {
        let instanceURL = try InstanceConfiguration.candidate(from: "http://localhost:4321/workspaces")

        #expect(instanceURL.absoluteString == "http://localhost:4321")
    }

    @Test func validatesDiscoveryAndOAuthMetadata() throws {
        let configuration = try InstanceConfiguration(
            candidateURL: origin,
            discovery: discovery(),
            authorizationServer: authorizationServer()
        )

        #expect(configuration.instanceURL == origin)
        #expect(configuration.apiBaseURL.absoluteString == "https://downwrite.example.com/api/v1")
        #expect(configuration.authorizationEndpoint.absoluteString == "https://downwrite.example.com/oauth/authorize")
    }

    @Test func rejectsDiscoveryForAnotherOrigin() {
        #expect(throws: InstanceConfigurationError.instanceMismatch) {
            try InstanceConfiguration(
                candidateURL: origin,
                discovery: discovery(instanceURL: "https://attacker.example"),
                authorizationServer: authorizationServer()
            )
        }
    }

    @Test func rejectsUnsupportedAPIVersion() {
        #expect(throws: InstanceConfigurationError.unsupportedAPIVersion) {
            try InstanceConfiguration(
                candidateURL: origin,
                discovery: discovery(supportedVersions: ["v2"]),
                authorizationServer: authorizationServer()
            )
        }
    }

    @Test func rejectsCrossOriginOAuthEndpoint() {
        var metadata = authorizationServer()
        metadata = OAuthAuthorizationServerMetadata(
            issuer: metadata.issuer,
            authorizationEndpoint: "https://attacker.example/oauth/authorize",
            tokenEndpoint: metadata.tokenEndpoint,
            revocationEndpoint: metadata.revocationEndpoint,
            responseTypesSupported: metadata.responseTypesSupported,
            grantTypesSupported: metadata.grantTypesSupported,
            codeChallengeMethodsSupported: metadata.codeChallengeMethodsSupported,
            tokenEndpointAuthMethodsSupported: metadata.tokenEndpointAuthMethodsSupported,
            scopesSupported: metadata.scopesSupported
        )

        #expect(throws: InstanceConfigurationError.invalidOAuthMetadata) {
            try InstanceConfiguration(
                candidateURL: origin,
                discovery: discovery(),
                authorizationServer: metadata
            )
        }
    }

    private let origin = URL(string: "https://downwrite.example.com")!

    private func discovery(
        instanceURL: String = "https://downwrite.example.com",
        supportedVersions: [String] = ["v1"]
    ) -> DiscoveryMetadata {
        DiscoveryMetadata(
            name: "downwrite",
            instanceURL: instanceURL,
            supportedAPIVersions: supportedVersions,
            apiBaseURL: "https://downwrite.example.com/api/v1"
        )
    }

    private func authorizationServer() -> OAuthAuthorizationServerMetadata {
        OAuthAuthorizationServerMetadata(
            issuer: origin.absoluteString,
            authorizationEndpoint: origin.appending(path: "/oauth/authorize").absoluteString,
            tokenEndpoint: origin.appending(path: "/oauth/token").absoluteString,
            revocationEndpoint: origin.appending(path: "/oauth/revoke").absoluteString,
            responseTypesSupported: ["code"],
            grantTypesSupported: ["authorization_code", "refresh_token"],
            codeChallengeMethodsSupported: ["S256"],
            tokenEndpointAuthMethodsSupported: ["none"],
            scopesSupported: InstanceConfiguration.requestedScopes
        )
    }
}
