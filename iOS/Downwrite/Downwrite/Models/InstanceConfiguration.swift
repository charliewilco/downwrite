import Foundation

struct InstanceConfiguration: Equatable, Sendable {
    static let clientID = "downwrite-ios"
    static let callbackURL = URL(string: "downwrite://oauth/callback")!
    static let requestedScopes = [
        "workspaces:read",
        "workspaces:write",
        "documents:read",
        "documents:write",
        "sharing:write",
    ]

    let instanceURL: URL
    let apiBaseURL: URL
    let authorizationEndpoint: URL
    let tokenEndpoint: URL
    let revocationEndpoint: URL

    static func candidate(from value: String) throws -> URL {
        let trimmed = value.trimmingCharacters(in: .whitespacesAndNewlines)
        guard let url = URL(string: trimmed), let origin = url.downwriteOrigin else {
            throw InstanceConfigurationError.invalidURL
        }
        guard origin.scheme == "https" || origin.isLoopbackHTTP else {
            throw InstanceConfigurationError.insecureURL
        }
        return origin
    }

    init(
        candidateURL: URL,
        discovery: DiscoveryMetadata,
        authorizationServer: OAuthAuthorizationServerMetadata
    ) throws {
        guard let candidateOrigin = candidateURL.downwriteOrigin else {
            throw InstanceConfigurationError.invalidURL
        }
        guard discovery.name.lowercased() == "downwrite" else {
            throw InstanceConfigurationError.notDownwrite
        }
        guard let discoveredURL = URL(string: discovery.instanceURL),
            discoveredURL.downwriteOrigin == candidateOrigin,
            discoveredURL.hasRootPathOnly
        else {
            throw InstanceConfigurationError.instanceMismatch
        }
        guard discovery.supportedAPIVersions.contains("v1") else {
            throw InstanceConfigurationError.unsupportedAPIVersion
        }
        guard let apiBaseURL = URL(string: discovery.apiBaseURL),
            apiBaseURL.downwriteOrigin == candidateOrigin,
            apiBaseURL.path == "/api/v1",
            apiBaseURL.query == nil,
            apiBaseURL.fragment == nil
        else {
            throw InstanceConfigurationError.invalidMetadata
        }
        guard let issuer = URL(string: authorizationServer.issuer),
            issuer.downwriteOrigin == candidateOrigin,
            issuer.hasRootPathOnly,
            let authorizationEndpoint = URL(string: authorizationServer.authorizationEndpoint),
            authorizationEndpoint.downwriteOrigin == candidateOrigin,
            authorizationEndpoint.path == "/oauth/authorize",
            authorizationEndpoint.query == nil,
            authorizationEndpoint.fragment == nil,
            let tokenEndpoint = URL(string: authorizationServer.tokenEndpoint),
            tokenEndpoint.downwriteOrigin == candidateOrigin,
            tokenEndpoint.path == "/oauth/token",
            tokenEndpoint.query == nil,
            tokenEndpoint.fragment == nil,
            let revocationEndpoint = URL(string: authorizationServer.revocationEndpoint),
            revocationEndpoint.downwriteOrigin == candidateOrigin,
            revocationEndpoint.path == "/oauth/revoke",
            revocationEndpoint.query == nil,
            revocationEndpoint.fragment == nil
        else {
            throw InstanceConfigurationError.invalidOAuthMetadata
        }
        guard authorizationServer.responseTypesSupported.contains("code"),
            authorizationServer.grantTypesSupported.contains("authorization_code"),
            authorizationServer.grantTypesSupported.contains("refresh_token"),
            authorizationServer.codeChallengeMethodsSupported.contains("S256"),
            authorizationServer.tokenEndpointAuthMethodsSupported.contains("none"),
            Set(Self.requestedScopes).isSubset(of: Set(authorizationServer.scopesSupported))
        else {
            throw InstanceConfigurationError.unsupportedOAuthServer
        }

        instanceURL = candidateOrigin
        self.apiBaseURL = apiBaseURL
        self.authorizationEndpoint = authorizationEndpoint
        self.tokenEndpoint = tokenEndpoint
        self.revocationEndpoint = revocationEndpoint
    }
}

enum InstanceConfigurationError: LocalizedError, Equatable {
    case invalidURL
    case insecureURL
    case notDownwrite
    case instanceMismatch
    case unsupportedAPIVersion
    case invalidMetadata
    case invalidOAuthMetadata
    case unsupportedOAuthServer

    var errorDescription: String? {
        switch self {
        case .invalidURL:
            "Enter a valid Downwrite instance URL."
        case .insecureURL:
            "Downwrite instances must use HTTPS. HTTP is allowed only for local development."
        case .notDownwrite:
            "The server did not identify itself as a Downwrite instance."
        case .instanceMismatch:
            "The server returned discovery metadata for a different origin."
        case .unsupportedAPIVersion:
            "This app requires a Downwrite instance that supports API v1."
        case .invalidMetadata:
            "The instance returned invalid API discovery metadata."
        case .invalidOAuthMetadata:
            "The instance returned unsafe OAuth endpoint metadata."
        case .unsupportedOAuthServer:
            "The instance does not support the OAuth capabilities required by this app."
        }
    }
}

extension URL {
    fileprivate var downwriteOrigin: URL? {
        guard user == nil, password == nil,
            let scheme = scheme?.lowercased(),
            ["http", "https"].contains(scheme),
            let host = host?.lowercased()
        else {
            return nil
        }
        var components = URLComponents()
        components.scheme = scheme
        components.host = host
        components.port = port
        return components.url
    }

    fileprivate var isLoopbackHTTP: Bool {
        guard scheme == "http", let host = host?.lowercased() else {
            return false
        }
        return host == "localhost" || host == "127.0.0.1" || host == "::1"
    }

    fileprivate var hasRootPathOnly: Bool {
        (path.isEmpty || path == "/") && query == nil && fragment == nil
    }
}
