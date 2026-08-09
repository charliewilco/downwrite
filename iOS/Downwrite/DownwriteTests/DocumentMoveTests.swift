import Foundation
import Testing

@testable import Downwrite

@MainActor
struct DocumentMoveTests {
	@Test func successfulMovePreservesDraftAndUpdatesWorkspaceCollections() async throws {
		let client = PreviewDownwriteAPIClient.moveSampleCopy()
		let session = SessionViewModel.moveSignedIn(client: client)
		let workspace = WorkspaceViewModel(session: session)
		let document = try #require(client.documents["doc-pitch"])
		let viewModel = DocumentViewModel(
			documentID: document.id,
			session: session,
			autosaveDelay: .seconds(1),
			draftStore: .testStore(),
			onDocumentUpdate: { workspace.applyUpdatedDocument($0) },
			onDocumentMove: { workspace.applyMovedDocument($0, from: $1) }
		)
		await viewModel.load()
		viewModel.draftTitle = "Unsaved moved title"
		viewModel.draftContent = "Unsaved moved content"

		let moved = await viewModel.move(toGroupID: "group-archive")

		#expect(moved?.groupId == "group-archive")
		#expect(moved?.revision == document.revision + 1)
		#expect(viewModel.draftTitle == "Unsaved moved title")
		#expect(viewModel.draftContent == "Unsaved moved content")
		#expect(viewModel.hasChanges)
		#expect(workspace.groups.first { $0.id == "group-product" }?.documents.contains { $0.id == document.id } == false)
		#expect(workspace.groups.first { $0.id == "group-archive" }?.documents.contains { $0.id == document.id } == true)
		#expect(workspace.selectedGroupID == "group-archive")
		#expect(workspace.selectedDocumentID == document.id)
	}

	@Test func committedMoveWithLostResponseReconcilesAsSuccess() async throws {
		let client = PreviewDownwriteAPIClient.moveSampleCopy()
		client.moveDocumentCommittedError = URLError(.networkConnectionLost)
		let document = try #require(client.documents["doc-pitch"])
		let viewModel = DocumentViewModel(
			documentID: document.id,
			session: .moveSignedIn(client: client),
			draftStore: .testStore()
		)
		await viewModel.load()

		let moved = await viewModel.move(toGroupID: "group-archive")

		#expect(moved?.groupId == "group-archive")
		#expect(viewModel.document?.groupId == "group-archive")
		#expect(viewModel.isMoveOutcomeUncertain == false)
	}

	@Test func rejectedMoveLeavesDocumentAndWorkspaceCollectionsUnchanged() async throws {
		let client = PreviewDownwriteAPIClient.moveSampleCopy()
		client.moveDocumentError = DownwriteErrorEnvelope(
			error: "Moving this document is not allowed",
			code: "forbidden",
			status: 403
		)
		let session = SessionViewModel.moveSignedIn(client: client)
		let workspace = WorkspaceViewModel(session: session)
		let initialGroups = workspace.groups
		let initialGroupID = workspace.selectedGroupID
		let initialDocumentID = workspace.selectedDocumentID
		let document = try #require(client.documents["doc-pitch"])
		let viewModel = DocumentViewModel(
			documentID: document.id,
			session: session,
			draftStore: .testStore(),
			onDocumentUpdate: { workspace.applyUpdatedDocument($0) },
			onDocumentMove: { workspace.applyMovedDocument($0, from: $1) }
		)
		await viewModel.load()

		let moved = await viewModel.move(toGroupID: "group-archive")

		#expect(moved == nil)
		#expect(viewModel.document == document)
		#expect(client.documents[document.id] == document)
		#expect(workspace.groups == initialGroups)
		#expect(workspace.selectedGroupID == initialGroupID)
		#expect(workspace.selectedDocumentID == initialDocumentID)
		#expect(viewModel.statusMessage == "Moving this document is not allowed")
	}

	@Test func moveConflictRefreshesRevisionAndPreservesDraft() async throws {
		let client = PreviewDownwriteAPIClient.moveSampleCopy()
		let document = try #require(client.documents["doc-pitch"])
		let viewModel = DocumentViewModel(
			documentID: document.id,
			session: .moveSignedIn(client: client),
			autosaveDelay: .seconds(1),
			draftStore: .testStore()
		)
		await viewModel.load()
		viewModel.draftContent = "Unsaved local draft"
		client.documents[document.id]?.revision += 1

		let moved = await viewModel.move(toGroupID: "group-archive")

		#expect(moved == nil)
		#expect(viewModel.document?.revision == document.revision + 1)
		#expect(viewModel.document?.groupId == document.groupId)
		#expect(viewModel.draftContent == "Unsaved local draft")
		#expect(viewModel.statusMessage == "Document changed since it was loaded. Your local edits are preserved; try moving it again.")
	}

	@Test func moveConflictDoesNotAutosaveOverCollaboratorRevision() async throws {
		let client = PreviewDownwriteAPIClient.moveSampleCopy()
		let document = try #require(client.documents["doc-pitch"])
		let viewModel = DocumentViewModel(
			documentID: document.id,
			session: .moveSignedIn(client: client),
			autosaveDelay: .seconds(1),
			draftStore: .testStore()
		)
		await viewModel.load()
		viewModel.draftTitle = "Local title"
		viewModel.draftContent = "Local content"
		var collaboratorDocument = document
		collaboratorDocument.revision += 1
		collaboratorDocument.title = "Collaborator title"
		collaboratorDocument.content = "Collaborator content"
		client.documents[document.id] = collaboratorDocument

		let moved = await viewModel.move(toGroupID: "group-archive")
		await viewModel.flushPendingSave()

		#expect(moved == nil)
		#expect(client.updateDocumentCallCount == 0)
		#expect(client.documents[document.id] == collaboratorDocument)
		#expect(viewModel.draftTitle == "Local title")
		#expect(viewModel.draftContent == "Local content")
		guard case .conflict = viewModel.saveState else {
			Issue.record("Expected autosave to remain suspended after a move conflict")
			return
		}
	}

	@Test func cleanMoveConflictAdoptsCollaboratorContentWithoutManufacturingDraft() async throws {
		let client = PreviewDownwriteAPIClient.moveSampleCopy()
		let document = try #require(client.documents["doc-pitch"])
		let viewModel = DocumentViewModel(
			documentID: document.id,
			session: .moveSignedIn(client: client),
			draftStore: .testStore()
		)
		await viewModel.load()
		var collaboratorDocument = document
		collaboratorDocument.revision += 1
		collaboratorDocument.title = "Collaborator title"
		collaboratorDocument.content = "Collaborator content"
		client.documents[document.id] = collaboratorDocument

		let moved = await viewModel.move(toGroupID: "group-archive")

		#expect(moved == nil)
		#expect(viewModel.document == collaboratorDocument)
		#expect(viewModel.draftTitle == collaboratorDocument.title)
		#expect(viewModel.draftContent == collaboratorDocument.content)
		#expect(viewModel.hasChanges == false)
		#expect(viewModel.saveState == .saved(revision: collaboratorDocument.revision))
	}

	@Test func lostMoveResponseWithCollaboratorEditSuspendsAutosave() async throws {
		let client = PreviewDownwriteAPIClient.moveSampleCopy()
		client.moveDocumentCommittedError = URLError(.networkConnectionLost)
		client.moveDocumentCommittedContent = "Collaborator content after move"
		client.moveDocumentCommittedRevisionIncrement = 1
		let document = try #require(client.documents["doc-pitch"])
		let viewModel = DocumentViewModel(
			documentID: document.id,
			session: .moveSignedIn(client: client),
			autosaveDelay: .milliseconds(5),
			draftStore: .testStore()
		)
		await viewModel.load()
		viewModel.draftContent = "Unsaved local content"

		let moved = await viewModel.move(toGroupID: "group-archive")
		await viewModel.flushPendingSave()

		#expect(moved?.groupId == "group-archive")
		#expect(moved?.revision == document.revision + 2)
		#expect(client.updateDocumentCallCount == 0)
		#expect(client.documents[document.id]?.content == "Collaborator content after move")
		#expect(viewModel.draftContent == "Unsaved local content")
		guard case .conflict = viewModel.saveState else {
			Issue.record("Expected autosave to remain suspended after ambiguous collaborator changes")
			return
		}
	}

	@Test func uncertainMoveBlocksMutationUntilReload() async throws {
		let client = PreviewDownwriteAPIClient.moveSampleCopy()
		client.moveDocumentError = URLError(.networkConnectionLost)
		client.getDocumentError = nil
		let document = try #require(client.documents["doc-pitch"])
		let viewModel = DocumentViewModel(
			documentID: document.id,
			session: .moveSignedIn(client: client),
			autosaveDelay: .seconds(1),
			draftStore: .testStore()
		)
		await viewModel.load()
		viewModel.draftContent = "Preserved draft"
		client.getDocumentError = URLError(.timedOut)

		let moved = await viewModel.move(toGroupID: "group-archive")

		#expect(moved == nil)
		#expect(viewModel.isMoveOutcomeUncertain)
		#expect(viewModel.canSave == false)
		#expect(viewModel.canDelete == false)
		#expect(viewModel.canMove == false)
		client.getDocumentError = nil
		client.moveDocumentError = nil

		await viewModel.reconcileMoveOutcome()

		#expect(viewModel.isMoveOutcomeUncertain == false)
		#expect(viewModel.document?.groupId == document.groupId)
		#expect(viewModel.draftContent == "Preserved draft")
		#expect(viewModel.canSave)
	}

	@Test func editsMadeDuringMoveUncertaintyRestoreFromDurableDraft() async throws {
		let client = PreviewDownwriteAPIClient.moveSampleCopy()
		let session = SessionViewModel.moveSignedIn(client: client)
		let draftStore = DocumentDraftStore.testStore()
		let document = try #require(client.documents["doc-pitch"])
		let firstViewModel = DocumentViewModel(
			documentID: document.id,
			session: session,
			autosaveDelay: .seconds(1),
			draftStore: draftStore
		)
		await firstViewModel.load()
		client.moveDocumentError = URLError(.networkConnectionLost)
		client.getDocumentError = URLError(.timedOut)

		_ = await firstViewModel.move(toGroupID: "group-archive")
		firstViewModel.draftTitle = "Edited while uncertain"
		firstViewModel.draftContent = "Durable uncertain content"

		let restoredViewModel = DocumentViewModel(
			documentID: document.id,
			session: session,
			autosaveDelay: .seconds(1),
			draftStore: draftStore
		)
		await restoredViewModel.load()

		#expect(restoredViewModel.draftTitle == "Edited while uncertain")
		#expect(restoredViewModel.draftContent == "Durable uncertain content")
		#expect(restoredViewModel.hasChanges)
	}

	@Test func cleanUncertainMoveConfirmationAdoptsMovedRevision() async throws {
		let client = PreviewDownwriteAPIClient.moveSampleCopy()
		let document = try #require(client.documents["doc-pitch"])
		let viewModel = DocumentViewModel(
			documentID: document.id,
			session: .moveSignedIn(client: client),
			draftStore: .testStore()
		)
		await viewModel.load()
		client.moveDocumentCommittedError = URLError(.networkConnectionLost)
		client.getDocumentError = URLError(.timedOut)

		_ = await viewModel.move(toGroupID: "group-archive")
		#expect(viewModel.isMoveOutcomeUncertain)
		client.getDocumentError = nil

		await viewModel.reconcileMoveOutcome()

		#expect(viewModel.isMoveOutcomeUncertain == false)
		#expect(viewModel.document?.groupId == "group-archive")
		#expect(viewModel.document?.revision == document.revision + 1)
		#expect(viewModel.draftTitle == document.title)
		#expect(viewModel.draftContent == document.content)
		#expect(viewModel.hasChanges == false)
		#expect(viewModel.saveState == .saved(revision: document.revision + 1))
	}

	@Test func revertedDraftIsNotResurrectedWhenUncertainMoveFindsCollaboratorChange() async throws {
		let client = PreviewDownwriteAPIClient.moveSampleCopy()
		let document = try #require(client.documents["doc-pitch"])
		let viewModel = DocumentViewModel(
			documentID: document.id,
			session: .moveSignedIn(client: client),
			autosaveDelay: .seconds(1),
			draftStore: .testStore()
		)
		await viewModel.load()
		viewModel.draftTitle = "Temporary local title"
		viewModel.draftContent = "Temporary local content"
		client.moveDocumentError = URLError(.networkConnectionLost)
		client.getDocumentError = URLError(.timedOut)

		_ = await viewModel.move(toGroupID: "group-archive")
		#expect(viewModel.isMoveOutcomeUncertain)
		viewModel.draftTitle = document.title
		viewModel.draftContent = document.content
		#expect(viewModel.hasChanges == false)
		var collaboratorDocument = document
		collaboratorDocument.revision += 1
		collaboratorDocument.title = "Collaborator title"
		collaboratorDocument.content = "Collaborator content"
		client.documents[document.id] = collaboratorDocument
		client.getDocumentError = nil

		await viewModel.reconcileMoveOutcome()

		#expect(viewModel.document == collaboratorDocument)
		#expect(viewModel.draftTitle == collaboratorDocument.title)
		#expect(viewModel.draftContent == collaboratorDocument.content)
		#expect(viewModel.hasChanges == false)
		#expect(viewModel.saveState == .saved(revision: collaboratorDocument.revision))
	}

	@Test func cleanMoveUpdatesSavedRevision() async throws {
		let client = PreviewDownwriteAPIClient.moveSampleCopy()
		let document = try #require(client.documents["doc-pitch"])
		let viewModel = DocumentViewModel(
			documentID: document.id,
			session: .moveSignedIn(client: client),
			autosaveDelay: .seconds(1),
			draftStore: .testStore()
		)
		await viewModel.load()
		viewModel.draftContent = "Saved before move"
		await viewModel.save()
		let savedRevision = try #require(viewModel.document?.revision)

		let moved = await viewModel.move(toGroupID: "group-archive")

		#expect(moved?.revision == savedRevision + 1)
		#expect(viewModel.saveState == .saved(revision: savedRevision + 1))
		#expect(viewModel.hasChanges == false)
	}

	@Test func moveWaitsForActiveAutosaveAndUsesReturnedRevision() async throws {
		let client = PreviewDownwriteAPIClient.moveSampleCopy()
		client.updateDocumentDelay = .milliseconds(40)
		let document = try #require(client.documents["doc-pitch"])
		let viewModel = DocumentViewModel(
			documentID: document.id,
			session: .moveSignedIn(client: client),
			autosaveDelay: .milliseconds(5),
			draftStore: .testStore()
		)
		await viewModel.load()
		viewModel.draftContent = "Autosave before move"
		await waitUntil { viewModel.isSaving }

		let moved = await viewModel.move(toGroupID: "group-archive")

		#expect(client.updateDocumentCallCount == 1)
		#expect(client.moveDocumentCallCount == 1)
		#expect(client.moveDocumentInputs.first?.baseRevision == document.revision + 1)
		#expect(moved?.revision == document.revision + 2)
		#expect(moved?.content == "Autosave before move")
	}

	@Test func staleWorkspaceLoadCannotUndoCompletedMove() async throws {
		let client = PreviewDownwriteAPIClient.moveSampleCopy()
		client.listGroupsDelay = .milliseconds(40)
		let workspace = WorkspaceViewModel(session: .moveSignedIn(client: client))
		let document = try #require(client.documents["doc-pitch"])
		let staleLoad = Task { await workspace.loadGroups() }
		try await Task.sleep(for: .milliseconds(5))
		var moved = document
		moved.groupId = "group-archive"
		moved.revision += 1

		workspace.applyMovedDocument(moved, from: document.groupId)
		await staleLoad.value

		#expect(workspace.selectedGroupID == "group-archive")
		#expect(workspace.selectedDocumentID == document.id)
		#expect(workspace.groups.first { $0.id == "group-product" }?.documents.contains { $0.id == document.id } == false)
		#expect(workspace.groups.first { $0.id == "group-archive" }?.documents.contains { $0.id == document.id } == true)
	}

	@Test func moveSubmissionIsSingleFlight() async throws {
		let document = try #require(PreviewDownwriteAPIClient.sample.documents["doc-pitch"])
		var callCount = 0
		let viewModel = DocumentMoveViewModel(
			document: document,
			groups: PreviewDownwriteAPIClient.sample.groups,
			moveAction: { _ in
				callCount += 1
				try? await Task.sleep(for: .milliseconds(30))
				return nil
			}
		)

		let firstMove = Task { await viewModel.move() }
		while !viewModel.isMoving {
			await Task.yield()
		}
		let secondMove = await viewModel.move()
		let firstResult = await firstMove.value

		#expect(firstResult)
		#expect(secondMove == false)
		#expect(callCount == 1)
	}

	private func waitUntil(
		timeout: Duration = .seconds(1),
		_ condition: () -> Bool
	) async {
		let clock = ContinuousClock()
		let deadline = clock.now.advanced(by: timeout)
		while !condition(), clock.now < deadline {
			try? await Task.sleep(for: .milliseconds(2))
		}
	}
}

private extension PreviewDownwriteAPIClient {
	static func moveSampleCopy() -> PreviewDownwriteAPIClient {
		PreviewDownwriteAPIClient(groups: sample.groups, documents: sample.documents)
	}
}

private extension SessionViewModel {
	@MainActor
	static func moveSignedIn(client: PreviewDownwriteAPIClient) -> SessionViewModel {
		SessionViewModel(
			state: .signedIn(
				InstanceSession(
					instanceURL: client.baseURL,
					identity: Identity(id: "move-\(UUID().uuidString)"),
					apiClient: client
				)
			),
			draftStore: .testStore()
		)
	}
}
