import Foundation
import DownwriteAPI
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
    let name: String?
    let instanceUrl: String?
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
    var accessToken: String? { get set }

    func discoverInstance() async throws -> DiscoveryMetadata
    func authStatus() async throws -> AuthStatus
    func createDevelopmentSession(identityId: String, displayName: String) async throws -> AuthResult
    func exchangeAuthorizationCode(code: String, codeVerifier: String) async throws -> OAuthTokenResponse
    func listGroups(limit: Int?, cursor: String?) async throws -> GroupList
    func getGroup(id: String) async throws -> GroupSummary
    func createGroup(name: String, description: String?, accentColor: String?) async throws -> GroupSummary
    func updateGroup(id: String, name: String?, description: String?, accentColor: String?) async throws -> GroupSummary
    func deleteGroup(id: String) async throws
    func listDocuments(groupId: String, limit: Int?, cursor: String?) async throws -> DocumentList
    func createDocument(groupId: String, title: String, content: String) async throws -> DocumentRecord
    func getDocument(id: String) async throws -> DocumentRecord
    func updateDocument(id: String, title: String?, content: String?, baseRevision: Int) async throws -> DocumentRecord
    func moveDocument(id: String, groupId: String, position: Int?, baseRevision: Int) async throws -> DocumentRecord
}

struct OpenAPIDownwriteAPIClient: DownwriteAPIClient {
    let baseURL: URL
    var accessToken: String?

    private var client: Client {
        Client(
            serverURL: baseURL,
            transport: URLSessionTransport(),
            middlewares: accessToken.map { [BearerTokenMiddleware(accessToken: $0)] } ?? []
        )
    }

    init(baseURL: URL, accessToken: String? = nil) {
        self.baseURL = baseURL
        self.accessToken = accessToken
    }

    func discoverInstance() async throws -> DiscoveryMetadata {
        let output = try await client.getWellKnownDownwrite(.init())
        return try output.ok.body.json.appModel
    }

    func authStatus() async throws -> AuthStatus {
        let output = try await client.getAuthStatus(.init())
        return try output.ok.body.json.appModel
    }

    func createDevelopmentSession(identityId: String, displayName: String) async throws -> AuthResult {
        let output = try await client.createDevelopmentSession(
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
        let output = try await client.exchangeOAuthToken(body: .urlEncodedForm(request))
        return try output.ok.body.json.appModel
    }

    func listGroups(limit: Int? = nil, cursor: String? = nil) async throws -> GroupList {
        let output = try await client.listGroups(query: .init(limit: limit, cursor: cursor))
        return try output.ok.body.json.appModel
    }

    func getGroup(id: String) async throws -> GroupSummary {
        let output = try await client.getGroup(path: .init(groupId: id))
        return try output.ok.body.json.group.appModel
    }

    func createGroup(name: String, description: String?, accentColor: String?) async throws -> GroupSummary {
        let output = try await client.createGroup(
            body: .json(.init(name: name, description: description, accentColor: accentColor))
        )
        return try output.created.body.json.group.appModel
    }

    func updateGroup(id: String, name: String?, description: String?, accentColor: String?) async throws -> GroupSummary {
        let output = try await client.updateGroup(
            path: .init(groupId: id),
            body: .json(.init(name: name, description: description, accentColor: accentColor))
        )
        return try output.ok.body.json.group.appModel
    }

    func deleteGroup(id: String) async throws {
        _ = try await client.deleteGroup(path: .init(groupId: id)).ok
    }

    func listDocuments(groupId: String, limit: Int? = nil, cursor: String? = nil) async throws -> DocumentList {
        let output = try await client.listGroupDocuments(
            path: .init(groupId: groupId),
            query: .init(limit: limit, cursor: cursor)
        )
        return try output.ok.body.json.appModel
    }

    func createDocument(groupId: String, title: String, content: String) async throws -> DocumentRecord {
        let output = try await client.createDocument(
            path: .init(groupId: groupId),
            body: .json(.init(title: title, content: content))
        )
        return try output.created.body.json.document.appModel
    }

    func getDocument(id: String) async throws -> DocumentRecord {
        let output = try await client.getDocument(path: .init(documentId: id))
        return try output.ok.body.json.document.appModel
    }

    func updateDocument(id: String, title: String?, content: String?, baseRevision: Int) async throws -> DocumentRecord {
        let output = try await client.updateDocument(
            path: .init(documentId: id),
            body: .json(.init(title: title, content: content, baseRevision: baseRevision))
        )
        return try output.ok.body.json.document.appModel
    }

    func moveDocument(id: String, groupId: String, position: Int? = nil, baseRevision: Int) async throws -> DocumentRecord {
        let output = try await client.moveDocument(
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

extension Components.Schemas.Discovery {
    var appModel: DiscoveryMetadata {
        DiscoveryMetadata(name: name, instanceUrl: instanceUrl)
    }
}

private extension Components.Schemas.AuthStatus {
    var appModel: AuthStatus {
        AuthStatus(
            authenticated: authenticated,
            bootstrapRequired: bootstrapRequired,
            configuration: configuration.appModel,
            identity: identity?.appModel
        )
    }
}

private extension Components.Schemas.AuthConfiguration {
    var appModel: AuthConfiguration {
        AuthConfiguration(
            bootstrapTokenConfigured: bootstrapTokenConfigured,
            instancePublicUrl: instancePublicUrl,
            localDevelopmentAuthEnabled: localDevelopmentAuthEnabled,
            webauthnRpId: webauthnRpId,
            webauthnRpName: webauthnRpName
        )
    }
}

private extension Components.Schemas.AuthResult {
    var appModel: AuthResult {
        AuthResult(ok: ok, identity: identity.appModel)
    }
}

private extension Components.Schemas.Identity {
    var appModel: Identity {
        Identity(id: id)
    }
}

private extension Components.Schemas.OAuthTokenResponse {
    var appModel: OAuthTokenResponse {
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

private extension Components.Schemas.GroupList {
    var appModel: GroupList {
        GroupList(groups: groups.map(\.appModel), nextCursor: nextCursor)
    }
}

private extension Components.Schemas.DocumentList {
    var appModel: DocumentList {
        DocumentList(documents: documents.map(\.appModel), nextCursor: nextCursor)
    }
}

private extension Components.Schemas.GroupSummary {
    var appModel: GroupSummary {
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

private extension Components.Schemas.DocumentSummary {
    var appModel: DocumentSummary {
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

private extension Components.Schemas.DocumentRecord {
    var appModel: DocumentRecord {
        DocumentRecord(
            id: value1.id,
            groupId: value1.groupId,
            title: value1.title,
            role: value1.role.appModel,
            position: value1.position,
            revision: value1.revision,
            createdAt: value1.createdAt,
            updatedAt: value1.updatedAt,
            content: value2.content
        )
    }
}

private extension Components.Schemas.Role {
    var appModel: Role {
        switch self {
        case .owner:
            .owner
        case .editor:
            .editor
        }
    }
}
