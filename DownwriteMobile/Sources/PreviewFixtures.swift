import Foundation

enum PreviewFixtures {
	static let date = Date(timeIntervalSince1970: 1_770_000_000)

	static let user = DownwriteUser(
		id: "user-1",
		name: "Charlie",
		email: "charlie@example.com",
		createdAt: date
	)

	static let workspace = Workspace(
		id: "workspace-1",
		name: "Charlie workspace",
		slug: "charlie",
		createdBy: user.id,
		createdAt: date
	)

	static let stack = StackSummary(
		id: "stack-1",
		workspaceID: workspace.id,
		name: "Product notes",
		slug: "product-notes",
		isPublic: false,
		createdBy: user.id,
		createdAt: date,
		updatedAt: date,
		documentCount: 1,
		latestDocumentID: "doc-1",
		latestDocumentTitle: "SwiftUI client",
		latestVersionNumber: 1,
		excerpt: "A small native client for reading and commenting on Downwrite documents.",
		color: "sky",
		theme: "sans-serif"
	)

	static let stackRecord = StackRecord(
		id: stack.id,
		workspaceID: stack.workspaceID,
		name: stack.name,
		slug: stack.slug,
		isPublic: stack.isPublic,
		createdBy: stack.createdBy,
		createdAt: stack.createdAt,
		updatedAt: stack.updatedAt
	)

	static let document = DocumentSummary(
		id: "doc-1",
		workspaceID: workspace.id,
		stackID: stack.id,
		title: "SwiftUI client",
		slug: "swiftui-client",
		status: "active",
		isPublic: false,
		createdBy: user.id,
		latestVersionID: "version-1",
		stackPosition: 0,
		color: "sky",
		theme: "sans-serif",
		createdAt: date,
		updatedAt: date,
		versionNumber: 1,
		excerpt: "A small native client for reading and commenting on Downwrite documents."
	)

	static let documentRecord = DocumentRecord(
		id: document.id,
		workspaceID: document.workspaceID,
		stackID: document.stackID,
		title: document.title,
		slug: document.slug,
		status: document.status,
		isPublic: document.isPublic,
		createdBy: document.createdBy,
		latestVersionID: document.latestVersionID,
		stackPosition: document.stackPosition,
		color: document.color,
		theme: document.theme,
		createdAt: document.createdAt,
		updatedAt: document.updatedAt
	)

	static let version = DocumentVersion(
		id: "version-1",
		documentID: document.id,
		versionNumber: 1,
		contentMarkdown: "A small native client for reading and commenting on Downwrite documents.\n\nThe app is instance-first and talks to the Go API.",
		contentHTML: "",
		contentText: "A small native client for reading and commenting on Downwrite documents.\n\nThe app is instance-first and talks to the Go API.",
		contentHash: "hash",
		authoredBy: user.id,
		ingestSourceID: nil,
		createdAt: date
	)

	static let annotationThread = AnnotationThread(
		annotation: Annotation(
			id: "annotation-1",
			documentID: document.id,
			documentVersionID: version.id,
			authorID: user.id,
			quote: "instance-first",
			comment: "This is the right default for deployed Downwrite.",
			startOffset: 87,
			endOffset: 101,
			prefix: "The app is ",
			suffix: " and talks",
			createdAt: date
		),
		comments: [
			AnnotationComment(
				id: "comment-1",
				annotationID: "annotation-1",
				authorID: user.id,
				body: "Agreed.",
				createdAt: date
			)
		]
	)
}

extension AppModel {
	static var previewSignedOut: AppModel {
		let model = AppModel(client: DownwriteAPIClient(), credentialStore: InMemoryCredentialStore())
		model.authForm.instanceURL = "https://downwrite.example.com"
		model.authForm.email = "charlie@example.com"
		return model
	}

	static var previewSignedIn: AppModel {
		let model = AppModel(client: DownwriteAPIClient(), credentialStore: InMemoryCredentialStore())
		model.session = SessionState(
			instanceURL: URL(string: "https://downwrite.example.com")!,
			apiBase: "/v1",
			token: "token",
			user: PreviewFixtures.user,
			workspaces: [PreviewFixtures.workspace],
			defaultWorkspaceID: PreviewFixtures.workspace.id
		)
		model.stacks = [PreviewFixtures.stack]
		model.selectedStackID = PreviewFixtures.stack.id
		model.stackDetail = StackDetail(stack: PreviewFixtures.stackRecord, documents: [PreviewFixtures.document])
		model.documents = [PreviewFixtures.document]
		model.selectedDocumentID = PreviewFixtures.document.id
		model.documentDetail = DocumentDetail(document: PreviewFixtures.documentRecord, version: PreviewFixtures.version)
		model.annotations = [PreviewFixtures.annotationThread]
		return model
	}
}
