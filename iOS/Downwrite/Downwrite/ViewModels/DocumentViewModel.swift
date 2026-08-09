import Foundation
import Observation

enum DocumentSaveState: Equatable {
	case ready
	case dirty
	case saving
	case saved(revision: Int)
	case failed(message: String)
	case conflict(message: String)
}

@Observable
final class DocumentViewModel {
	var documentState: LoadState<DocumentRecord> = .idle
	var draftTitle = "" {
		didSet { draftChanged() }
	}
	var draftContent = "" {
		didSet { draftChanged() }
	}
	var saveState: DocumentSaveState = .ready
	var isSaving = false
	var isDeleting = false
	var isDeleteOutcomeUncertain = false
	var statusMessage: String?

	private let documentID: String
	private let session: SessionViewModel
	private let autosaveDelay: Duration
	private let onDocumentUpdate: (DocumentRecord) -> Void
	private let draftStore: DocumentDraftStore
	private let draftKey: DocumentDraftKey?
	private var autosaveTask: Task<Void, Never>?
	private var isApplyingServerState = false
	private var automaticSaveSuspended = false

	init(
		documentID: String,
		session: SessionViewModel,
		autosaveDelay: Duration = .milliseconds(900),
		draftStore: DocumentDraftStore = .shared,
		onDocumentUpdate: @escaping (DocumentRecord) -> Void = { _ in }
	) {
		self.documentID = documentID
		self.session = session
		self.autosaveDelay = autosaveDelay
		self.draftStore = draftStore
		self.onDocumentUpdate = onDocumentUpdate
		if let activeSession = session.activeSession, let identity = activeSession.identity {
			draftKey = DocumentDraftKey(
				instanceURL: activeSession.instanceURL.absoluteString,
				identityID: identity.id,
				documentID: documentID
			)
		}
		else {
			draftKey = nil
		}
	}

	deinit {
		autosaveTask?.cancel()
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
		let storedDraft = loadStoredDraft()
		if let storedDraft {
			documentState = .loaded(storedDraft.baseline)
			applyDraft(title: storedDraft.title, content: storedDraft.content)
			saveState = .dirty
		}
		else if case .loaded = documentState {
		}
		else {
			documentState = .loading
		}

		do {
			let document = try await activeSession.apiClient.getDocument(id: documentID)
			documentState = .loaded(document)
			if let storedDraft, storedDraft.title != document.title || storedDraft.content != document.content {
				applyDraft(title: storedDraft.title, content: storedDraft.content)
				if storedDraft.baseline.revision == document.revision {
					automaticSaveSuspended = false
					saveState = .dirty
					scheduleAutosave()
				}
				else {
					automaticSaveSuspended = true
					saveState = .conflict(
						message: "Document changed elsewhere. Your local draft is restored; save again to replace the latest revision."
					)
				}
			}
			else {
				applyDraft(document)
				saveState = .ready
				removeStoredDraft()
			}
			isDeleteOutcomeUncertain = false
		}
		catch {
			if storedDraft != nil {
				automaticSaveSuspended = true
				saveState = .failed(message: "Draft restored offline. \(error.localizedDescription)")
			}
			else {
				documentState = .failed(error.localizedDescription)
			}
		}
	}

	func save() async {
		autosaveTask?.cancel()
		autosaveTask = nil
		automaticSaveSuspended = false
		await persistChanges()
	}

	func flushPendingSave() async {
		autosaveTask?.cancel()
		autosaveTask = nil
		guard !automaticSaveSuspended else {
			return
		}
		await persistChanges()
	}

	func delete() async -> DocumentRecord? {
		autosaveTask?.cancel()
		autosaveTask = nil
		let waitedForSave = isSaving
		while isSaving {
			try? await Task.sleep(for: .milliseconds(5))
		}
		if waitedForSave {
			guard case .saved = saveState else {
				statusMessage = "Document was not deleted because its latest changes could not be saved."
				return nil
			}
		}
		guard !isDeleting, !isDeleteOutcomeUncertain,
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
			removeStoredDraft()
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
				removeStoredDraft()
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
				onDocumentUpdate(latest)
				isDeleteOutcomeUncertain = false
				statusMessage = "Document still exists. Your local edits are preserved."
				return nil
			}
			isDeleteOutcomeUncertain = false
			statusMessage = nil
			removeStoredDraft()
			return document
		}
		catch {
			statusMessage = "Deletion outcome still could not be confirmed. Try reloading again."
			return nil
		}
	}

	private func draftChanged() {
		guard !isApplyingServerState, document != nil else {
			return
		}
		guard hasChanges else {
			autosaveTask?.cancel()
			autosaveTask = nil
			automaticSaveSuspended = false
			removeStoredDraft()
			if !isSaving {
				saveState = .ready
			}
			return
		}
		guard !isDeleting, !isDeleteOutcomeUncertain else {
			return
		}
		guard persistStoredDraft() else {
			return
		}
		if isSaving {
			saveState = .dirty
			return
		}
		guard !automaticSaveSuspended else {
			return
		}

		scheduleAutosave()
	}

	private func scheduleAutosave() {
		saveState = .dirty
		autosaveTask?.cancel()
		autosaveTask = Task { [weak self, autosaveDelay] in
			do {
				try await Task.sleep(for: autosaveDelay)
			}
			catch {
				return
			}
			guard !Task.isCancelled else {
				return
			}
			await self?.performAutomaticSave()
		}
	}

	private func performAutomaticSave() async {
		autosaveTask = nil
		guard !automaticSaveSuspended else {
			return
		}
		await persistChanges()
	}

	private func persistChanges() async {
		guard !isSaving, !isDeleting, !isDeleteOutcomeUncertain,
			let activeSession = session.activeSession,
			document != nil,
			hasChanges
		else {
			return
		}

		isSaving = true
		saveState = .saving
		statusMessage = nil
		defer { isSaving = false }

		while let document, hasChanges {
			let title = draftTitle
			let content = draftContent
			do {
				let updated = try await activeSession.apiClient.updateDocument(
					id: document.id,
					title: title,
					content: content,
					baseRevision: document.revision
				)
				documentState = .loaded(updated)
				onDocumentUpdate(updated)
				if draftTitle == title, draftContent == content {
					removeStoredDraft()
					saveState = .saved(revision: updated.revision)
					return
				}
				_ = persistStoredDraft()
				saveState = .saving
			}
			catch {
				if let apiError = error as? DownwriteErrorEnvelope, apiError.status == 409 {
					await refreshAfterSaveConflict(using: activeSession.apiClient)
				}
				else {
					automaticSaveSuspended = true
					saveState = .failed(message: error.localizedDescription)
				}
				return
			}
		}
	}

	private func applyDraft(_ document: DocumentRecord) {
		applyDraft(title: document.title, content: document.content)
	}

	private func applyDraft(title: String, content: String) {
		isApplyingServerState = true
		draftTitle = title
		draftContent = content
		isApplyingServerState = false
	}

	private func loadStoredDraft() -> StoredDocumentDraft? {
		guard let draftKey else {
			return nil
		}
		return try? draftStore.load(for: draftKey)
	}

	@discardableResult
	private func persistStoredDraft() -> Bool {
		guard let draftKey, let document else {
			return true
		}
		do {
			try draftStore.save(
				StoredDocumentDraft(
					key: draftKey,
					baseline: document,
					title: draftTitle,
					content: draftContent
				)
			)
			return true
		}
		catch {
			automaticSaveSuspended = true
			saveState = .failed(message: "Draft could not be stored locally. \(error.localizedDescription)")
			return false
		}
	}

	private func removeStoredDraft() {
		guard let draftKey else {
			return
		}
		try? draftStore.remove(for: draftKey)
	}

	private func refreshAfterSaveConflict(using apiClient: any DownwriteAPIClient) async {
		automaticSaveSuspended = true
		do {
			let latest = try await apiClient.getDocument(id: documentID)
			documentState = .loaded(latest)
			onDocumentUpdate(latest)
			_ = persistStoredDraft()
			saveState = .conflict(
				message: "Document changed elsewhere. Your edits are preserved; save again to replace the latest revision."
			)
		}
		catch {
			saveState = .conflict(
				message: "Document changed elsewhere. Your edits are preserved, but the latest revision could not be loaded."
			)
		}
	}

	private func refreshAfterDeleteConflict(using apiClient: any DownwriteAPIClient) async {
		do {
			let latest = try await apiClient.getDocument(id: documentID)
			documentState = .loaded(latest)
			onDocumentUpdate(latest)
			_ = persistStoredDraft()
			statusMessage = "Document changed since it was loaded. Your local edits are preserved; confirm deletion again to delete the latest revision."
		}
		catch {
			statusMessage = "Document changed since it was loaded, but the latest revision could not be refreshed."
		}
	}
}
