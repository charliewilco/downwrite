import Foundation

@MainActor
final class OAuthTokenManager {
    private var credential: OAuthCredential?
    private var refreshTask: Task<OAuthCredential, Error>?
    private var generation = 0
    private let credentialStore: any OAuthCredentialStore
    private let tokenService: any DownwriteAPIClient
    private let dateProvider: () -> Date

    init(
        credential: OAuthCredential,
        credentialStore: any OAuthCredentialStore,
        tokenService: any DownwriteAPIClient,
        dateProvider: @escaping () -> Date = Date.init
    ) {
        self.credential = credential
        self.credentialStore = credentialStore
        self.tokenService = tokenService
        self.dateProvider = dateProvider
    }

    var instanceURL: URL? {
        credential?.instanceURL
    }

    func validAccessToken() async throws -> String {
        guard let credential else {
            throw OAuthSessionError.signedOut
        }
        let now = dateProvider()
        if credential.accessTokenExpiresAt.timeIntervalSince(now) > 60 {
            return credential.accessToken
        }
        guard credential.refreshTokenExpiresAt > now else {
            try? credentialStore.delete()
            self.credential = nil
            throw OAuthSessionError.expired
        }
        let generation = self.generation
        if let refreshTask {
            return try await adopt(refreshTask, generation: generation)
        }

        let service = tokenService
        let store = credentialStore
        let issuedAt = now
        let task = Task { @MainActor [weak self] in
            let response = try await service.refreshOAuthToken(credential.refreshToken)
            try Task.checkCancellation()
            guard self?.generation == generation else {
                throw CancellationError()
            }
            let refreshed = OAuthCredential(
                instanceURL: credential.instanceURL,
                response: response,
                issuedAt: issuedAt
            )
            guard refreshed.resource == credential.resource else {
                throw OAuthSessionError.resourceMismatch
            }
            guard refreshed.containsRequiredScopes else {
                throw OAuthSessionError.scopeMismatch
            }
            try store.save(refreshed)
            return refreshed
        }
        refreshTask = task
        return try await adopt(task, generation: generation)
    }

    func signOut() async {
        generation += 1
        refreshTask?.cancel()
        refreshTask = nil
        let credential = credential
        self.credential = nil
        try? credentialStore.delete()
        if let credential {
            try? await tokenService.revokeOAuthToken(credential.accessToken, type: .accessToken)
            try? await tokenService.revokeOAuthToken(credential.refreshToken, type: .refreshToken)
        }
    }

    private func adopt(_ task: Task<OAuthCredential, Error>, generation: Int) async throws -> String {
        defer { refreshTask = nil }
        let refreshed = try await task.value
        try Task.checkCancellation()
        guard self.generation == generation, credential != nil else {
            throw CancellationError()
        }
        credential = refreshed
        return refreshed.accessToken
    }
}

enum OAuthSessionError: LocalizedError, Equatable {
    case signedOut
    case expired
    case resourceMismatch
    case scopeMismatch

    var errorDescription: String? {
        switch self {
        case .signedOut:
            "Sign in to continue."
        case .expired:
            "Your Downwrite session has expired. Sign in again to continue."
        case .resourceMismatch:
            "The instance returned credentials for an unexpected API resource."
        case .scopeMismatch:
            "The instance returned credentials without the required permissions."
        }
    }
}
