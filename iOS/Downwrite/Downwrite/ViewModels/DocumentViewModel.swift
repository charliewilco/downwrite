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
	var isMoving = false
	var isDeleteOutcomeUncertain = false
	var isMoveOutcomeUncertain = false
	var statusMessage: String?

	private let documentID: String
	private let session: SessionViewModel
	private let autosaveDelay: Duration
	private let onDocumentUpdate: (DocumentRecord) -> Void
	private let onDocumentMove: (DocumentRecord, String) -> Void
	private let draftStore: DocumentDraftStore
	private let draftKey: DocumentDraftKey?
	private var autosaveTask: Task<Void, Never>?
	private var isApplyingServerState = false
	private var automaticSaveSuspended = false
	private var uncertainMoveSourceGroupID: String?
	private var uncertainMoveTargetGroupID: String?
	private var uncertainMoveHadLocalChanges = false

	init(
		documentID: String,
		session: SessionViewModel,
		autosaveDelay: Duration = .milliseconds(900),
		draftStore: DocumentDraftStore = .shared,
		onDocumentUpdate: @escaping (DocumentRecord) -> Void = { _ in },
		onDocumentMove: @escaping (DocumentRecord, String) -> Void = { _, _ in }
	) {
		self.documentID = documentID
		self.session = session
		self.autosaveDelay = autosaveDelay
		self.draftStore = draftStore
		self.onDocumentUpdate = onDocumentUpdate
		self.onDocumentMove = onDocumentMove
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
		hasChanges && !isSaving && !isDeleting && !isMoving && !isDeleteOutcomeUncertain && !isMoveOutcomeUncertain
	}

	var canDelete: Bool {
		document != nil && !isSaving && !isDeleting && !isMoving && !isDeleteOutcomeUncertain && !isMoveOutcomeUncertain
	}

	var canMove: Bool {
		document != nil && !isSaving && !isDeleting && !isMoving && !isDeleteOutcomeUncertain && !isMoveOutcomeUncertain
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
		guard !isDeleting, !isMoving, !isDeleteOutcomeUncertain, !isMoveOutcomeUncertain,
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

	func move(toGroupID targetGroupID: String) async -> DocumentRecord? {
		autosaveTask?.cancel()
		autosaveTask = nil
		while isSaving {
			try? await Task.sleep(for: .milliseconds(5))
		}
		guard !isDeleting, !isMoving, !isDeleteOutcomeUncertain, !isMoveOutcomeUncertain,
			let activeSession = session.activeSession,
			let document,
			document.groupId != targetGroupID
		else {
			return nil
		}

		let hadLocalChanges = hasChanges
		isMoving = true
		statusMessage = nil
		defer { isMoving = false }
		let sourceGroupID = document.groupId
		do {
			let moved = try await activeSession.apiClient.moveDocument(
				id: document.id,
				groupId: targetGroupID,
				position: nil,
				baseRevision: document.revision
			)
			applyMovedRecord(
				moved,
				sourceGroupID: sourceGroupID,
				autosaveSafe: true,
				preserveDraft: hadLocalChanges || hasChanges
			)
			return moved
		}
		catch {
			if let apiError = error as? DownwriteErrorEnvelope {
				if apiError.status == 409 {
					await refreshAfterMoveConflict(
						using: activeSession.apiClient,
						sourceGroupID: sourceGroupID,
						preserveDraft: hadLocalChanges || hasChanges
					)
					return nil
				}
				if apiError.status < 500 {
					statusMessage = apiError.localizedDescription
					return nil
				}
			}

			do {
				let latest = try await activeSession.apiClient.getDocument(id: document.id)
				let preserveDraft = hadLocalChanges || hasChanges
				if latest.groupId == targetGroupID {
					let autosaveSafe = isExpectedMoveOnly(
						latest,
						from: document,
						targetGroupID: targetGroupID
					)
					applyMovedRecord(
						latest,
						sourceGroupID: sourceGroupID,
						autosaveSafe: autosaveSafe,
						preserveDraft: preserveDraft
					)
					return latest
				}
				let autosaveSafe = serverRecordMatches(latest, document)
				applyServerRecord(
					latest,
					previousGroupID: sourceGroupID,
					preserveDraft: preserveDraft
				)
				statusMessage = error.localizedDescription
				if preserveDraft {
					resumeOrSuspendAutosave(
						autosaveSafe: autosaveSafe,
						conflictMessage: "Document changed while its move was being checked. Your local edits are preserved; save again to replace the latest revision."
					)
				}
				return nil
			}
			catch {
				uncertainMoveSourceGroupID = sourceGroupID
				uncertainMoveTargetGroupID = targetGroupID
				uncertainMoveHadLocalChanges = hadLocalChanges || hasChanges
				isMoveOutcomeUncertain = true
				statusMessage = "Move outcome could not be confirmed. Reload before editing this document."
				return nil
			}
		}
	}

	func reconcileMoveOutcome() async {
		guard isMoveOutcomeUncertain,
			let activeSession = session.activeSession,
			let document,
			let sourceGroupID = uncertainMoveSourceGroupID,
			let targetGroupID = uncertainMoveTargetGroupID
		else {
			return
		}
		do {
			let latest = try await activeSession.apiClient.getDocument(id: document.id)
			let preserveDraft = uncertainMoveHadLocalChanges || hasChanges
			let autosaveSafe = isExpectedMoveOnly(latest, from: document, targetGroupID: targetGroupID)
				|| serverRecordMatches(latest, document)
			applyServerRecord(
				latest,
				previousGroupID: sourceGroupID,
				preserveDraft: preserveDraft
			)
			isMoveOutcomeUncertain = false
			uncertainMoveSourceGroupID = nil
			uncertainMoveTargetGroupID = nil
			uncertainMoveHadLocalChanges = false
			statusMessage = latest.groupId == targetGroupID
				? "Document move confirmed."
				: "Document remains in its current workspace. Your local edits are preserved."
			if preserveDraft {
				resumeOrSuspendAutosave(
					autosaveSafe: autosaveSafe,
					conflictMessage: "Document changed while its move was uncertain. Your local edits are preserved; save again to replace the latest revision."
				)
			}
		}
		catch {
			statusMessage = "Move outcome still could not be confirmed. Try reloading again."
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
		let currentHasChanges = hasChanges
		if isMoveOutcomeUncertain {
			uncertainMoveHadLocalChanges = currentHasChanges
		}
		guard currentHasChanges else {
			autosaveTask?.cancel()
			autosaveTask = nil
			automaticSaveSuspended = false
			removeStoredDraft()
			if !isSaving {
				saveState = .ready
			}
			return
		}
		guard persistStoredDraft() else {
			return
		}
		guard !isDeleting, !isMoving, !isDeleteOutcomeUncertain, !isMoveOutcomeUncertain else {
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
		guard !isSaving, !isDeleting, !isMoving, !isDeleteOutcomeUncertain, !isMoveOutcomeUncertain,
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

	private func applyMovedRecord(
		_ moved: DocumentRecord,
		sourceGroupID: String,
		autosaveSafe: Bool,
		preserveDraft: Bool
	) {
		documentState = .loaded(moved)
		onDocumentMove(moved, sourceGroupID)
		if preserveDraft, hasChanges {
			_ = persistStoredDraft()
			resumeOrSuspendAutosave(
				autosaveSafe: autosaveSafe,
				conflictMessage: "Document changed while its move was being confirmed. Your local edits are preserved; save again to replace the latest revision."
			)
		}
		else {
			applyDraft(moved)
			automaticSaveSuspended = false
			removeStoredDraft()
			saveState = .saved(revision: moved.revision)
		}
	}

	private func applyServerRecord(
		_ latest: DocumentRecord,
		previousGroupID: String,
		preserveDraft: Bool
	) {
		documentState = .loaded(latest)
		if latest.groupId == previousGroupID {
			onDocumentUpdate(latest)
		}
		else {
			onDocumentMove(latest, previousGroupID)
		}
		if preserveDraft, hasChanges {
			_ = persistStoredDraft()
		}
		else {
			applyDraft(latest)
			automaticSaveSuspended = false
			removeStoredDraft()
			saveState = .saved(revision: latest.revision)
		}
	}

	private func refreshAfterMoveConflict(
		using apiClient: any DownwriteAPIClient,
		sourceGroupID: String,
		preserveDraft: Bool
	) async {
		do {
			let latest = try await apiClient.getDocument(id: documentID)
			applyServerRecord(
				latest,
				previousGroupID: sourceGroupID,
				preserveDraft: preserveDraft
			)
			if preserveDraft, hasChanges {
				automaticSaveSuspended = true
				saveState = .conflict(
					message: "Document changed elsewhere. Your edits are preserved; save again to replace the latest revision."
				)
			}
			statusMessage = preserveDraft
				? "Document changed since it was loaded. Your local edits are preserved; try moving it again."
				: "Document changed since it was loaded. The latest version is shown; try moving it again."
		}
		catch {
			if preserveDraft, hasChanges {
				automaticSaveSuspended = true
				saveState = .conflict(
					message: "Document changed elsewhere. Your edits are preserved, but the latest revision could not be loaded."
				)
			}
			statusMessage = "Document changed since it was loaded, but the latest revision could not be refreshed."
		}
	}

	private func serverRecordMatches(_ latest: DocumentRecord, _ baseline: DocumentRecord) -> Bool {
		latest.id == baseline.id
			&& latest.groupId == baseline.groupId
			&& latest.title == baseline.title
			&& latest.content == baseline.content
			&& latest.position == baseline.position
			&& latest.revision == baseline.revision
	}

	private func isExpectedMoveOnly(
		_ latest: DocumentRecord,
		from baseline: DocumentRecord,
		targetGroupID: String
	) -> Bool {
		latest.id == baseline.id
			&& latest.groupId == targetGroupID
			&& latest.title == baseline.title
			&& latest.content == baseline.content
			&& latest.revision == baseline.revision + 1
	}

	private func resumeOrSuspendAutosave(autosaveSafe: Bool, conflictMessage: String) {
		guard hasChanges else {
			return
		}
		if autosaveSafe, !automaticSaveSuspended {
			scheduleAutosave()
		}
		else {
			automaticSaveSuspended = true
			saveState = .conflict(message: conflictMessage)
		}
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
