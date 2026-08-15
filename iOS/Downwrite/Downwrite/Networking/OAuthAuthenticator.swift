import AuthenticationServices
import CryptoKit
import Foundation
import UIKit

@MainActor
final class OAuthAuthenticator: NSObject, ASWebAuthenticationPresentationContextProviding {
	private var activeSession: ASWebAuthenticationSession?

	func signIn(configuration: InstanceConfiguration) async throws -> OAuthTokenResponse {
		let client = OpenAPIDownwriteAPIClient(baseURL: configuration.instanceURL)
        let verifier = PKCE.generateVerifier()
        let challenge = PKCE.challenge(for: verifier)
        let state = UUID().uuidString
		let callback = try await authorizationCallback(
			configuration: configuration,
			challenge: challenge,
			state: state
		)
		guard callback.scheme == InstanceConfiguration.callbackURL.scheme,
			callback.host == InstanceConfiguration.callbackURL.host,
			callback.path == InstanceConfiguration.callbackURL.path
		else {
			throw OAuthAuthenticationError.invalidCallback
		}
        guard callback.queryValue("state") == state else {
			throw OAuthAuthenticationError.invalidState
        }
        guard let code = callback.queryValue("code") else {
			throw OAuthAuthenticationError.missingCode
		}
		return try await client.exchangeAuthorizationCode(code: code, codeVerifier: verifier)
    }

	private func authorizationCallback(
		configuration: InstanceConfiguration,
		challenge: String,
		state: String
	) async throws -> URL {
		guard activeSession == nil else {
			throw URLError(.cannotLoadFromNetwork)
		}
		let authURL = authorizationURL(configuration: configuration, challenge: challenge, state: state)
        return try await withCheckedThrowingContinuation { continuation in
            let session = ASWebAuthenticationSession(url: authURL, callbackURLScheme: "downwrite") { url, error in
				Task { @MainActor [weak self] in
					self?.activeSession = nil
                if let url {
                    continuation.resume(returning: url)
					}
					else {
                    continuation.resume(throwing: error ?? URLError(.userAuthenticationRequired))
                }
            }
			}
            session.prefersEphemeralWebBrowserSession = false
			session.presentationContextProvider = self
			activeSession = session
            if !session.start() {
				activeSession = nil
                continuation.resume(throwing: URLError(.cannotLoadFromNetwork))
            }
        }
    }

	private func authorizationURL(configuration: InstanceConfiguration, challenge: String, state: String) -> URL {
		var components = URLComponents(url: configuration.authorizationEndpoint, resolvingAgainstBaseURL: false)!
        components.queryItems = [
            URLQueryItem(name: "response_type", value: "code"),
			URLQueryItem(name: "client_id", value: InstanceConfiguration.clientID),
			URLQueryItem(name: "redirect_uri", value: InstanceConfiguration.callbackURL.absoluteString),
            URLQueryItem(name: "code_challenge", value: challenge),
            URLQueryItem(name: "code_challenge_method", value: "S256"),
			URLQueryItem(name: "scope", value: InstanceConfiguration.requestedScopes.joined(separator: " ")),
			URLQueryItem(name: "resource", value: configuration.apiBaseURL.absoluteString),
			URLQueryItem(name: "state", value: state),
        ]
        return components.url!
    }

	func presentationAnchor(for session: ASWebAuthenticationSession) -> ASPresentationAnchor {
		let windowScenes = UIApplication.shared.connectedScenes.compactMap { $0 as? UIWindowScene }
		if let window =
			windowScenes
			.flatMap(\.windows)
			.first(where: \.isKeyWindow) ?? windowScenes.first?.windows.first
		{
			return window
		}
		guard let windowScene = windowScenes.first else {
			fatalError("Downwrite requires an active window scene for browser authentication.")
		}
		return ASPresentationAnchor(windowScene: windowScene)
	}
}

enum OAuthAuthenticationError: LocalizedError, Equatable {
	case invalidCallback
	case invalidState
	case missingCode

	var errorDescription: String? {
		switch self {
		case .invalidCallback:
			"The instance returned an invalid OAuth callback."
		case .invalidState:
			"The OAuth response could not be verified."
		case .missingCode:
			"The instance did not return an OAuth authorization code."
		}
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

extension URL {
	fileprivate func queryValue(_ name: String) -> String? {
        URLComponents(url: self, resolvingAgainstBaseURL: false)?
            .queryItems?
            .first { $0.name == name }?
            .value
    }
}
