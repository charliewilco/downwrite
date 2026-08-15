import Foundation
import Observation

@Observable
final class DocumentCreatorViewModel: Identifiable {
	let id = UUID()
	var title = ""
	var content = ""
	var isSaving = false
	var statusMessage: String?

	private let group: GroupSummary
	private let session: SessionViewModel

	init(group: GroupSummary, session: SessionViewModel) {
		self.group = group
		self.session = session
	}

	var canCreate: Bool {
		!title.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty && !isSaving
	}

	func create() async throws -> DocumentRecord {
		guard let activeSession = session.activeSession else {
			throw URLError(.userAuthenticationRequired)
		}
		isSaving = true
		defer { isSaving = false }

		return try await activeSession.apiClient.createDocument(
			groupId: group.id,
			title: title.trimmingCharacters(in: .whitespacesAndNewlines),
			content: content
		)
	}
}
