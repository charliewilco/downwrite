import Foundation

final class PreviewDownwriteAPIClient: DownwriteAPIClient {
    var baseURL = URL(string: "http://localhost:8787")!
    var accessToken: String?

    var groups: [GroupSummary]
    var documents: [String: DocumentRecord]
    var listGroupsError: Error?
    var getDocumentError: Error?
    var updateDocumentError: Error?
    var updateGroupError: Error?
    var moveDocumentError: Error?
    var deleteGroupError: Error?

    init(
        groups: [GroupSummary],
        documents: [String: DocumentRecord],
        listGroupsError: Error? = nil,
        getDocumentError: Error? = nil,
        updateDocumentError: Error? = nil,
        updateGroupError: Error? = nil,
        moveDocumentError: Error? = nil,
        deleteGroupError: Error? = nil
    ) {
        self.groups = groups
        self.documents = documents
        self.listGroupsError = listGroupsError
        self.getDocumentError = getDocumentError
        self.updateDocumentError = updateDocumentError
        self.updateGroupError = updateGroupError
        self.moveDocumentError = moveDocumentError
        self.deleteGroupError = deleteGroupError
    }

    func discoverInstance() async throws -> DiscoveryMetadata {
        DiscoveryMetadata(name: "Downwrite", instanceUrl: baseURL.absoluteString)
    }

    func authStatus() async throws -> AuthStatus {
        AuthStatus(
            authenticated: true,
            bootstrapRequired: false,
            configuration: AuthConfiguration(
                bootstrapTokenConfigured: false,
                instancePublicUrl: nil,
                localDevelopmentAuthEnabled: true,
                webauthnRpId: nil,
                webauthnRpName: "Downwrite"
            ),
            identity: Identity(id: "local-owner")
        )
    }

    func createDevelopmentSession(identityId: String, displayName: String) async throws -> AuthResult {
        AuthResult(ok: true, identity: Identity(id: identityId))
    }

    func exchangeAuthorizationCode(code: String, codeVerifier: String) async throws -> OAuthTokenResponse {
        OAuthTokenResponse(
            tokenType: "Bearer",
            accessToken: "preview-access",
            expiresIn: 900,
            refreshToken: "preview-refresh",
            refreshExpiresIn: 2_592_000,
            scope: "workspaces:read documents:read",
            resource: baseURL.appending(path: "/api/v1").absoluteString
        )
    }

    func listGroups(limit: Int?, cursor: String?) async throws -> GroupList {
        if let listGroupsError {
            throw listGroupsError
        }
        return GroupList(groups: groups, nextCursor: nil)
    }

    func getGroup(id: String) async throws -> GroupSummary {
        groups.first { $0.id == id }!
    }

    func createGroup(name: String, description: String?, accentColor: String?) async throws -> GroupSummary {
        let group = GroupSummary(
            id: UUID().uuidString,
            name: name,
            description: description,
            accentColor: accentColor,
            role: .owner,
            createdAt: Self.timestamp,
            updatedAt: Self.timestamp,
            documents: []
        )
        groups.append(group)
        return group
    }

    func updateGroup(id: String, name: String?, description: String?, accentColor: String?) async throws -> GroupSummary {
        if let updateGroupError {
            throw updateGroupError
        }
        guard let index = groups.firstIndex(where: { $0.id == id }) else {
            throw URLError(.badServerResponse)
        }
        groups[index].name = name ?? groups[index].name
        groups[index].description = description
        groups[index].accentColor = accentColor
        return groups[index]
    }

    func deleteGroup(id: String) async throws {
        if let deleteGroupError {
            throw deleteGroupError
        }
        groups.removeAll { $0.id == id }
    }

    func listDocuments(groupId: String, limit: Int?, cursor: String?) async throws -> DocumentList {
        DocumentList(documents: groups.first { $0.id == groupId }?.documents ?? [], nextCursor: nil)
    }

    func getDocument(id: String) async throws -> DocumentRecord {
        if let getDocumentError {
            throw getDocumentError
        }
        guard let document = documents[id] else {
            throw URLError(.badServerResponse)
        }
        return document
    }

    func updateDocument(id: String, title: String?, content: String?, baseRevision: Int) async throws -> DocumentRecord {
        if let updateDocumentError {
            throw updateDocumentError
        }
        guard var document = documents[id], document.revision == baseRevision else {
            throw DownwriteErrorEnvelope(error: "Document has changed since it was loaded", code: "conflict", status: 409)
        }
        document.title = title ?? document.title
        document.content = content ?? document.content
        document.revision += 1
        documents[id] = document
        return document
    }

    func moveDocument(id: String, groupId: String, position: Int?, baseRevision: Int) async throws -> DocumentRecord {
        if let moveDocumentError {
            throw moveDocumentError
        }
        guard var document = documents[id], document.revision == baseRevision else {
            throw DownwriteErrorEnvelope(error: "Document has changed since it was loaded", code: "conflict", status: 409)
        }
        document.groupId = groupId
        document.revision += 1
        documents[id] = document
        return document
    }
}

extension PreviewDownwriteAPIClient {
    static let timestamp = "2026-08-04T14:30:00.000Z"

    static let sample: PreviewDownwriteAPIClient = {
        let pitch = DocumentRecord(
            id: "doc-pitch",
            groupId: "group-product",
            title: "First self-hosted note",
            role: .owner,
            position: 0,
            revision: 7,
            createdAt: timestamp,
            updatedAt: timestamp,
            content: """
            # First self-hosted note

            Downwrite keeps Markdown plain enough to move between tools and structured enough for a native client.

            ## Reader shape

            - Use a calm document column.
            - Keep editing and preview close together.
            - Treat revisions as the write fence.

            > The app should feel like a notebook that understands workspaces.
            """
        )
        let release = DocumentRecord(
            id: "doc-release",
            groupId: "group-product",
            title: "Release notes",
            role: .editor,
            position: 1,
            revision: 3,
            createdAt: timestamp,
            updatedAt: timestamp,
            content: "## Release notes\n\n- Group browsing\n- Markdown rendering\n- Revision-protected editing"
        )
        let archive = DocumentRecord(
            id: "doc-archive",
            groupId: "group-archive",
            title: "Older outline",
            role: .owner,
            position: 0,
            revision: 2,
            createdAt: timestamp,
            updatedAt: timestamp,
            content: "# Older outline\n\nA short archive note."
        )
        let groups = [
            GroupSummary(
                id: "group-product",
                name: "Product",
                description: "Current Downwrite planning and release work.",
                accentColor: "#111111",
                role: .owner,
                createdAt: timestamp,
                updatedAt: timestamp,
                documents: [pitch.summary, release.summary]
            ),
            GroupSummary(
                id: "group-archive",
                name: "Archive",
                description: "Reference material that should stay findable.",
                accentColor: "#6A6A6A",
                role: .owner,
                createdAt: timestamp,
                updatedAt: timestamp,
                documents: [archive.summary]
            )
        ]
        return PreviewDownwriteAPIClient(groups: groups, documents: [
            pitch.id: pitch,
            release.id: release,
            archive.id: archive
        ])
    }()
}
