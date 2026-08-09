import Foundation
import Observation

@Observable
final class SessionViewModel {
    enum State: Equatable {
        case restoring
        case signedOut
        case signedIn(InstanceSession)
    }

    private(set) var state: State
    private let credentialStore: any OAuthCredentialStore
	private let draftStore: DocumentDraftStore

    init(
        state: State = .restoring,
		credentialStore: any OAuthCredentialStore = KeychainOAuthCredentialStore(),
		draftStore: DocumentDraftStore = .shared
    ) {
        self.state = state
        self.credentialStore = credentialStore
		self.draftStore = draftStore
    }

    var activeSession: InstanceSession? {
        guard case .signedIn(let session) = state else {
            return nil
        }
        return session
    }

    func signIn(instanceURL: URL, accessToken: String?, identity: Identity?) {
        let client = OpenAPIDownwriteAPIClient(baseURL: instanceURL, accessToken: accessToken)
        state = .signedIn(InstanceSession(instanceURL: instanceURL, identity: identity, apiClient: client))
    }

    func signIn(configuration: InstanceConfiguration, tokenResponse: OAuthTokenResponse) async throws {
        let identityClient = OpenAPIDownwriteAPIClient(
			baseURL: configuration.instanceURL,
			accessToken: tokenResponse.accessToken
		)
		let authStatus = try await identityClient.authStatus()
		guard authStatus.authenticated, let identity = authStatus.identity else {
			throw OAuthSessionError.identityMissing
		}
		let credential = OAuthCredential(
			instanceURL: configuration.instanceURL,
			response: tokenResponse,
			identityID: identity.id
		)
        guard credential.resource == configuration.apiBaseURL.absoluteString else {
            throw OAuthSessionError.resourceMismatch
        }
        guard credential.containsRequiredScopes else {
            throw OAuthSessionError.scopeMismatch
        }
        try credentialStore.save(credential)
        state = .signedIn(makeOAuthSession(credential: credential))
    }

    func signIn(session: InstanceSession) {
        state = .signedIn(session)
    }

    func restore() {
        guard case .restoring = state else {
            return
        }
        do {
            guard let credential = try credentialStore.load() else {
                state = .signedOut
                return
            }
            let instanceURL = try InstanceConfiguration.candidate(from: credential.instanceURL.absoluteString)
            guard credential.refreshTokenExpiresAt > .now,
                  credential.resource == instanceURL.appending(path: "/api/v1").absoluteString,
				  credential.containsRequiredScopes,
				  credential.identityID?.isEmpty == false
            else {
				try? draftStore.removeAll(instanceURL: credential.instanceURL)
                try credentialStore.delete()
                state = .signedOut
                return
            }
            state = .signedIn(makeOAuthSession(credential: credential))
        } catch {
            try? credentialStore.delete()
            state = .signedOut
        }
    }

    func signOut() async {
        let tokenManager = activeSession?.tokenManager
		let signOutAction = activeSession?.signOutAction
		let instanceURL = activeSession?.instanceURL
        state = .signedOut
		if let instanceURL {
			try? draftStore.removeAll(instanceURL: instanceURL)
		}
        await tokenManager?.signOut()
		await signOutAction?()
    }

    private func makeOAuthSession(credential: OAuthCredential) -> InstanceSession {
        let tokenService = OpenAPIDownwriteAPIClient(baseURL: credential.instanceURL)
        let tokenManager = OAuthTokenManager(
            credential: credential,
            credentialStore: credentialStore,
            tokenService: tokenService
        )
        let client = OpenAPIDownwriteAPIClient(
            baseURL: credential.instanceURL,
            tokenManager: tokenManager
        )
        return InstanceSession(
            instanceURL: credential.instanceURL,
			identity: credential.identityID.map(Identity.init(id:)),
            apiClient: client,
            tokenManager: tokenManager
        )
    }
}

struct InstanceSession: Equatable, Identifiable {
    let id: UUID
    let instanceURL: URL
    let identity: Identity?
    var apiClient: any DownwriteAPIClient
    var tokenManager: OAuthTokenManager? = nil
	var signOutAction: (() async -> Void)? = nil

    init(
        id: UUID = UUID(),
        instanceURL: URL,
        identity: Identity?,
        apiClient: any DownwriteAPIClient,
		tokenManager: OAuthTokenManager? = nil,
		signOutAction: (() async -> Void)? = nil
    ) {
        self.id = id
        self.instanceURL = instanceURL
        self.identity = identity
        self.apiClient = apiClient
        self.tokenManager = tokenManager
		self.signOutAction = signOutAction
    }

    static func == (lhs: InstanceSession, rhs: InstanceSession) -> Bool {
        lhs.id == rhs.id
    }
}

extension SessionViewModel {
    static let previewSignedOut = SessionViewModel(state: .signedOut)

    static let previewSignedIn = SessionViewModel(
        state: .signedIn(
            InstanceSession(
                instanceURL: URL(string: "http://localhost:8787")!,
                identity: Identity(id: "local-owner"),
                apiClient: PreviewDownwriteAPIClient.sample,
                tokenManager: nil
            )
        )
    )
}
