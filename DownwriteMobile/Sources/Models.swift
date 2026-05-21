import Foundation

struct DiscoveryResponse: Codable, Equatable {
	var name: String
	var apiBase: String
	var openAPIURL: String
	var authMethods: [String]

	enum CodingKeys: String, CodingKey {
		case name
		case apiBase = "api_base"
		case openAPIURL = "openapi_url"
		case authMethods = "auth_methods"
	}
}

struct InstanceValidationResponse: Codable, Equatable {
	var valid: Bool
	var name: String
	var apiVersion: String
	var features: [String]

	enum CodingKeys: String, CodingKey {
		case valid
		case name
		case apiVersion = "api_version"
		case features
	}
}

struct AuthResponse: Codable, Equatable {
	var session: APISession
	var user: DownwriteUser
	var workspaces: [Workspace]
	var defaultWorkspaceID: String

	enum CodingKeys: String, CodingKey {
		case session
		case user
		case workspaces
		case defaultWorkspaceID = "default_workspace_id"
	}
}

struct MeResponse: Codable, Equatable {
	var user: DownwriteUser
	var workspaces: [Workspace]
	var defaultWorkspaceID: String

	enum CodingKeys: String, CodingKey {
		case user
		case workspaces
		case defaultWorkspaceID = "default_workspace_id"
	}
}

struct APISession: Codable, Equatable {
	var token: String
	var expiresAt: Date

	enum CodingKeys: String, CodingKey {
		case token
		case expiresAt = "expires_at"
	}
}

struct DownwriteUser: Codable, Identifiable, Equatable {
	var id: String
	var name: String
	var email: String
	var createdAt: Date

	enum CodingKeys: String, CodingKey {
		case id
		case name
		case email
		case createdAt = "created_at"
	}
}

struct Workspace: Codable, Identifiable, Equatable {
	var id: String
	var name: String
	var slug: String
	var createdBy: String
	var createdAt: Date

	enum CodingKeys: String, CodingKey {
		case id
		case name
		case slug
		case createdBy = "created_by"
		case createdAt = "created_at"
	}
}

struct StackSummary: Codable, Identifiable, Equatable {
	var id: String
	var workspaceID: String
	var name: String
	var slug: String
	var isPublic: Bool
	var createdBy: String
	var createdAt: Date
	var updatedAt: Date
	var documentCount: Int
	var latestDocumentID: String
	var latestDocumentTitle: String
	var latestVersionNumber: Int
	var excerpt: String
	var color: String
	var theme: String

	enum CodingKeys: String, CodingKey {
		case id
		case workspaceID = "workspace_id"
		case name
		case slug
		case isPublic = "public"
		case createdBy = "created_by"
		case createdAt = "created_at"
		case updatedAt = "updated_at"
		case documentCount = "document_count"
		case latestDocumentID = "latest_document_id"
		case latestDocumentTitle = "latest_document_title"
		case latestVersionNumber = "latest_version_number"
		case excerpt
		case color
		case theme
	}
}

struct StackRecord: Codable, Identifiable, Equatable {
	var id: String
	var workspaceID: String
	var name: String
	var slug: String
	var isPublic: Bool
	var createdBy: String
	var createdAt: Date
	var updatedAt: Date

	enum CodingKeys: String, CodingKey {
		case id
		case workspaceID = "workspace_id"
		case name
		case slug
		case isPublic = "public"
		case createdBy = "created_by"
		case createdAt = "created_at"
		case updatedAt = "updated_at"
	}
}

struct StackDetail: Codable, Equatable {
	var stack: StackRecord
	var documents: [DocumentSummary]
}

struct DocumentSummary: Codable, Identifiable, Equatable {
	var id: String
	var workspaceID: String
	var stackID: String
	var title: String
	var slug: String
	var status: String
	var isPublic: Bool
	var createdBy: String
	var latestVersionID: String
	var stackPosition: Int
	var color: String
	var theme: String
	var createdAt: Date
	var updatedAt: Date
	var versionNumber: Int
	var excerpt: String

	enum CodingKeys: String, CodingKey {
		case id
		case workspaceID = "workspace_id"
		case stackID = "stack_id"
		case title
		case slug
		case status
		case isPublic = "public"
		case createdBy = "created_by"
		case latestVersionID = "latest_version_id"
		case stackPosition = "stack_position"
		case color
		case theme
		case createdAt = "created_at"
		case updatedAt = "updated_at"
		case versionNumber = "version_number"
		case excerpt
	}
}

struct DocumentDetail: Codable, Equatable {
	var document: DocumentRecord
	var version: DocumentVersion
}

struct DocumentRecord: Codable, Identifiable, Equatable {
	var id: String
	var workspaceID: String
	var stackID: String
	var title: String
	var slug: String
	var status: String
	var isPublic: Bool
	var createdBy: String
	var latestVersionID: String
	var stackPosition: Int
	var color: String
	var theme: String
	var createdAt: Date
	var updatedAt: Date

	enum CodingKeys: String, CodingKey {
		case id
		case workspaceID = "workspace_id"
		case stackID = "stack_id"
		case title
		case slug
		case status
		case isPublic = "public"
		case createdBy = "created_by"
		case latestVersionID = "latest_version_id"
		case stackPosition = "stack_position"
		case color
		case theme
		case createdAt = "created_at"
		case updatedAt = "updated_at"
	}
}

struct DocumentVersion: Codable, Identifiable, Equatable {
	var id: String
	var documentID: String
	var versionNumber: Int
	var contentMarkdown: String
	var contentHTML: String
	var contentText: String
	var contentHash: String
	var authoredBy: String
	var ingestSourceID: String?
	var createdAt: Date

	enum CodingKeys: String, CodingKey {
		case id
		case documentID = "document_id"
		case versionNumber = "version_number"
		case contentMarkdown = "content_markdown"
		case contentHTML = "content_html"
		case contentText = "content_text"
		case contentHash = "content_hash"
		case authoredBy = "authored_by"
		case ingestSourceID = "ingest_source_id"
		case createdAt = "created_at"
	}
}

struct AnnotationThread: Codable, Identifiable, Equatable {
	var annotation: Annotation
	var comments: [AnnotationComment]
	var id: String { annotation.id }
}

struct Annotation: Codable, Identifiable, Equatable {
	var id: String
	var documentID: String
	var documentVersionID: String
	var authorID: String
	var quote: String
	var comment: String
	var startOffset: Int
	var endOffset: Int
	var prefix: String
	var suffix: String
	var createdAt: Date

	enum CodingKeys: String, CodingKey {
		case id
		case documentID = "document_id"
		case documentVersionID = "document_version_id"
		case authorID = "author_id"
		case quote
		case comment
		case startOffset = "start_offset"
		case endOffset = "end_offset"
		case prefix
		case suffix
		case createdAt = "created_at"
	}
}

struct AnnotationComment: Codable, Identifiable, Equatable {
	var id: String
	var annotationID: String
	var authorID: String
	var body: String
	var createdAt: Date

	enum CodingKeys: String, CodingKey {
		case id
		case annotationID = "annotation_id"
		case authorID = "author_id"
		case body
		case createdAt = "created_at"
	}
}
