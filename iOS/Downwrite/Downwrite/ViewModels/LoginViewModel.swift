import Foundation
import Observation

@Observable
final class LoginViewModel {
	var instanceURLText = "https://downwrite.github-ab4.workers.dev"
    var developmentIdentity = "local-owner"
    var developmentDisplayName = "Local Owner"
    var developmentBearerToken = ""
    var statusMessage: String?
    var isSigningIn = false

    private let session: SessionViewModel
    private let authenticator: OAuthAuthenticator

	init(session: SessionViewModel, authenticator: OAuthAuthenticator? = nil) {
        self.session = session
		self.authenticator = authenticator ?? OAuthAuthenticator()
    }

    var normalizedInstanceURL: URL? {
		try? InstanceConfiguration.candidate(from: instanceURLText)
    }

    func signInWithOAuth() async {
        isSigningIn = true
        defer { isSigningIn = false }
		statusMessage = nil

        do {
			let candidateURL = try InstanceConfiguration.candidate(from: instanceURLText)
			let client = OpenAPIDownwriteAPIClient(baseURL: candidateURL)
			async let discovery = client.discoverInstance()
			async let authorizationServer = client.oauthAuthorizationServerMetadata()
			let (discoveryMetadata, authorizationServerMetadata) = try await (discovery, authorizationServer)
			let configuration = try InstanceConfiguration(
				candidateURL: candidateURL,
				discovery: discoveryMetadata,
				authorizationServer: authorizationServerMetadata
                )
			let tokenResponse = try await authenticator.signIn(configuration: configuration)
			try await session.signIn(configuration: configuration, tokenResponse: tokenResponse)
		}
		catch {
            statusMessage = error.localizedDescription
        }
    }

    func signInForLocalDevelopment() async {
        guard let instanceURL = normalizedInstanceURL else {
            statusMessage = "Enter a valid Downwrite instance URL."
            return
        }
        isSigningIn = true
        defer { isSigningIn = false }
		statusMessage = nil

        do {
            let client = OpenAPIDownwriteAPIClient(
                baseURL: instanceURL,
                accessToken: developmentBearerToken.nilIfBlank,
                localDevelopmentSession: true
            )
            _ = try await client.discoverInstance()
            let identity: Identity
            if developmentBearerToken.nilIfBlank == nil {
                let result = try await client.createDevelopmentSession(
                    identityId: developmentIdentity.nilIfBlank ?? "local-owner",
                    displayName: developmentDisplayName.nilIfBlank ?? "Local Owner"
                )
                identity = result.identity
			}
			else {
                identity = Identity(id: developmentIdentity.nilIfBlank ?? "development-token")
            }
            session.signIn(
                session: InstanceSession(
                    instanceURL: instanceURL,
                    identity: identity,
                    apiClient: client,
					signOutAction: {
						await client.signOutLocalDevelopmentSession()
					}
                )
            )
		}
		catch {
            statusMessage = error.localizedDescription
        }
    }
}

extension String {
	fileprivate var nilIfBlank: String? {
        let value = trimmingCharacters(in: .whitespacesAndNewlines)
        return value.isEmpty ? nil : value
    }
}
