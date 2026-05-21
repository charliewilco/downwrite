import Foundation
import Observation

@MainActor
@Observable
final class AppModel {
	var authForm = AuthFormState()
	var session: SessionState?
	var stacks: [StackSummary] = []
	var stackDetail: StackDetail?
	var documents: [DocumentSummary] = []
	var selectedStackID: String?
	var selectedDocumentID: String?
	var documentDetail: DocumentDetail?
	var annotations: [AnnotationThread] = []
	var isRestoringSession = false
	var isValidatingInstance = false
	var validatedInstance: ValidatedInstance?
	var isLoadingStacks = false
	var isLoadingDocuments = false
	var isLoadingDocument = false
	var errorMessage: String?

	private let client: DownwriteAPIClient
	private let credentialStore: CredentialStore

	init(client: DownwriteAPIClient, credentialStore: CredentialStore) {
		self.client = client
		self.credentialStore = credentialStore
	}

	func restoreSavedSession() async {
		guard session == nil else {
			return
		}

		isRestoringSession = true
		defer { isRestoringSession = false }

		do {
			guard let credentials = try credentialStore.load() else {
				return
			}
			let response = try await client.me(
				instanceURL: credentials.instanceURL,
				apiBase: credentials.apiBase,
				token: credentials.token
			)
			session = SessionState(
				instanceURL: credentials.instanceURL,
				apiBase: credentials.apiBase,
				token: credentials.token,
				user: response.user,
				workspaces: response.workspaces,
				defaultWorkspaceID: response.defaultWorkspaceID
			)
			await loadStacks()
		} catch {
			try? credentialStore.clear()
			errorMessage = error.localizedDescription
		}
	}

	func login() async {
		errorMessage = nil

		do {
			let instance = try await currentValidatedInstance()
			let response = try await client.login(
				instanceURL: instance.instanceURL,
				apiBase: instance.discovery.apiBase,
				email: authForm.email,
				password: authForm.password
			)
			session = SessionState(
				instanceURL: instance.instanceURL,
				apiBase: instance.discovery.apiBase,
				token: response.session.token,
				user: response.user,
				workspaces: response.workspaces,
				defaultWorkspaceID: response.defaultWorkspaceID
			)
			try credentialStore.save(SavedCredentials(
				instanceURL: instance.instanceURL,
				apiBase: instance.discovery.apiBase,
				token: response.session.token
			))
			authForm.password = ""
			await loadStacks()
		} catch {
			errorMessage = error.localizedDescription
		}
	}

	func validateInstance() async {
		errorMessage = nil
		isValidatingInstance = true
		defer { isValidatingInstance = false }

		do {
			let instanceURL = try normalizedInstanceURL(authForm.instanceURL)
			validatedInstance = try await client.validateInstance(instanceURL: instanceURL)
		} catch {
			validatedInstance = nil
			errorMessage = error.localizedDescription
		}
	}

	func editInstanceURL() {
		validatedInstance = nil
		authForm.password = ""
		errorMessage = nil
	}

	func signOut() async {
		if let session {
			try? await client.logout(
				instanceURL: session.instanceURL,
				apiBase: session.apiBase,
				token: session.token
			)
		}
		try? credentialStore.clear()
		session = nil
		stacks = []
		stackDetail = nil
		documents = []
		selectedStackID = nil
		selectedDocumentID = nil
		documentDetail = nil
		annotations = []
		authForm.password = ""
	}

	func loadStacks() async {
		guard let session else {
			return
		}

		isLoadingStacks = true
		defer { isLoadingStacks = false }

		do {
			let loadedStacks = try await client.stacks(
				instanceURL: session.instanceURL,
				apiBase: session.apiBase,
				token: session.token
			)
			stacks = loadedStacks
			if selectedStackID == nil {
				selectedStackID = loadedStacks.first?.id
			}
			if let selectedStackID {
				await loadStack(stackID: selectedStackID)
			}
		} catch {
			errorMessage = error.localizedDescription
		}
	}

	func loadStack(stackID: String) async {
		guard let session else {
			return
		}

		isLoadingDocuments = true
		defer { isLoadingDocuments = false }

		do {
			let detail = try await client.stack(
				instanceURL: session.instanceURL,
				apiBase: session.apiBase,
				token: session.token,
				stackID: stackID
			)
			stackDetail = detail
			documents = detail.documents
			if selectedDocumentID == nil || documents.contains(where: { $0.id == selectedDocumentID }) == false {
				selectedDocumentID = documents.first?.id
			}
		} catch {
			errorMessage = error.localizedDescription
		}
	}

	func loadDocuments(stackID: String) async {
		await loadStack(stackID: stackID)
	}

	func loadDocument(documentID: String) async {
		guard let session else {
			return
		}

		isLoadingDocument = true
		defer { isLoadingDocument = false }

		do {
			let detail = try await client.document(
				instanceURL: session.instanceURL,
				apiBase: session.apiBase,
				token: session.token,
				documentID: documentID
			)
			documentDetail = detail
			annotations = try await client.annotations(
				instanceURL: session.instanceURL,
				apiBase: session.apiBase,
				token: session.token,
				documentID: detail.document.id,
				versionID: detail.version.id
			)
		} catch {
			errorMessage = error.localizedDescription
		}
	}

	func createAnnotation(quote: String, comment: String) async {
		guard let session, let detail = documentDetail else {
			return
		}

		do {
			let bounds = annotationBounds(for: quote, in: detail.version.contentText)
			let request = CreateAnnotationRequest(
				documentID: detail.document.id,
				documentVersionID: detail.version.id,
				quote: quote,
				comment: comment,
				startOffset: bounds.start,
				endOffset: bounds.end,
				prefix: bounds.prefix,
				suffix: bounds.suffix
			)
			_ = try await client.createAnnotation(
				instanceURL: session.instanceURL,
				apiBase: session.apiBase,
				token: session.token,
				request: request
			)
			await loadDocument(documentID: detail.document.id)
		} catch {
			errorMessage = error.localizedDescription
		}
	}

	func reply(to annotationID: String, body: String) async {
		guard let session, let detail = documentDetail else {
			return
		}

		do {
			_ = try await client.createAnnotationComment(
				instanceURL: session.instanceURL,
				apiBase: session.apiBase,
				token: session.token,
				annotationID: annotationID,
				body: body
			)
			await loadDocument(documentID: detail.document.id)
		} catch {
			errorMessage = error.localizedDescription
		}
	}

	private func currentValidatedInstance() async throws -> ValidatedInstance {
		if let validatedInstance {
			return validatedInstance
		}

		let instanceURL = try normalizedInstanceURL(authForm.instanceURL)
		let instance = try await client.validateInstance(instanceURL: instanceURL)
		validatedInstance = instance
		return instance
	}
}

struct AuthFormState: Equatable {
	var instanceURL = ""
	var email = ""
	var password = ""
}

struct SessionState: Equatable {
	var instanceURL: URL
	var apiBase: String
	var token: String
	var user: DownwriteUser
	var workspaces: [Workspace]
	var defaultWorkspaceID: String
}

func normalizedInstanceURL(_ rawValue: String) throws -> URL {
	let trimmed = rawValue.trimmingCharacters(in: .whitespacesAndNewlines)
	let value = trimmed.contains("://") ? trimmed : "https://\(trimmed)"
	guard let url = URL(string: value), url.scheme != nil, url.host != nil else {
		throw ValidationError.invalidInstanceURL
	}
	return url
}

func annotationBounds(for quote: String, in text: String) -> (start: Int, end: Int, prefix: String, suffix: String) {
	guard let range = text.range(of: quote), quote.isEmpty == false else {
		return (0, quote.count, "", "")
	}

	let start = text.distance(from: text.startIndex, to: range.lowerBound)
	let end = text.distance(from: text.startIndex, to: range.upperBound)
	let prefixStart = text.index(range.lowerBound, offsetBy: -min(24, start))
	let suffixEnd = text.index(range.upperBound, offsetBy: min(24, text.distance(from: range.upperBound, to: text.endIndex)))
	return (
		start,
		end,
		String(text[prefixStart..<range.lowerBound]),
		String(text[range.upperBound..<suffixEnd])
	)
}

enum ValidationError: Error, Equatable {
	case invalidInstanceURL
}

extension ValidationError: LocalizedError {
	var errorDescription: String? {
		switch self {
		case .invalidInstanceURL:
			"Enter a valid Downwrite instance URL."
		}
	}
}
