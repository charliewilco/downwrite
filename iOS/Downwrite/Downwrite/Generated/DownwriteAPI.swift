// Generated from Downwrite OpenAPI 3.1.0.
// Source operation IDs: getHealth, getDiscovery, getWellKnownDownwrite, getOAuthProtectedResourceMetadata, getOAuthAuthorizationServerMetadata, authorizeOAuthClient, approveOAuthClient, exchangeOAuthToken, revokeOAuthToken, invokeMcp, getOpenApiJson, getApiDocs, getAuthStatus, createDevelopmentSession, beginOwnerBootstrap, verifyOwnerBootstrap, beginPasskeyLogin, verifyPasskeyLogin, deleteSession, listGroups, createGroup, getGroup, updateGroup, deleteGroup, listGroupDocuments, createDocument, getDocument, updateDocument, deleteDocument, moveDocument, positionDocument, getDocumentShareState, addDocumentCollaborator, removeDocumentCollaborator, createDocumentInvitation, acceptDocumentInvitation, getDocumentInvitationPreview, revokeDocumentInvitation, createPublicLink, updatePublicLink, getManagedPublicLink, getPublicDocument.
import Foundation

enum Role: String, Codable, CaseIterable, Identifiable {
    case owner
    case editor

    var id: String { rawValue }
}

struct Identity: Codable, Equatable {
    let id: String
}

struct DownwriteErrorEnvelope: Codable, Error, Equatable {
    let error: String
    let code: String
    let status: Int
}

struct DiscoveryMetadata: Codable, Equatable {
    let name: String?
    let instanceUrl: String?
    let api: LooseJSON?
    let auth: LooseJSON?
    let clients: LooseJSON?
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

    enum CodingKeys: String, CodingKey {
        case tokenType = "token_type"
        case accessToken = "access_token"
        case expiresIn = "expires_in"
        case refreshToken = "refresh_token"
        case refreshExpiresIn = "refresh_expires_in"
        case scope
        case resource
    }
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
        DocumentSummary(id: id, groupId: groupId, title: title, role: role, position: position, revision: revision, createdAt: createdAt, updatedAt: updatedAt)
    }
}

struct GroupList: Codable, Equatable {
    let groups: [GroupSummary]
    let nextCursor: String?
}

struct GroupEnvelope: Codable, Equatable {
    let group: GroupSummary
}

struct DocumentList: Codable, Equatable {
    let documents: [DocumentSummary]
    let nextCursor: String?
}

struct DocumentEnvelope: Codable, Equatable {
    let document: DocumentRecord
}

struct OkEnvelope: Codable, Equatable {
    let ok: Bool
}

struct GroupCreate: Encodable {
    let name: String
    let description: String?
    let accentColor: String?
}

struct GroupUpdate: Encodable {
    let name: String?
    let description: String?
    let accentColor: String?
}

struct DocumentUpdate: Encodable {
    let title: String?
    let content: String?
    let baseRevision: Int
}

struct DocumentMove: Encodable {
    let groupId: String
    let position: Int?
    let baseRevision: Int
}

struct DevelopmentSessionRequest: Encodable {
    let identityId: String
    let displayName: String
}

struct LooseJSON: Codable, Equatable {
    let storage: [String: JSONValue]

    init(storage: [String: JSONValue]) {
        self.storage = storage
    }

    init(from decoder: Decoder) throws {
        let container = try decoder.singleValueContainer()
        storage = try container.decode([String: JSONValue].self)
    }

    func encode(to encoder: Encoder) throws {
        try storage.encode(to: encoder)
    }
}

enum JSONValue: Codable, Equatable {
    case string(String)
    case number(Double)
    case bool(Bool)
    case object([String: JSONValue])
    case array([JSONValue])
    case null

    init(from decoder: Decoder) throws {
        let container = try decoder.singleValueContainer()
        if container.decodeNil() {
            self = .null
        } else if let value = try? container.decode(Bool.self) {
            self = .bool(value)
        } else if let value = try? container.decode(Double.self) {
            self = .number(value)
        } else if let value = try? container.decode(String.self) {
            self = .string(value)
        } else if let value = try? container.decode([JSONValue].self) {
            self = .array(value)
        } else {
            self = .object(try container.decode([String: JSONValue].self))
        }
    }

    func encode(to encoder: Encoder) throws {
        var container = encoder.singleValueContainer()
        switch self {
        case .string(let value):
            try container.encode(value)
        case .number(let value):
            try container.encode(value)
        case .bool(let value):
            try container.encode(value)
        case .object(let value):
            try container.encode(value)
        case .array(let value):
            try container.encode(value)
        case .null:
            try container.encodeNil()
        }
    }
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
    func getDocument(id: String) async throws -> DocumentRecord
    func updateDocument(id: String, title: String?, content: String?, baseRevision: Int) async throws -> DocumentRecord
    func moveDocument(id: String, groupId: String, position: Int?, baseRevision: Int) async throws -> DocumentRecord
}

struct URLSessionDownwriteAPIClient: DownwriteAPIClient {
    let baseURL: URL
    var accessToken: String?

    private let session: URLSession
    private let decoder = JSONDecoder()
    private let encoder = JSONEncoder()

    init(baseURL: URL, accessToken: String? = nil, session: URLSession = .shared) {
        self.baseURL = baseURL
        self.accessToken = accessToken
        self.session = session
    }

    func discoverInstance() async throws -> DiscoveryMetadata {
        try await send(path: "/.well-known/downwrite", method: "GET", authenticated: false)
    }

    func authStatus() async throws -> AuthStatus {
        try await send(path: "/api/v1/auth/status", method: "GET", authenticated: false)
    }

    func createDevelopmentSession(identityId: String, displayName: String) async throws -> AuthResult {
        let body = DevelopmentSessionRequest(identityId: identityId, displayName: displayName)
        return try await send(path: "/api/v1/auth/development/session", method: "POST", body: body, authenticated: false)
    }

    func exchangeAuthorizationCode(code: String, codeVerifier: String) async throws -> OAuthTokenResponse {
        var components = URLComponents()
        components.queryItems = [
            URLQueryItem(name: "grant_type", value: "authorization_code"),
            URLQueryItem(name: "client_id", value: "downwrite-ios"),
            URLQueryItem(name: "code", value: code),
            URLQueryItem(name: "redirect_uri", value: "downwrite://oauth/callback"),
            URLQueryItem(name: "code_verifier", value: codeVerifier)
        ]
        let body = components.percentEncodedQuery?.data(using: .utf8) ?? Data()
        return try await sendRaw(path: "/oauth/token", method: "POST", body: body, contentType: "application/x-www-form-urlencoded", authenticated: false)
    }

    func listGroups(limit: Int? = nil, cursor: String? = nil) async throws -> GroupList {
        try await send(path: "/api/v1/groups", method: "GET", query: pagination(limit: limit, cursor: cursor), authenticated: true)
    }

    func getGroup(id: String) async throws -> GroupSummary {
        let envelope: GroupEnvelope = try await send(path: "/api/v1/groups/\(id)", method: "GET", authenticated: true)
        return envelope.group
    }

    func createGroup(name: String, description: String?, accentColor: String?) async throws -> GroupSummary {
        let body = GroupCreate(name: name, description: description, accentColor: accentColor)
        let envelope: GroupEnvelope = try await send(path: "/api/v1/groups", method: "POST", body: body, authenticated: true)
        return envelope.group
    }

    func updateGroup(id: String, name: String?, description: String?, accentColor: String?) async throws -> GroupSummary {
        let body = GroupUpdate(name: name, description: description, accentColor: accentColor)
        let envelope: GroupEnvelope = try await send(path: "/api/v1/groups/\(id)", method: "PATCH", body: body, authenticated: true)
        return envelope.group
    }

    func deleteGroup(id: String) async throws {
        let _: OkEnvelope = try await send(path: "/api/v1/groups/\(id)", method: "DELETE", authenticated: true)
    }

    func listDocuments(groupId: String, limit: Int? = nil, cursor: String? = nil) async throws -> DocumentList {
        try await send(path: "/api/v1/groups/\(groupId)/documents", method: "GET", query: pagination(limit: limit, cursor: cursor), authenticated: true)
    }

    func getDocument(id: String) async throws -> DocumentRecord {
        let envelope: DocumentEnvelope = try await send(path: "/api/v1/documents/\(id)", method: "GET", authenticated: true)
        return envelope.document
    }

    func updateDocument(id: String, title: String?, content: String?, baseRevision: Int) async throws -> DocumentRecord {
        let body = DocumentUpdate(title: title, content: content, baseRevision: baseRevision)
        let envelope: DocumentEnvelope = try await send(path: "/api/v1/documents/\(id)", method: "PATCH", body: body, authenticated: true)
        return envelope.document
    }

    func moveDocument(id: String, groupId: String, position: Int? = nil, baseRevision: Int) async throws -> DocumentRecord {
        let body = DocumentMove(groupId: groupId, position: position, baseRevision: baseRevision)
        let envelope: DocumentEnvelope = try await send(path: "/api/v1/documents/\(id)/move", method: "PATCH", body: body, authenticated: true)
        return envelope.document
    }

    private func send<Response: Decodable>(
        path: String,
        method: String,
        query: [URLQueryItem] = [],
        authenticated: Bool
    ) async throws -> Response {
        try await sendRaw(path: path, method: method, query: query, body: nil, contentType: nil, authenticated: authenticated)
    }

    private func send<Request: Encodable, Response: Decodable>(
        path: String,
        method: String,
        body: Request,
        authenticated: Bool
    ) async throws -> Response {
        let data = try encoder.encode(body)
        return try await sendRaw(path: path, method: method, body: data, contentType: "application/json", authenticated: authenticated)
    }

    private func sendRaw<Response: Decodable>(
        path: String,
        method: String,
        query: [URLQueryItem] = [],
        body: Data?,
        contentType: String?,
        authenticated: Bool
    ) async throws -> Response {
        var request = URLRequest(url: makeURL(path: path, query: query))
        request.httpMethod = method
        request.httpBody = body
        request.setValue("application/json", forHTTPHeaderField: "accept")
        if let contentType {
            request.setValue(contentType, forHTTPHeaderField: "content-type")
        }
        if authenticated, let accessToken {
            request.setValue("Bearer \(accessToken)", forHTTPHeaderField: "authorization")
        }

        let (data, response) = try await session.data(for: request)
        guard let httpResponse = response as? HTTPURLResponse else {
            throw URLError(.badServerResponse)
        }

        guard 200..<300 ~= httpResponse.statusCode else {
            if let envelope = try? decoder.decode(DownwriteErrorEnvelope.self, from: data) {
                throw envelope
            }
            throw URLError(.badServerResponse)
        }

        return try decoder.decode(Response.self, from: data)
    }

    private func makeURL(path: String, query: [URLQueryItem] = []) -> URL {
        var components = URLComponents(url: baseURL.appending(path: path), resolvingAgainstBaseURL: false)!
        components.queryItems = query.isEmpty ? nil : query
        return components.url!
    }

    private func pagination(limit: Int?, cursor: String?) -> [URLQueryItem] {
        [
            limit.map { URLQueryItem(name: "limit", value: String($0)) },
            cursor.map { URLQueryItem(name: "cursor", value: $0) }
        ].compactMap(\.self)
    }
}
