import Foundation

struct DocumentCollaborator: Codable, Equatable, Identifiable {
	var id: String { identityID }

	let identityID: String
	let displayName: String?
	let role: Role
	let createdAt: String
}

enum DocumentInvitationStatus: String, Codable, Equatable {
	case pending
	case accepted
	case revoked
}

struct DocumentInvitation: Codable, Equatable, Identifiable {
	let id: String
	let documentID: String
	let invitedIdentityID: String
	let role: Role
	let token: String
	let status: DocumentInvitationStatus
	let createdByIdentityID: String
	let createdAt: String
	let acceptedAt: String?
	let revokedAt: String?
}

struct DocumentPublicLink: Codable, Equatable, Identifiable {
	let id: String
	let documentID: String
	let token: String
	let label: String?
	let active: Bool
	let createdAt: String
}

struct DocumentShareState: Codable, Equatable {
	let documentID: String
	var collaborators: [DocumentCollaborator]
	var invitations: [DocumentInvitation]
	var publicLinks: [DocumentPublicLink]
}
