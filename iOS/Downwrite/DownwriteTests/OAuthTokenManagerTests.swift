import Foundation
import Testing

@testable import Downwrite

@MainActor
struct OAuthTokenManagerTests {
    @Test func returnsUnexpiredAccessTokenWithoutRefresh() async throws {
        let credential = credential(issuedAt: now)
        let store = InMemoryOAuthCredentialStore(credential: credential)
        let service = tokenService()
        let manager = OAuthTokenManager(
            credential: credential,
            credentialStore: store,
            tokenService: service,
            dateProvider: { now }
        )

        let token = try await manager.validAccessToken()

        #expect(token == "access-token")
        #expect(service.refreshTokenCallCount == 0)
        #expect(store.saveCount == 0)
    }

    @Test func refreshesAndPersistsExpiredAccessToken() async throws {
        let credential = credential(issuedAt: now.addingTimeInterval(-901))
        let store = InMemoryOAuthCredentialStore(credential: credential)
        let service = tokenService()
        let manager = OAuthTokenManager(
            credential: credential,
            credentialStore: store,
            tokenService: service,
            dateProvider: { now }
        )

        let token = try await manager.validAccessToken()

        #expect(token == "preview-refreshed-access")
        #expect(service.refreshTokenCallCount == 1)
        #expect(store.saveCount == 1)
        #expect(store.credential?.refreshToken == "preview-rotated-refresh")
    }

    @Test func coalescesConcurrentRefreshes() async throws {
        let credential = credential(issuedAt: now.addingTimeInterval(-901))
        let store = InMemoryOAuthCredentialStore(credential: credential)
        let service = tokenService()
        service.refreshTokenDelay = .milliseconds(50)
        let manager = OAuthTokenManager(
            credential: credential,
            credentialStore: store,
            tokenService: service,
            dateProvider: { now }
        )

        async let first = manager.validAccessToken()
        async let second = manager.validAccessToken()
        let tokens = try await [first, second]

        #expect(tokens == ["preview-refreshed-access", "preview-refreshed-access"])
        #expect(service.refreshTokenCallCount == 1)
        #expect(store.saveCount == 1)
    }

    @Test func expiredRefreshTokenClearsStoredSession() async {
        let credential = credential(issuedAt: now.addingTimeInterval(-2_592_001))
        let store = InMemoryOAuthCredentialStore(credential: credential)
        let service = tokenService()
        let manager = OAuthTokenManager(
            credential: credential,
            credentialStore: store,
            tokenService: service,
            dateProvider: { now }
        )

        await #expect(throws: OAuthSessionError.expired) {
            try await manager.validAccessToken()
        }
        #expect(store.credential == nil)
        #expect(store.deleteCount == 1)
    }

    @Test func signOutRevokesBothTokensAndClearsStore() async {
        let credential = credential(issuedAt: now)
        let store = InMemoryOAuthCredentialStore(credential: credential)
        let service = tokenService()
        let manager = OAuthTokenManager(
            credential: credential,
            credentialStore: store,
            tokenService: service,
            dateProvider: { now }
        )

        await manager.signOut()

        #expect(service.revokedTokens.count == 2)
        #expect(service.revokedTokens[0].token == "access-token")
        #expect(service.revokedTokens[0].type == .accessToken)
        #expect(service.revokedTokens[1].token == "refresh-token")
        #expect(service.revokedTokens[1].type == .refreshToken)
        #expect(store.credential == nil)
        #expect(store.deleteCount == 1)
    }

    @Test func signOutCannotBeUndoneByInFlightRefresh() async {
        let credential = credential(issuedAt: now.addingTimeInterval(-901))
        let store = InMemoryOAuthCredentialStore(credential: credential)
        let service = tokenService()
        service.refreshTokenDelay = .milliseconds(100)
        service.ignoresRefreshCancellation = true
        let manager = OAuthTokenManager(
            credential: credential,
            credentialStore: store,
            tokenService: service,
            dateProvider: { now }
        )

        let refresh = Task { try await manager.validAccessToken() }
        try? await Task.sleep(for: .milliseconds(10))
        await manager.signOut()
        _ = try? await refresh.value

        #expect(store.credential == nil)
        #expect(store.saveCount == 0)
        await #expect(throws: OAuthSessionError.signedOut) {
            try await manager.validAccessToken()
        }
    }

    @Test func sessionRestoresSavedCredential() throws {
        let credential = credential(issuedAt: now)
        let store = InMemoryOAuthCredentialStore(credential: credential)
        let session = SessionViewModel(state: .restoring, credentialStore: store)

        session.restore()

        #expect(session.activeSession?.instanceURL == instanceURL)
		#expect(session.activeSession?.identity == Identity(id: "oauth-owner"))
        #expect(session.activeSession?.tokenManager != nil)
    }

	@Test func expiredSessionRestorationPurgesInstanceDrafts() throws {
		let response = OAuthTokenResponse(
			tokenType: "Bearer",
			accessToken: "expired-access",
			expiresIn: 1,
			refreshToken: "expired-refresh",
			refreshExpiresIn: 1,
			scope: InstanceConfiguration.requestedScopes.joined(separator: " "),
			resource: instanceURL.appending(path: "/api/v1").absoluteString
		)
		let expiredCredential = OAuthCredential(
			instanceURL: instanceURL,
			response: response,
			issuedAt: .now.addingTimeInterval(-60),
			identityID: "oauth-owner"
		)
		let credentialStore = InMemoryOAuthCredentialStore(credential: expiredCredential)
		let draftStore = DocumentDraftStore.testStore()
		let document = try #require(PreviewDownwriteAPIClient.sample.documents["doc-pitch"])
		let key = DocumentDraftKey(
			instanceURL: instanceURL.absoluteString,
			identityID: "oauth-owner",
			documentID: document.id
		)
		try draftStore.save(
			StoredDocumentDraft(
				key: key,
				baseline: document,
				title: document.title,
				content: "Unsaved OAuth draft"
			)
		)
		let session = SessionViewModel(
			state: .restoring,
			credentialStore: credentialStore,
			draftStore: draftStore
		)

		session.restore()

		#expect(session.state == .signedOut)
		#expect(credentialStore.credential == nil)
		#expect(try draftStore.load(for: key) == nil)
	}

    @Test func replacingSessionChangesWorkspaceIdentity() {
        let first = InstanceSession(
            instanceURL: instanceURL,
            identity: Identity(id: "first"),
            apiClient: tokenService()
        )
        let session = SessionViewModel(state: .signedIn(first), credentialStore: InMemoryOAuthCredentialStore())

        session.signIn(
            session: InstanceSession(
                instanceURL: instanceURL,
                identity: Identity(id: "second"),
                apiClient: tokenService()
            )
        )

        #expect(session.activeSession?.id != first.id)
    }

    private let now = Date(timeIntervalSince1970: 1_786_246_800)
    private let instanceURL = URL(string: "https://downwrite.example.com")!

    private func credential(issuedAt: Date) -> OAuthCredential {
        OAuthCredential(
            instanceURL: instanceURL,
            response: OAuthTokenResponse(
                tokenType: "Bearer",
                accessToken: "access-token",
                expiresIn: 900,
                refreshToken: "refresh-token",
                refreshExpiresIn: 2_592_000,
                scope: InstanceConfiguration.requestedScopes.joined(separator: " "),
                resource: instanceURL.appending(path: "/api/v1").absoluteString
            ),
			issuedAt: issuedAt,
			identityID: "oauth-owner"
        )
    }

    private func tokenService() -> PreviewDownwriteAPIClient {
        let service = PreviewDownwriteAPIClient.sampleCopy()
        service.baseURL = instanceURL
        return service
    }
}

@MainActor
private final class InMemoryOAuthCredentialStore: OAuthCredentialStore {
    var credential: OAuthCredential?
    var saveCount = 0
    var deleteCount = 0

    init(credential: OAuthCredential? = nil) {
        self.credential = credential
    }

    func load() throws -> OAuthCredential? {
        credential
    }

    func save(_ credential: OAuthCredential) throws {
        self.credential = credential
        saveCount += 1
    }

    func delete() throws {
        credential = nil
        deleteCount += 1
    }
}

extension PreviewDownwriteAPIClient {
    fileprivate static func sampleCopy() -> PreviewDownwriteAPIClient {
        PreviewDownwriteAPIClient(groups: sample.groups, documents: sample.documents)
    }
}
