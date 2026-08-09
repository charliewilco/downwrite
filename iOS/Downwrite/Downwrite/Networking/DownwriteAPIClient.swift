import DownwriteAPI
import Foundation
import HTTPTypes
import OpenAPIRuntime
import OpenAPIURLSession

enum Role: String, Codable, CaseIterable, Identifiable {
    case owner
    case editor

    var id: String { rawValue }
}

struct Identity: Codable, Equatable {
    let id: String
}

struct DownwriteErrorEnvelope: Codable, LocalizedError, Equatable {
    let error: String
    let code: String
    let status: Int

    var errorDescription: String? { error }
}

struct DiscoveryMetadata: Codable, Equatable {
	let name: String
	let instanceURL: String
	let supportedAPIVersions: [String]
	let apiBaseURL: String
}

struct OAuthAuthorizationServerMetadata: Codable, Equatable {
	let issuer: String
	let authorizationEndpoint: String
	let tokenEndpoint: String
	let revocationEndpoint: String
	let responseTypesSupported: [String]
	let grantTypesSupported: [String]
	let codeChallengeMethodsSupported: [String]
	let tokenEndpointAuthMethodsSupported: [String]
	let scopesSupported: [String]
}

struct AuthConfiguration: Codable, Equatable {
    let bootstrapTokenConfigured: Bool
    let instancePublicUrl: String?
    let localDevelopmentAuthEnabled: Bool
    let webauthnRpId: String?
    let webauthnRpName: String
}

struct AuthStatus: Codable, Equatable {
    let authenticated: Bool
    let bootstrapRequired: Bool
    let configuration: AuthConfiguration
    let identity: Identity?
}

struct AuthResult: Codable, Equatable {
    let ok: Bool
    let identity: Identity
}

struct OAuthTokenResponse: Codable, Equatable {
    let tokenType: String
    let accessToken: String
    let expiresIn: Int
    let refreshToken: String
    let refreshExpiresIn: Int
    let scope: String
    let resource: String
}

enum OAuthTokenType: Equatable {
	case accessToken
	case refreshToken
}

struct GroupSummary: Codable, Equatable, Identifiable {
    let id: String
    var name: String
    var description: String?
    var accentColor: String?
    let role: Role
    let createdAt: String
    let updatedAt: String
    var documents: [DocumentSummary]
}

struct DocumentSummary: Codable, Equatable, Identifiable {
    let id: String
    var groupId: String
    var title: String
    let role: Role
    var position: Int
    var revision: Int
    let createdAt: String
    let updatedAt: String
}

struct DocumentRecord: Codable, Equatable, Identifiable {
    let id: String
    var groupId: String
    var title: String
    let role: Role
    var position: Int
    var revision: Int
    let createdAt: String
    let updatedAt: String
    var content: String

    var summary: DocumentSummary {
        DocumentSummary(
            id: id,
            groupId: groupId,
            title: title,
            role: role,
            position: position,
            revision: revision,
            createdAt: createdAt,
            updatedAt: updatedAt
        )
    }
}

struct GroupList: Codable, Equatable {
    let groups: [GroupSummary]
    let nextCursor: String?
}

struct DocumentList: Codable, Equatable {
    let documents: [DocumentSummary]
    let nextCursor: String?
}

protocol DownwriteAPIClient {
    var baseURL: URL { get }

    func discoverInstance() async throws -> DiscoveryMetadata
	func oauthAuthorizationServerMetadata() async throws -> OAuthAuthorizationServerMetadata
    func authStatus() async throws -> AuthStatus
    func createDevelopmentSession(identityId: String, displayName: String) async throws -> AuthResult
    func exchangeAuthorizationCode(code: String, codeVerifier: String) async throws -> OAuthTokenResponse
	func refreshOAuthToken(_ refreshToken: String) async throws -> OAuthTokenResponse
	func revokeOAuthToken(_ token: String, type: OAuthTokenType) async throws
    func listGroups(limit: Int?, cursor: String?) async throws -> GroupList
    func getGroup(id: String) async throws -> GroupSummary
    func createGroup(name: String, description: String?, accentColor: String?) async throws -> GroupSummary
    func updateGroup(id: String, name: String?, description: String?, accentColor: String?) async throws -> GroupSummary
    func deleteGroup(id: String) async throws
    func listDocuments(groupId: String, limit: Int?, cursor: String?) async throws -> DocumentList
    func createDocument(groupId: String, title: String, content: String) async throws -> DocumentRecord
    func getDocument(id: String) async throws -> DocumentRecord
    func updateDocument(id: String, title: String?, content: String?, baseRevision: Int) async throws -> DocumentRecord
	func deleteDocument(id: String, baseRevision: Int) async throws
	func documentExists(id: String) async throws -> Bool
    func moveDocument(id: String, groupId: String, position: Int?, baseRevision: Int) async throws -> DocumentRecord
}

final class OpenAPIDownwriteAPIClient: DownwriteAPIClient {
    let baseURL: URL
	private let accessToken: String?
	private let tokenManager: OAuthTokenManager?
	private let localDevelopmentURLSession: LocalDevelopmentURLSession?
	private let transport: URLSessionTransport

	private func client(accessToken: String? = nil) -> Client {
        var middlewares: [any ClientMiddleware] = []
        if let accessToken {
            middlewares.append(BearerTokenMiddleware(accessToken: accessToken))
        }
        if localDevelopmentURLSession != nil {
            middlewares.append(LocalDevelopmentOriginMiddleware(origin: baseURL.absoluteString))
        }
        return Client(
            serverURL: baseURL,
            transport: transport,
            middlewares: middlewares
        )
    }

    init(
        baseURL: URL,
        accessToken: String? = nil,
        tokenManager: OAuthTokenManager? = nil,
        localDevelopmentSession: Bool = false
    ) {
        self.baseURL = baseURL
        self.accessToken = accessToken
		self.tokenManager = tokenManager
		if localDevelopmentSession {
			let localDevelopmentURLSession = LocalDevelopmentURLSession()
			self.localDevelopmentURLSession = localDevelopmentURLSession
			transport = URLSessionTransport(
				configuration: .init(session: localDevelopmentURLSession.urlSession)
			)
		}
		else {
			self.localDevelopmentURLSession = nil
			let configuration = URLSessionConfiguration.ephemeral
			configuration.httpCookieStorage = nil
			configuration.httpShouldSetCookies = false
			transport = URLSessionTransport(
				configuration: .init(session: URLSession(configuration: configuration))
			)
		}
	}

	func signOutLocalDevelopmentSession() async {
		await localDevelopmentURLSession?.signOut()
	}

	private func authenticatedClient() async throws -> Client {
		if let tokenManager {
			return client(accessToken: try await tokenManager.validAccessToken())
		}
		return client(accessToken: accessToken)
    }

    func discoverInstance() async throws -> DiscoveryMetadata {
		let output = try await client().getWellKnownDownwrite(.init())
		return try output.ok.body.json.appModel
	}

	func oauthAuthorizationServerMetadata() async throws -> OAuthAuthorizationServerMetadata {
		let output = try await client().getOAuthAuthorizationServerMetadata(.init())
        return try output.ok.body.json.appModel
    }

    func authStatus() async throws -> AuthStatus {
		let output = try await client().getAuthStatus(.init())
        return try output.ok.body.json.appModel
    }

    func createDevelopmentSession(identityId: String, displayName: String) async throws -> AuthResult {
		let output = try await client().createDevelopmentSession(
            body: .json(.init(identityId: identityId, displayName: displayName))
        )
        return try output.ok.body.json.appModel
    }

    func exchangeAuthorizationCode(code: String, codeVerifier: String) async throws -> OAuthTokenResponse {
        let request = Components.Schemas.OAuthTokenRequest(
            grant_type: .authorization_code,
            client_id: "downwrite-ios",
            code: code,
            redirect_uri: "downwrite://oauth/callback",
            code_verifier: codeVerifier
        )
		let output = try await client().exchangeOAuthToken(body: .urlEncodedForm(request))
        return try output.ok.body.json.appModel
    }

	func refreshOAuthToken(_ refreshToken: String) async throws -> OAuthTokenResponse {
		let request = Components.Schemas.OAuthTokenRequest(
			grant_type: .refresh_token,
			client_id: InstanceConfiguration.clientID,
			refresh_token: refreshToken
		)
		let output = try await client().exchangeOAuthToken(body: .urlEncodedForm(request))
		return try output.ok.body.json.appModel
	}

	func revokeOAuthToken(_ token: String, type: OAuthTokenType) async throws {
		let tokenTypeHint: Components.Schemas.OAuthRevokeRequest.token_type_hintPayload =
			switch type {
			case .accessToken:
				.access_token
			case .refreshToken:
				.refresh_token
			}
		let request = Components.Schemas.OAuthRevokeRequest(
			token: token,
			token_type_hint: tokenTypeHint
		)
		_ = try await client().revokeOAuthToken(body: .urlEncodedForm(request)).ok
	}

    func listGroups(limit: Int? = nil, cursor: String? = nil) async throws -> GroupList {
		let output = try await authenticatedClient().listGroups(query: .init(limit: limit, cursor: cursor))
        return try output.ok.body.json.appModel
    }

    func getGroup(id: String) async throws -> GroupSummary {
		let output = try await authenticatedClient().getGroup(path: .init(groupId: id))
        return try output.ok.body.json.group.appModel
    }

    func createGroup(name: String, description: String?, accentColor: String?) async throws -> GroupSummary {
		let output = try await authenticatedClient().createGroup(
            body: .json(.init(name: name, description: description, accentColor: accentColor))
        )
        return try output.created.body.json.group.appModel
    }

    func updateGroup(id: String, name: String?, description: String?, accentColor: String?) async throws -> GroupSummary {
		let output = try await authenticatedClient().updateGroup(
            path: .init(groupId: id),
            body: .json(.init(name: name, description: description, accentColor: accentColor))
        )
        return try output.ok.body.json.group.appModel
    }

    func deleteGroup(id: String) async throws {
		_ = try await authenticatedClient().deleteGroup(path: .init(groupId: id)).ok
    }

    func listDocuments(groupId: String, limit: Int? = nil, cursor: String? = nil) async throws -> DocumentList {
		let output = try await authenticatedClient().listGroupDocuments(
            path: .init(groupId: groupId),
            query: .init(limit: limit, cursor: cursor)
        )
        return try output.ok.body.json.appModel
    }

    func createDocument(groupId: String, title: String, content: String) async throws -> DocumentRecord {
		let output = try await authenticatedClient().createDocument(
            path: .init(groupId: groupId),
            body: .json(.init(title: title, content: content))
        )
        return try output.created.body.json.document.appModel
    }

    func getDocument(id: String) async throws -> DocumentRecord {
		let output = try await authenticatedClient().getDocument(path: .init(documentId: id))
        return try output.ok.body.json.document.appModel
    }

    func updateDocument(id: String, title: String?, content: String?, baseRevision: Int) async throws -> DocumentRecord {
		let output = try await authenticatedClient().updateDocument(
            path: .init(documentId: id),
            body: .json(.init(title: title, content: content, baseRevision: baseRevision))
        )
        return try output.ok.body.json.document.appModel
    }

	func deleteDocument(id: String, baseRevision: Int) async throws {
		let output = try await authenticatedClient().deleteDocument(
			path: .init(documentId: id),
			query: .init(baseRevision: baseRevision)
		)
		switch output {
		case .ok:
			return
		case .forbidden(let response):
			throw try response.body.json.appError
		case .conflict(let response):
			throw try response.body.json.appError
		case .preconditionRequired(let response):
			throw try response.body.json.appError
		case .undocumented(let statusCode, _):
			throw DownwriteErrorEnvelope(
				error: "Delete request failed.",
				code: "unexpected_response",
				status: statusCode
			)
		}
	}

	func documentExists(id: String) async throws -> Bool {
		let output = try await authenticatedClient().getDocument(path: .init(documentId: id))
		switch output {
		case .ok:
			return true
		case .notFound:
			return false
		case .undocumented:
			_ = try output.ok
			return false
		}
	}

    func moveDocument(id: String, groupId: String, position: Int? = nil, baseRevision: Int) async throws -> DocumentRecord {
		let output = try await authenticatedClient().moveDocument(
            path: .init(documentId: id),
            body: .json(.init(groupId: groupId, position: position, baseRevision: baseRevision))
        )
        return try output.ok.body.json.document.appModel
    }
}

struct BearerTokenMiddleware: ClientMiddleware {
    let accessToken: String

    func intercept(
        _ request: HTTPRequest,
        body: HTTPBody?,
        baseURL: URL,
        operationID: String,
        next: @concurrent @Sendable (HTTPRequest, HTTPBody?, URL) async throws -> (HTTPResponse, HTTPBody?)
    ) async throws -> (HTTPResponse, HTTPBody?) {
        var request = request
        request.headerFields[.authorization] = "Bearer \(accessToken)"
        return try await next(request, body, baseURL)
    }
}

struct LocalDevelopmentOriginMiddleware: ClientMiddleware {
    let origin: String

    func intercept(
        _ request: HTTPRequest,
        body: HTTPBody?,
        baseURL: URL,
        operationID: String,
        next: @concurrent @Sendable (HTTPRequest, HTTPBody?, URL) async throws -> (HTTPResponse, HTTPBody?)
    ) async throws -> (HTTPResponse, HTTPBody?) {
        var request = request
        switch request.method {
        case .post, .put, .patch, .delete:
            request.headerFields[.origin] = origin
        default:
            break
        }
        return try await next(request, body, baseURL)
    }
}

extension Components.Schemas.Discovery {
    var appModel: DiscoveryMetadata {
		DiscoveryMetadata(
			name: name,
			instanceURL: instanceUrl,
			supportedAPIVersions: api.supportedVersions,
			apiBaseURL: api.baseUrl
		)
	}
}

extension Components.Schemas.OAuthAuthorizationServerMetadata {
	fileprivate var appModel: OAuthAuthorizationServerMetadata {
		OAuthAuthorizationServerMetadata(
			issuer: issuer,
			authorizationEndpoint: authorization_endpoint,
			tokenEndpoint: token_endpoint,
			revocationEndpoint: revocation_endpoint,
			responseTypesSupported: response_types_supported,
			grantTypesSupported: grant_types_supported,
			codeChallengeMethodsSupported: code_challenge_methods_supported,
			tokenEndpointAuthMethodsSupported: token_endpoint_auth_methods_supported,
			scopesSupported: scopes_supported
		)
    }
}

extension Components.Schemas.AuthStatus {
	fileprivate var appModel: AuthStatus {
        AuthStatus(
            authenticated: authenticated,
            bootstrapRequired: bootstrapRequired,
            configuration: configuration.appModel,
            identity: identity?.appModel
        )
    }
}

extension Components.Schemas.AuthConfiguration {
	fileprivate var appModel: AuthConfiguration {
        AuthConfiguration(
            bootstrapTokenConfigured: bootstrapTokenConfigured,
            instancePublicUrl: instancePublicUrl,
            localDevelopmentAuthEnabled: localDevelopmentAuthEnabled,
            webauthnRpId: webauthnRpId,
            webauthnRpName: webauthnRpName
        )
    }
}

extension Components.Schemas.AuthResult {
	fileprivate var appModel: AuthResult {
        AuthResult(ok: ok, identity: identity.appModel)
    }
}

extension Components.Schemas.Identity {
	fileprivate var appModel: Identity {
        Identity(id: id)
    }
}

extension Components.Schemas.OAuthTokenResponse {
	fileprivate var appModel: OAuthTokenResponse {
        OAuthTokenResponse(
            tokenType: token_type.rawValue,
            accessToken: access_token,
            expiresIn: expires_in,
            refreshToken: refresh_token,
            refreshExpiresIn: refresh_expires_in,
            scope: scope,
            resource: resource
        )
    }
}

extension Components.Schemas.GroupList {
	fileprivate var appModel: GroupList {
        GroupList(groups: groups.map(\.appModel), nextCursor: nextCursor)
    }
}

extension Components.Schemas.DocumentList {
	fileprivate var appModel: DocumentList {
        DocumentList(documents: documents.map(\.appModel), nextCursor: nextCursor)
    }
}

extension Components.Schemas.GroupSummary {
	fileprivate var appModel: GroupSummary {
        GroupSummary(
            id: id,
            name: name,
            description: description,
            accentColor: accentColor,
            role: role.appModel,
            createdAt: createdAt,
            updatedAt: updatedAt,
            documents: documents.map(\.appModel)
        )
    }
}

extension Components.Schemas.DocumentSummary {
	fileprivate var appModel: DocumentSummary {
        DocumentSummary(
            id: id,
            groupId: groupId,
            title: title,
            role: role.appModel,
            position: position,
            revision: revision,
            createdAt: createdAt,
            updatedAt: updatedAt
        )
    }
}

extension Components.Schemas.DocumentRecord {
	fileprivate var appModel: DocumentRecord {
        DocumentRecord(
			id: id,
			groupId: groupId,
			title: title,
			role: role.appModel,
			position: position,
			revision: revision,
			createdAt: createdAt,
			updatedAt: updatedAt,
			content: content
        )
    }
}

extension Components.Schemas._Error {
	fileprivate var appError: DownwriteErrorEnvelope {
		DownwriteErrorEnvelope(error: error, code: code, status: status)
	}
}

extension Components.Schemas.Role {
	fileprivate var appModel: Role {
        switch self {
        case .owner:
            .owner
        case .editor:
            .editor
        }
    }
}
