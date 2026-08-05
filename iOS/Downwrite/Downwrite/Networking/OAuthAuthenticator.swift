import AuthenticationServices
import CryptoKit
import Foundation

struct OAuthCredential: Equatable {
    let accessToken: String
    let refreshToken: String
    let scope: String
    let resource: String
}

struct OAuthAuthenticator {
    func signIn(instanceURL: URL) async throws -> (credential: OAuthCredential, client: OpenAPIDownwriteAPIClient) {
        let client = OpenAPIDownwriteAPIClient(baseURL: instanceURL)
        let verifier = PKCE.generateVerifier()
        let challenge = PKCE.challenge(for: verifier)
        let state = UUID().uuidString
        let callback = try await authorizationCallback(instanceURL: instanceURL, challenge: challenge, state: state)
        guard callback.queryValue("state") == state else {
            throw URLError(.userAuthenticationRequired)
        }
        guard let code = callback.queryValue("code") else {
            throw URLError(.userAuthenticationRequired)
        }
        let token = try await client.exchangeAuthorizationCode(code: code, codeVerifier: verifier)
        return (
            OAuthCredential(
                accessToken: token.accessToken,
                refreshToken: token.refreshToken,
                scope: token.scope,
                resource: token.resource
            ),
            OpenAPIDownwriteAPIClient(baseURL: instanceURL, accessToken: token.accessToken)
        )
    }

    private func authorizationCallback(instanceURL: URL, challenge: String, state: String) async throws -> URL {
        let authURL = authorizationURL(instanceURL: instanceURL, challenge: challenge, state: state)
        return try await withCheckedThrowingContinuation { continuation in
            let session = ASWebAuthenticationSession(url: authURL, callbackURLScheme: "downwrite") { url, error in
                if let url {
                    continuation.resume(returning: url)
                } else {
                    continuation.resume(throwing: error ?? URLError(.userAuthenticationRequired))
                }
            }
            session.prefersEphemeralWebBrowserSession = false
            WebAuthenticationSessionRetainer.shared.retain(session)
            if !session.start() {
                WebAuthenticationSessionRetainer.shared.release(session)
                continuation.resume(throwing: URLError(.cannotLoadFromNetwork))
            }
        }
    }

    private func authorizationURL(instanceURL: URL, challenge: String, state: String) -> URL {
        var components = URLComponents(url: instanceURL.appending(path: "/oauth/authorize"), resolvingAgainstBaseURL: false)!
        components.queryItems = [
            URLQueryItem(name: "response_type", value: "code"),
            URLQueryItem(name: "client_id", value: "downwrite-ios"),
            URLQueryItem(name: "redirect_uri", value: "downwrite://oauth/callback"),
            URLQueryItem(name: "code_challenge", value: challenge),
            URLQueryItem(name: "code_challenge_method", value: "S256"),
            URLQueryItem(name: "scope", value: "workspaces:read workspaces:write documents:read documents:write sharing:write"),
            URLQueryItem(name: "resource", value: instanceURL.appending(path: "/api/v1").absoluteString),
            URLQueryItem(name: "state", value: state)
        ]
        return components.url!
    }
}

private enum PKCE {
    static func generateVerifier() -> String {
        let alphabet = Array("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~")
        return String((0..<64).map { _ in alphabet[Int.random(in: 0..<alphabet.count)] })
    }

    static func challenge(for verifier: String) -> String {
        let data = Data(verifier.utf8)
        return Data(SHA256.hash(data: data))
            .base64EncodedString()
            .replacingOccurrences(of: "+", with: "-")
            .replacingOccurrences(of: "/", with: "_")
            .replacingOccurrences(of: "=", with: "")
    }
}

private final class WebAuthenticationSessionRetainer {
    static let shared = WebAuthenticationSessionRetainer()

    private var sessions: [ASWebAuthenticationSession] = []

    func retain(_ session: ASWebAuthenticationSession) {
        sessions.append(session)
    }

    func release(_ session: ASWebAuthenticationSession) {
        sessions.removeAll { $0 === session }
    }
}

private extension URL {
    func queryValue(_ name: String) -> String? {
        URLComponents(url: self, resolvingAgainstBaseURL: false)?
            .queryItems?
            .first { $0.name == name }?
            .value
    }
}
