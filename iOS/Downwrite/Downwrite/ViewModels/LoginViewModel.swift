import Foundation
import Observation

@Observable
final class LoginViewModel {
    var instanceURLText = "http://localhost:4321"
    var developmentIdentity = "local-owner"
    var developmentDisplayName = "Local Owner"
    var developmentBearerToken = ""
    var statusMessage: String?
    var isSigningIn = false

    private let session: SessionViewModel
    private let authenticator: OAuthAuthenticator

    init(session: SessionViewModel, authenticator: OAuthAuthenticator = OAuthAuthenticator()) {
        self.session = session
        self.authenticator = authenticator
    }

    var normalizedInstanceURL: URL? {
        guard let url = URL(string: instanceURLText.trimmingCharacters(in: .whitespacesAndNewlines)),
              let scheme = url.scheme,
              ["http", "https"].contains(scheme),
              url.host != nil
        else {
            return nil
        }
        return url
    }

    func signInWithOAuth() async {
        guard let instanceURL = normalizedInstanceURL else {
            statusMessage = "Enter a valid Downwrite instance URL."
            return
        }
        isSigningIn = true
        defer { isSigningIn = false }

        do {
            _ = try await OpenAPIDownwriteAPIClient(baseURL: instanceURL).discoverInstance()
            let result = try await authenticator.signIn(instanceURL: instanceURL)
            session.signIn(
                session: InstanceSession(
                    instanceURL: instanceURL,
                    identity: nil,
                    apiClient: result.client
                )
            )
        } catch {
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

        do {
            let client = OpenAPIDownwriteAPIClient(
                baseURL: instanceURL,
                accessToken: developmentBearerToken.nilIfBlank
            )
            _ = try await client.discoverInstance()
            let identity: Identity
            if developmentBearerToken.nilIfBlank == nil {
                let result = try await client.createDevelopmentSession(
                    identityId: developmentIdentity.nilIfBlank ?? "local-owner",
                    displayName: developmentDisplayName.nilIfBlank ?? "Local Owner"
                )
                identity = result.identity
            } else {
                identity = Identity(id: developmentIdentity.nilIfBlank ?? "development-token")
            }
            session.signIn(
                session: InstanceSession(
                    instanceURL: instanceURL,
                    identity: identity,
                    apiClient: client
                )
            )
        } catch {
            statusMessage = error.localizedDescription
        }
    }
}

private extension String {
    var nilIfBlank: String? {
        let value = trimmingCharacters(in: .whitespacesAndNewlines)
        return value.isEmpty ? nil : value
    }
}
