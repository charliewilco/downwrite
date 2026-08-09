import Foundation
import Observation

@Observable
final class DocumentViewModel {
    var documentState: LoadState<DocumentRecord> = .idle
    var draftTitle = ""
    var draftContent = ""
    var isSaving = false
	var isDeleting = false
	var isDeleteOutcomeUncertain = false
    var statusMessage: String?

    private let documentID: String
    private let session: SessionViewModel

    init(documentID: String, session: SessionViewModel) {
        self.documentID = documentID
        self.session = session
    }

    var document: DocumentRecord? {
        guard case .loaded(let document) = documentState else {
            return nil
        }
        return document
    }

    var hasChanges: Bool {
        guard let document else {
            return false
        }
        return draftTitle != document.title || draftContent != document.content
    }

	var canSave: Bool {
		hasChanges && !isSaving && !isDeleting && !isDeleteOutcomeUncertain
	}

	var canDelete: Bool {
		document != nil && !isSaving && !isDeleting && !isDeleteOutcomeUncertain
	}

    func load() async {
        guard let activeSession = session.activeSession else {
            documentState = .failed("Sign in before loading documents.")
            return
        }
        if case .loaded = documentState {
        } else {
            documentState = .loading
        }

        do {
            let document = try await activeSession.apiClient.getDocument(id: documentID)
            documentState = .loaded(document)
            draftTitle = document.title
            draftContent = document.content
			isDeleteOutcomeUncertain = false
        } catch {
            documentState = .failed(error.localizedDescription)
        }
    }

    func save() async {
		guard !isSaving, !isDeleting, !isDeleteOutcomeUncertain,
			let activeSession = session.activeSession,
			let document
		else {
            return
        }
        isSaving = true
		statusMessage = nil
        defer { isSaving = false }

        do {
            let updated = try await activeSession.apiClient.updateDocument(
                id: document.id,
                title: draftTitle,
                content: draftContent,
                baseRevision: document.revision
            )
            documentState = .loaded(updated)
            draftTitle = updated.title
            draftContent = updated.content
            statusMessage = "Saved revision \(updated.revision)."
        } catch {
            statusMessage = error.localizedDescription
        }
    }

	func delete() async -> DocumentRecord? {
		guard !isSaving, !isDeleting, !isDeleteOutcomeUncertain,
			let activeSession = session.activeSession,
			let document
		else {
			return nil
		}
		isDeleting = true
		statusMessage = nil
		defer { isDeleting = false }

		do {
			try await activeSession.apiClient.deleteDocument(
				id: document.id,
				baseRevision: document.revision
			)
			return document
		}
		catch {
			if let apiError = error as? DownwriteErrorEnvelope {
				if apiError.status == 409 {
					await refreshAfterDeleteConflict(using: activeSession.apiClient)
					return nil
				}
				if apiError.status < 500 {
					statusMessage = apiError.localizedDescription
					return nil
				}
			}

			do {
				if try await activeSession.apiClient.documentExists(id: document.id) {
					statusMessage = error.localizedDescription
					return nil
				}
				return document
			}
			catch {
				isDeleteOutcomeUncertain = true
				statusMessage = "Deletion outcome could not be confirmed. Refresh the workspace before editing this document."
				return nil
			}
		}
	}

	func reconcileDeleteOutcome() async -> DocumentRecord? {
		guard isDeleteOutcomeUncertain,
			let activeSession = session.activeSession,
			let document
		else {
			return nil
		}

		do {
			if try await activeSession.apiClient.documentExists(id: document.id) {
				let latest = try await activeSession.apiClient.getDocument(id: document.id)
				documentState = .loaded(latest)
				isDeleteOutcomeUncertain = false
				statusMessage = "Document still exists. Your local edits are preserved."
				return nil
			}
			isDeleteOutcomeUncertain = false
			statusMessage = nil
			return document
		}
		catch {
			statusMessage = "Deletion outcome still could not be confirmed. Try reloading again."
			return nil
		}
	}

	private func refreshAfterDeleteConflict(using apiClient: any DownwriteAPIClient) async {
		do {
			let latest = try await apiClient.getDocument(id: documentID)
			documentState = .loaded(latest)
			statusMessage = "Document changed since it was loaded. Your local edits are preserved; confirm deletion again to delete the latest revision."
		}
		catch {
			statusMessage = "Document changed since it was loaded, but the latest revision could not be refreshed."
		}
	}
}
