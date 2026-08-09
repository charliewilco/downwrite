import Foundation
import Testing

@testable import Downwrite

@MainActor
struct DocumentAutosaveTests {
	@Test func rapidEditsDebounceIntoOneSave() async throws {
		let client = PreviewDownwriteAPIClient.autosaveSampleCopy()
		let viewModel = try await loadedViewModel(client: client, autosaveDelay: .milliseconds(40))
		let initialRevision = try #require(viewModel.document?.revision)

		viewModel.draftContent = "First edit"
		try await Task.sleep(for: .milliseconds(20))
		viewModel.draftContent = "Final edit"

		#expect(client.updateDocumentCallCount == 0)
		await waitUntil { client.updateDocumentCallCount == 1 && !viewModel.isSaving }
		#expect(client.updateDocumentCallCount == 1)
		#expect(client.updateDocumentInputs.first?.content == "Final edit")
		#expect(viewModel.saveState == .saved(revision: initialRevision + 1))
		#expect(viewModel.hasChanges == false)
	}

	@Test func explicitSaveCancelsPendingDebounce() async throws {
		let client = PreviewDownwriteAPIClient.autosaveSampleCopy()
		let viewModel = try await loadedViewModel(client: client, autosaveDelay: .seconds(1))
		let initialRevision = try #require(viewModel.document?.revision)
		viewModel.draftTitle = "Saved immediately"

		await viewModel.save()
		try await Task.sleep(for: .milliseconds(30))

		#expect(client.updateDocumentCallCount == 1)
		#expect(client.updateDocumentInputs.first?.title == "Saved immediately")
		#expect(viewModel.saveState == .saved(revision: initialRevision + 1))
	}

	@Test func flushSavesBeforeDebounceExpires() async throws {
		let client = PreviewDownwriteAPIClient.autosaveSampleCopy()
		let viewModel = try await loadedViewModel(client: client, autosaveDelay: .seconds(1))
		viewModel.draftContent = "Flush this edit"

		await viewModel.flushPendingSave()

		#expect(client.updateDocumentCallCount == 1)
		#expect(client.documents[viewModel.document!.id]?.content == "Flush this edit")
	}

	@Test func editsDuringSaveUseReturnedRevisionInFollowUpSave() async throws {
		let client = PreviewDownwriteAPIClient.autosaveSampleCopy()
		client.updateDocumentDelay = .milliseconds(40)
		let viewModel = try await loadedViewModel(client: client, autosaveDelay: .milliseconds(5))
		let initialRevision = try #require(viewModel.document?.revision)
		viewModel.draftContent = "First snapshot"
		await waitUntil { viewModel.isSaving }

		viewModel.draftContent = "Second snapshot"
		await waitUntil { client.updateDocumentCallCount == 2 && !viewModel.isSaving }

		#expect(client.updateDocumentInputs.map(\.baseRevision) == [initialRevision, initialRevision + 1])
		#expect(client.updateDocumentInputs.map(\.content) == ["First snapshot", "Second snapshot"])
		#expect(client.documents[viewModel.document!.id]?.content == "Second snapshot")
		#expect(viewModel.saveState == .saved(revision: initialRevision + 2))
	}

	@Test func conflictRefreshesBaselineAndPreservesDraftForManualRetry() async throws {
		let client = PreviewDownwriteAPIClient.autosaveSampleCopy()
		let viewModel = try await loadedViewModel(client: client, autosaveDelay: .seconds(1))
		let original = try #require(viewModel.document)
		viewModel.draftTitle = "Local title"
		viewModel.draftContent = "Local content"
		var collaboratorRevision = original
		collaboratorRevision.revision += 1
		collaboratorRevision.title = "Collaborator title"
		collaboratorRevision.content = "Collaborator content"
		client.documents[original.id] = collaboratorRevision

		await viewModel.save()

		guard case .conflict = viewModel.saveState else {
			Issue.record("Expected a save conflict")
			return
		}
		#expect(viewModel.document == collaboratorRevision)
		#expect(viewModel.draftTitle == "Local title")
		#expect(viewModel.draftContent == "Local content")

		await viewModel.save()

		#expect(client.updateDocumentInputs.map(\.baseRevision) == [original.revision, collaboratorRevision.revision])
		#expect(viewModel.document?.revision == collaboratorRevision.revision + 1)
		#expect(viewModel.document?.title == "Local title")
		#expect(viewModel.document?.content == "Local content")
	}

	@Test func failedAutosaveDoesNotRetryUntilExplicitSave() async throws {
		let client = PreviewDownwriteAPIClient.autosaveSampleCopy()
		client.updateDocumentError = URLError(.networkConnectionLost)
		let viewModel = try await loadedViewModel(client: client, autosaveDelay: .milliseconds(15))
		let initialRevision = try #require(viewModel.document?.revision)
		viewModel.draftContent = "First failed edit"
		await waitUntil {
			if case .failed = viewModel.saveState {
				return true
			}
			return false
		}

		viewModel.draftContent = "Second local edit"
		try await Task.sleep(for: .milliseconds(50))
		#expect(client.updateDocumentCallCount == 1)
		#expect(viewModel.draftContent == "Second local edit")

		client.updateDocumentError = nil
		await viewModel.save()

		#expect(client.updateDocumentCallCount == 2)
		#expect(viewModel.document?.content == "Second local edit")
		#expect(viewModel.saveState == .saved(revision: initialRevision + 1))
	}

	@Test func deletionCancelsPendingAutosave() async throws {
		let client = PreviewDownwriteAPIClient.autosaveSampleCopy()
		let viewModel = try await loadedViewModel(client: client, autosaveDelay: .milliseconds(40))
		viewModel.draftContent = "Never save this"

		let deleted = await viewModel.delete()
		try await Task.sleep(for: .milliseconds(80))

		#expect(deleted != nil)
		#expect(client.updateDocumentCallCount == 0)
		#expect(client.documents[deleted!.id] == nil)
	}

	@Test func deletionWaitsForAnActiveSaveAndUsesItsRevision() async throws {
		let client = PreviewDownwriteAPIClient.autosaveSampleCopy()
		client.updateDocumentDelay = .milliseconds(40)
		let viewModel = try await loadedViewModel(client: client, autosaveDelay: .milliseconds(5))
		viewModel.draftContent = "Save before deleting"
		await waitUntil { viewModel.isSaving }

		let deleted = await viewModel.delete()

		#expect(client.updateDocumentCallCount == 1)
		#expect(client.deleteDocumentCallCount == 1)
		#expect(deleted?.revision == client.updateDocumentInputs[0].baseRevision + 1)
		#expect(client.documents[deleted!.id] == nil)
	}

	@Test func failedDraftRestoresAfterSelectionChangeWhileOffline() async throws {
		let client = PreviewDownwriteAPIClient.autosaveSampleCopy()
		let session = SessionViewModel.autosaveSignedIn(client: client)
		let draftStore = DocumentDraftStore.testStore()
		let document = try #require(client.documents["doc-pitch"])
		client.updateDocumentError = URLError(.networkConnectionLost)
		let firstViewModel = DocumentViewModel(
			documentID: document.id,
			session: session,
			autosaveDelay: .seconds(1),
			draftStore: draftStore
		)
		await firstViewModel.load()
		firstViewModel.draftTitle = "Offline title"
		firstViewModel.draftContent = "Offline content"
		await firstViewModel.save()
		guard case .failed = firstViewModel.saveState else {
			Issue.record("Expected the first save to fail")
			return
		}

		client.getDocumentError = URLError(.notConnectedToInternet)
		let restoredViewModel = DocumentViewModel(
			documentID: document.id,
			session: session,
			autosaveDelay: .seconds(1),
			draftStore: draftStore
		)
		await restoredViewModel.load()

		#expect(restoredViewModel.document == document)
		#expect(restoredViewModel.draftTitle == "Offline title")
		#expect(restoredViewModel.draftContent == "Offline content")
		#expect(restoredViewModel.hasChanges)
		guard case .failed(let message) = restoredViewModel.saveState else {
			Issue.record("Expected an offline restored-draft state")
			return
		}
		#expect(message.hasPrefix("Draft restored offline."))

		client.getDocumentError = nil
		client.updateDocumentError = nil
		await restoredViewModel.save()
		#expect(restoredViewModel.hasChanges == false)
	}

	@Test func workspaceSummaryUpdatePreservesOrderAndSelection() throws {
		let client = PreviewDownwriteAPIClient.autosaveSampleCopy()
		let workspace = WorkspaceViewModel(session: .autosaveSignedIn(client: client))
		let originalIDs = workspace.selectedGroup?.documents.map(\.id)
		let selectedGroupID = workspace.selectedGroupID
		let selectedDocumentID = workspace.selectedDocumentID
		var updated = try #require(client.documents["doc-pitch"])
		updated.title = "Updated title"
		updated.revision += 1

		workspace.applyUpdatedDocument(updated)

		#expect(workspace.selectedGroup?.documents.map(\.id) == originalIDs)
		#expect(workspace.selectedGroupID == selectedGroupID)
		#expect(workspace.selectedDocumentID == selectedDocumentID)
		#expect(workspace.selectedDocument?.title == "Updated title")
		#expect(workspace.selectedDocument?.revision == updated.revision)
	}

	@Test func oauthDraftsAreIsolatedByAuthenticatedIdentity() async throws {
		let draftStore = DocumentDraftStore.testStore()
		let firstClient = PreviewDownwriteAPIClient.autosaveSampleCopy()
		let firstSession = SessionViewModel.autosaveSignedIn(
			client: firstClient,
			identityID: "oauth-first"
		)
		let document = try #require(firstClient.documents["doc-pitch"])
		firstClient.updateDocumentError = URLError(.networkConnectionLost)
		let firstViewModel = DocumentViewModel(
			documentID: document.id,
			session: firstSession,
			autosaveDelay: .seconds(1),
			draftStore: draftStore
		)
		await firstViewModel.load()
		firstViewModel.draftContent = "First account private draft"
		await firstViewModel.save()

		let secondClient = PreviewDownwriteAPIClient.autosaveSampleCopy()
		let secondSession = SessionViewModel.autosaveSignedIn(
			client: secondClient,
			identityID: "oauth-second"
		)
		let secondViewModel = DocumentViewModel(
			documentID: document.id,
			session: secondSession,
			autosaveDelay: .seconds(1),
			draftStore: draftStore
		)
		await secondViewModel.load()

		#expect(secondViewModel.draftContent == document.content)
		#expect(secondViewModel.draftContent != firstViewModel.draftContent)
		#expect(secondViewModel.saveState == .ready)
	}

	private func loadedViewModel(
		client: PreviewDownwriteAPIClient,
		autosaveDelay: Duration
	) async throws -> DocumentViewModel {
		let document = try #require(client.documents["doc-pitch"])
		let viewModel = DocumentViewModel(
			documentID: document.id,
			session: .autosaveSignedIn(client: client),
			autosaveDelay: autosaveDelay,
			draftStore: .testStore()
		)
		await viewModel.load()
		return viewModel
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
	static func autosaveSampleCopy() -> PreviewDownwriteAPIClient {
		PreviewDownwriteAPIClient(groups: sample.groups, documents: sample.documents)
	}
}

private extension SessionViewModel {
	@MainActor
	static func autosaveSignedIn(
		client: PreviewDownwriteAPIClient,
		identityID: String = "autosave-\(UUID().uuidString)"
	) -> SessionViewModel {
		SessionViewModel(
			state: .signedIn(
				InstanceSession(
					instanceURL: client.baseURL,
					identity: Identity(id: identityID),
					apiClient: client
				)
			)
		)
	}
}
