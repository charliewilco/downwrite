import Foundation
import Observation

@Observable
final class DocumentViewModel {
    var documentState: LoadState<DocumentRecord> = .idle
    var draftTitle = ""
    var draftContent = ""
    var isSaving = false
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
        } catch {
            documentState = .failed(error.localizedDescription)
        }
    }

    func save() async {
        guard let activeSession = session.activeSession, let document else {
            return
        }
        isSaving = true
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
}
