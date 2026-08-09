import Foundation

struct PreviewDocumentUpdate: Equatable {
	let id: String
	let title: String?
	let content: String?
	let baseRevision: Int
}

struct PreviewDocumentMove: Equatable {
	let id: String
	let groupID: String
	let position: Int?
	let baseRevision: Int
}

struct PreviewInvitationInput: Equatable {
	let documentID: String
	let identityID: String
	let role: Role
}

struct PreviewPublicLinkInput: Equatable {
	let documentID: String
	let label: String?
}

struct PreviewPublicLinkUpdate: Equatable {
	let id: String
	let label: String?
	let active: Bool?
}

struct PreviewCollaboratorRemoval: Equatable {
	let documentID: String
	let identityID: String
}

final class PreviewDownwriteAPIClient: DownwriteAPIClient {
    var baseURL = URL(string: "http://localhost:8787")!

    var groups: [GroupSummary]
    var documents: [String: DocumentRecord]
	var shareStates: [String: DocumentShareState]
    var listGroupsError: Error?
    var getDocumentError: Error?
    var createGroupError: Error?
    var createDocumentError: Error?
	var deleteDocumentError: Error?
	var deleteDocumentCommittedError: Error?
	var documentExistsError: Error?
    var updateDocumentError: Error?
	var updateDocumentDelay: Duration?
	var updateDocumentCallCount = 0
	var updateDocumentInputs: [PreviewDocumentUpdate] = []
    var updateGroupError: Error?
	var moveDocumentError: Error?
	var moveDocumentCommittedError: Error?
	var moveDocumentCommittedTitle: String?
	var moveDocumentCommittedContent: String?
	var moveDocumentCommittedRevisionIncrement = 0
	var moveDocumentDelay: Duration?
	var moveDocumentCallCount = 0
	var moveDocumentInputs: [PreviewDocumentMove] = []
    var deleteGroupError: Error?
	var refreshTokenError: Error?
	var refreshTokenDelay: Duration?
	var ignoresRefreshCancellation = false
	var refreshTokenCallCount = 0
	var revokedTokens: [(token: String, type: OAuthTokenType)] = []
	var listGroupsDelay: Duration?
	var createGroupDelay: Duration?
	var createGroupCallCount = 0
	var deleteDocumentDelay: Duration?
	var deleteDocumentCallCount = 0
	var shareStateError: Error?
	var shareStateDelay: Duration?
	var sharingMutationError: Error?
	var sharingMutationDelay: Duration?
	var invitationCommittedError: Error?
	var publicLinkCommittedError: Error?
	var publicLinkUpdateCommittedError: Error?
	var invitationInputs: [PreviewInvitationInput] = []
	var publicLinkInputs: [PreviewPublicLinkInput] = []
	var publicLinkUpdates: [PreviewPublicLinkUpdate] = []
	var collaboratorRemovals: [PreviewCollaboratorRemoval] = []

    init(
        groups: [GroupSummary],
        documents: [String: DocumentRecord],
		shareStates: [String: DocumentShareState] = [:],
        listGroupsError: Error? = nil,
        getDocumentError: Error? = nil,
        createDocumentError: Error? = nil,
        updateDocumentError: Error? = nil,
        updateGroupError: Error? = nil,
        moveDocumentError: Error? = nil,
        deleteGroupError: Error? = nil
    ) {
        self.groups = groups
        self.documents = documents
		self.shareStates = shareStates
        self.listGroupsError = listGroupsError
        self.getDocumentError = getDocumentError
        self.createDocumentError = createDocumentError
        self.updateDocumentError = updateDocumentError
        self.updateGroupError = updateGroupError
        self.moveDocumentError = moveDocumentError
        self.deleteGroupError = deleteGroupError
    }

    func discoverInstance() async throws -> DiscoveryMetadata {
		DiscoveryMetadata(
			name: "downwrite",
			instanceURL: baseURL.absoluteString,
			supportedAPIVersions: ["v1"],
			apiBaseURL: baseURL.appending(path: "/api/v1").absoluteString
		)
	}

	func oauthAuthorizationServerMetadata() async throws -> OAuthAuthorizationServerMetadata {
		OAuthAuthorizationServerMetadata(
			issuer: baseURL.absoluteString,
			authorizationEndpoint: baseURL.appending(path: "/oauth/authorize").absoluteString,
			tokenEndpoint: baseURL.appending(path: "/oauth/token").absoluteString,
			revocationEndpoint: baseURL.appending(path: "/oauth/revoke").absoluteString,
			responseTypesSupported: ["code"],
			grantTypesSupported: ["authorization_code", "refresh_token"],
			codeChallengeMethodsSupported: ["S256"],
			tokenEndpointAuthMethodsSupported: ["none"],
			scopesSupported: InstanceConfiguration.requestedScopes
		)
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
		return OAuthTokenResponse(
            tokenType: "Bearer",
            accessToken: "preview-access",
            expiresIn: 900,
            refreshToken: "preview-refresh",
            refreshExpiresIn: 2_592_000,
            scope: "workspaces:read documents:read",
            resource: baseURL.appending(path: "/api/v1").absoluteString
        )
    }

	func refreshOAuthToken(_ refreshToken: String) async throws -> OAuthTokenResponse {
		refreshTokenCallCount += 1
		if let refreshTokenDelay {
			if ignoresRefreshCancellation {
				try? await Task.sleep(for: refreshTokenDelay)
			}
			else {
				try await Task.sleep(for: refreshTokenDelay)
			}
		}
		if let refreshTokenError {
			throw refreshTokenError
		}
		return OAuthTokenResponse(
			tokenType: "Bearer",
			accessToken: "preview-refreshed-access",
			expiresIn: 900,
			refreshToken: "preview-rotated-refresh",
			refreshExpiresIn: 2_592_000,
			scope: InstanceConfiguration.requestedScopes.joined(separator: " "),
			resource: baseURL.appending(path: "/api/v1").absoluteString
		)
	}

	func revokeOAuthToken(_ token: String, type: OAuthTokenType) async throws {
		revokedTokens.append((token, type))
	}

    func listGroups(limit: Int?, cursor: String?) async throws -> GroupList {
		let groups = groups
		if let listGroupsDelay {
			try await Task.sleep(for: listGroupsDelay)
		}
        if let listGroupsError {
            throw listGroupsError
        }
        return GroupList(groups: groups, nextCursor: nil)
    }

    func getGroup(id: String) async throws -> GroupSummary {
        groups.first { $0.id == id }!
    }

    func createGroup(name: String, description: String?, accentColor: String?) async throws -> GroupSummary {
		createGroupCallCount += 1
		if let createGroupDelay {
			try await Task.sleep(for: createGroupDelay)
		}
        if let createGroupError {
            throw createGroupError
        }
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

    func createDocument(groupId: String, title: String, content: String) async throws -> DocumentRecord {
        if let createDocumentError {
            throw createDocumentError
        }
        guard let groupIndex = groups.firstIndex(where: { $0.id == groupId }) else {
            throw URLError(.badServerResponse)
        }
        let document = DocumentRecord(
            id: UUID().uuidString,
            groupId: groupId,
            title: title,
            role: .owner,
            position: groups[groupIndex].documents.count,
            revision: 1,
            createdAt: Self.timestamp,
            updatedAt: Self.timestamp,
            content: content
        )
        documents[document.id] = document
        groups[groupIndex].documents.append(document.summary)
        return document
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
		updateDocumentCallCount += 1
		updateDocumentInputs.append(
			PreviewDocumentUpdate(
				id: id,
				title: title,
				content: content,
				baseRevision: baseRevision
			)
		)
		let error = updateDocumentError
		if let updateDocumentDelay {
			try await Task.sleep(for: updateDocumentDelay)
		}
		if let error {
			throw error
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

	func deleteDocument(id: String, baseRevision: Int) async throws {
		deleteDocumentCallCount += 1
		if let deleteDocumentDelay {
			try await Task.sleep(for: deleteDocumentDelay)
		}
		if let deleteDocumentError {
			throw deleteDocumentError
		}
		guard documents[id]?.revision == baseRevision else {
			throw DownwriteErrorEnvelope(
				error: "Document has changed since it was loaded",
				code: "conflict",
				status: 409
			)
		}
		removeDocument(id: id)
		if let deleteDocumentCommittedError {
			throw deleteDocumentCommittedError
		}
	}

	func documentExists(id: String) async throws -> Bool {
		if let documentExistsError {
			throw documentExistsError
		}
		return documents[id] != nil
	}

	private func removeDocument(id: String) {
		documents[id] = nil
		for index in groups.indices {
			groups[index].documents.removeAll { $0.id == id }
		}
	}

    func moveDocument(id: String, groupId: String, position: Int?, baseRevision: Int) async throws -> DocumentRecord {
		moveDocumentCallCount += 1
		moveDocumentInputs.append(
			PreviewDocumentMove(id: id, groupID: groupId, position: position, baseRevision: baseRevision)
		)
		let error = moveDocumentError
		if let moveDocumentDelay {
			try await Task.sleep(for: moveDocumentDelay)
		}
		if let error {
			throw error
		}
        guard var document = documents[id], document.revision == baseRevision else {
            throw DownwriteErrorEnvelope(error: "Document has changed since it was loaded", code: "conflict", status: 409)
        }
        document.groupId = groupId
		document.position = position ?? groups.first(where: { $0.id == groupId })?.documents.count ?? 0
        document.revision += 1
        documents[id] = document
		for index in groups.indices {
			groups[index].documents.removeAll { $0.id == id }
			if groups[index].id == groupId {
				groups[index].documents.append(document.summary)
			}
		}
		if let moveDocumentCommittedError {
			if moveDocumentCommittedTitle != nil
				|| moveDocumentCommittedContent != nil
				|| moveDocumentCommittedRevisionIncrement > 0
			{
				document.title = moveDocumentCommittedTitle ?? document.title
				document.content = moveDocumentCommittedContent ?? document.content
				document.revision += moveDocumentCommittedRevisionIncrement
				documents[id] = document
				for index in groups.indices where groups[index].id == groupId {
					if let documentIndex = groups[index].documents.firstIndex(where: { $0.id == id }) {
						groups[index].documents[documentIndex] = document.summary
					}
				}
			}
			throw moveDocumentCommittedError
		}
        return document
    }

	func getDocumentShareState(id: String) async throws -> DocumentShareState {
		let shareState = shareState(for: id)
		if let shareStateDelay {
			try await Task.sleep(for: shareStateDelay)
		}
		if let shareStateError {
			throw shareStateError
		}
		return shareState
	}

	func createDocumentInvitation(
		documentID: String,
		identityID: String,
		role: Role
	) async throws -> DocumentInvitation {
		invitationInputs.append(
			PreviewInvitationInput(documentID: documentID, identityID: identityID, role: role)
		)
		try await waitForSharingMutation()
		let invitation = DocumentInvitation(
			id: UUID().uuidString,
			documentID: documentID,
			invitedIdentityID: identityID,
			role: role,
			token: "invite-\(UUID().uuidString)",
			status: .pending,
			createdByIdentityID: "local-owner",
			createdAt: Self.timestamp,
			acceptedAt: nil,
			revokedAt: nil
		)
		var shareState = shareState(for: documentID)
		shareState.invitations.append(invitation)
		shareStates[documentID] = shareState
		if let invitationCommittedError {
			throw invitationCommittedError
		}
		return invitation
	}

	func revokeDocumentInvitation(id: String) async throws {
		try await waitForSharingMutation()
		for documentID in Array(shareStates.keys) {
			shareStates[documentID]?.invitations.removeAll { $0.id == id }
		}
	}

	func removeDocumentCollaborator(documentID: String, identityID: String) async throws {
		collaboratorRemovals.append(
			PreviewCollaboratorRemoval(documentID: documentID, identityID: identityID)
		)
		try await waitForSharingMutation()
		shareStates[documentID]?.collaborators.removeAll { $0.identityID == identityID }
	}

	func createPublicLink(documentID: String, label: String?) async throws -> DocumentPublicLink {
		publicLinkInputs.append(PreviewPublicLinkInput(documentID: documentID, label: label))
		try await waitForSharingMutation()
		let publicLink = DocumentPublicLink(
			id: UUID().uuidString,
			documentID: documentID,
			token: "public-\(UUID().uuidString)",
			label: label,
			active: true,
			createdAt: Self.timestamp
		)
		var shareState = shareState(for: documentID)
		shareState.publicLinks.append(publicLink)
		shareStates[documentID] = shareState
		if let publicLinkCommittedError {
			throw publicLinkCommittedError
		}
		return publicLink
	}

	func updatePublicLink(
		id: String,
		label: String?,
		active: Bool?
	) async throws -> DocumentPublicLink {
		publicLinkUpdates.append(PreviewPublicLinkUpdate(id: id, label: label, active: active))
		try await waitForSharingMutation()
		for documentID in Array(shareStates.keys) {
			guard let index = shareStates[documentID]?.publicLinks.firstIndex(where: { $0.id == id }),
				let existing = shareStates[documentID]?.publicLinks[index]
			else {
				continue
			}
			let updated = DocumentPublicLink(
				id: existing.id,
				documentID: existing.documentID,
				token: existing.token,
				label: label ?? existing.label,
				active: active ?? existing.active,
				createdAt: existing.createdAt
			)
			shareStates[documentID]?.publicLinks[index] = updated
			if let publicLinkUpdateCommittedError {
				throw publicLinkUpdateCommittedError
			}
			return updated
		}
		throw URLError(.resourceUnavailable)
	}

	private func shareState(for documentID: String) -> DocumentShareState {
		shareStates[documentID] ?? DocumentShareState(
			documentID: documentID,
			collaborators: [],
			invitations: [],
			publicLinks: []
		)
	}

	private func waitForSharingMutation() async throws {
		if let sharingMutationDelay {
			try await Task.sleep(for: sharingMutationDelay)
		}
		if let sharingMutationError {
			throw sharingMutationError
		}
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
			),
        ]
		return PreviewDownwriteAPIClient(
			groups: groups,
			documents: [
            pitch.id: pitch,
            release.id: release,
				archive.id: archive,
			]
		)
    }()
}
