import Foundation
import Testing

@testable import Downwrite

@MainActor
struct DocumentDeletionTests {
	@Test func successfulDeleteRemovesDocumentFromClient() async throws {
		let client = PreviewDownwriteAPIClient.deletionSampleCopy()
		let document = try #require(client.documents["doc-pitch"])
		let viewModel = DocumentViewModel(
			documentID: document.id,
			session: .deletionSignedIn(client: client),
			draftStore: .testStore()
		)
		await viewModel.load()
		viewModel.draftTitle = "Unsaved title"
		viewModel.draftContent = "Unsaved content"

		let deleted = await viewModel.delete()

		#expect(deleted == document)
		#expect(client.deleteDocumentCallCount == 1)
		#expect(client.documents[document.id] == nil)
		#expect(client.groups.allSatisfy { group in
			group.documents.contains { $0.id == document.id } == false
		})
		#expect(viewModel.isDeleting == false)
	}

	@Test func failedDeletePreservesLoadedDocumentAndDraft() async throws {
		let client = PreviewDownwriteAPIClient.deletionSampleCopy()
		client.deleteDocumentError = DownwriteErrorEnvelope(
			error: "Document could not be deleted",
			code: "unavailable",
			status: 503
		)
		let document = try #require(client.documents["doc-pitch"])
		let viewModel = DocumentViewModel(
			documentID: document.id,
			session: .deletionSignedIn(client: client),
			draftStore: .testStore()
		)
		await viewModel.load()
		viewModel.draftTitle = "Unsaved title"
		viewModel.draftContent = "Unsaved content"

		let deleted = await viewModel.delete()

		#expect(deleted == nil)
		#expect(viewModel.document == document)
		#expect(viewModel.draftTitle == "Unsaved title")
		#expect(viewModel.draftContent == "Unsaved content")
		#expect(viewModel.statusMessage == "Document could not be deleted")
		#expect(viewModel.isDeleting == false)
		#expect(client.documents[document.id] == document)
	}

	@Test func committedDeleteWithLostResponseReconcilesAsDeleted() async throws {
		let client = PreviewDownwriteAPIClient.deletionSampleCopy()
		client.deleteDocumentCommittedError = URLError(.networkConnectionLost)
		let document = try #require(client.documents["doc-pitch"])
		let viewModel = DocumentViewModel(
			documentID: document.id,
			session: .deletionSignedIn(client: client),
			draftStore: .testStore()
		)
		await viewModel.load()

		let deleted = await viewModel.delete()

		#expect(deleted == document)
		#expect(client.documents[document.id] == nil)
		#expect(viewModel.statusMessage == nil)
		#expect(viewModel.isDeleteOutcomeUncertain == false)
	}

	@Test func staleDeleteRefreshesBeforeReconfirmation() async throws {
		let client = PreviewDownwriteAPIClient.deletionSampleCopy()
		let document = try #require(client.documents["doc-pitch"])
		let viewModel = DocumentViewModel(
			documentID: document.id,
			session: .deletionSignedIn(client: client),
			draftStore: .testStore()
		)
		await viewModel.load()
		viewModel.draftTitle = "Unsaved local title"
		viewModel.draftContent = "Unsaved local content"
		var latest = document
		latest.revision += 1
		latest.content = "Collaborator revision"
		client.documents[document.id] = latest

		let deleted = await viewModel.delete()

		#expect(deleted == nil)
		#expect(viewModel.document == latest)
		#expect(viewModel.draftTitle == "Unsaved local title")
		#expect(viewModel.draftContent == "Unsaved local content")
		#expect(viewModel.statusMessage == "Document changed since it was loaded. Your local edits are preserved; confirm deletion again to delete the latest revision.")
		#expect(client.documents[document.id] == latest)
	}

	@Test func unconfirmedDeleteOutcomeDisablesFurtherMutation() async throws {
		let client = PreviewDownwriteAPIClient.deletionSampleCopy()
		client.deleteDocumentError = URLError(.networkConnectionLost)
		client.documentExistsError = URLError(.timedOut)
		let document = try #require(client.documents["doc-pitch"])
		let viewModel = DocumentViewModel(
			documentID: document.id,
			session: .deletionSignedIn(client: client),
			draftStore: .testStore()
		)
		await viewModel.load()
		viewModel.draftTitle = "Unsaved title"
		viewModel.draftContent.append("\nUnsaved")

		let deleted = await viewModel.delete()

		#expect(deleted == nil)
		#expect(viewModel.isDeleteOutcomeUncertain)
		#expect(viewModel.canDelete == false)
		#expect(viewModel.canSave == false)
		await viewModel.save()
		let repeatedDelete = await viewModel.delete()
		#expect(repeatedDelete == nil)
		#expect(client.deleteDocumentCallCount == 1)

		client.deleteDocumentError = nil
		client.documentExistsError = nil
		let reconciledDeletion = await viewModel.reconcileDeleteOutcome()
		#expect(reconciledDeletion == nil)
		#expect(viewModel.isDeleteOutcomeUncertain == false)
		#expect(viewModel.canDelete)
		#expect(viewModel.draftTitle == "Unsaved title")
		#expect(viewModel.draftContent.hasSuffix("\nUnsaved"))
	}

	@Test func reloadReconcilesCommittedDeletionAfterInitialProbeFailure() async throws {
		let client = PreviewDownwriteAPIClient.deletionSampleCopy()
		client.deleteDocumentCommittedError = URLError(.networkConnectionLost)
		client.documentExistsError = URLError(.timedOut)
		let document = try #require(client.documents["doc-pitch"])
		let viewModel = DocumentViewModel(
			documentID: document.id,
			session: .deletionSignedIn(client: client),
			draftStore: .testStore()
		)
		await viewModel.load()

		let initialDelete = await viewModel.delete()
		#expect(initialDelete == nil)
		#expect(viewModel.isDeleteOutcomeUncertain)
		client.documentExistsError = nil

		let reconciledDeletion = await viewModel.reconcileDeleteOutcome()

		#expect(reconciledDeletion == document)
		#expect(viewModel.isDeleteOutcomeUncertain == false)
		#expect(viewModel.statusMessage == nil)
	}

	@Test func rapidDeleteIsSingleFlightAndDisablesSave() async throws {
		let client = PreviewDownwriteAPIClient.deletionSampleCopy()
		client.deleteDocumentDelay = .milliseconds(50)
		let document = try #require(client.documents["doc-pitch"])
		let viewModel = DocumentViewModel(
			documentID: document.id,
			session: .deletionSignedIn(client: client),
			draftStore: .testStore()
		)
		await viewModel.load()
		viewModel.draftContent.append("\nUnsaved")

		let firstDelete = Task { await viewModel.delete() }
		while !viewModel.isDeleting {
			await Task.yield()
		}

		#expect(viewModel.canDelete == false)
		#expect(viewModel.canSave == false)
		let secondDelete = await viewModel.delete()
		let firstDeleted = await firstDelete.value

		#expect(firstDeleted == document)
		#expect(secondDelete == nil)
		#expect(client.deleteDocumentCallCount == 1)
	}

	@Test func deletingFirstDocumentSelectsNextSibling() throws {
		let client = PreviewDownwriteAPIClient.deletionSampleCopy()
		let viewModel = WorkspaceViewModel(session: .deletionSignedIn(client: client))
		let document = try #require(client.documents["doc-pitch"])

		viewModel.applyDeletedDocument(document)

		#expect(viewModel.selectedGroupID == "group-product")
		#expect(viewModel.selectedDocumentID == "doc-release")
		#expect(viewModel.selectedGroup?.documents.map(\.id) == ["doc-release"])
	}

	@Test func deletingLastDocumentSelectsPreviousSibling() throws {
		let client = PreviewDownwriteAPIClient.deletionSampleCopy()
		let viewModel = WorkspaceViewModel(session: .deletionSignedIn(client: client))
		viewModel.selectedDocumentID = "doc-release"
		let document = try #require(client.documents["doc-release"])

		viewModel.applyDeletedDocument(document)

		#expect(viewModel.selectedGroupID == "group-product")
		#expect(viewModel.selectedDocumentID == "doc-pitch")
		#expect(viewModel.selectedGroup?.documents.map(\.id) == ["doc-pitch"])
	}

	@Test func deletingOnlyDocumentShowsEmptyDetail() throws {
		let client = PreviewDownwriteAPIClient.deletionSampleCopy()
		let viewModel = WorkspaceViewModel(session: .deletionSignedIn(client: client))
		viewModel.selectedGroupID = "group-archive"
		viewModel.selectedDocumentID = "doc-archive"
		let document = try #require(client.documents["doc-archive"])

		viewModel.applyDeletedDocument(document)

		#expect(viewModel.selectedGroupID == "group-archive")
		#expect(viewModel.selectedDocumentID == nil)
		#expect(viewModel.selectedGroup?.documents.isEmpty == true)
	}

	@Test func deleteCompletionDoesNotOverrideNewerNavigation() throws {
		let client = PreviewDownwriteAPIClient.deletionSampleCopy()
		let viewModel = WorkspaceViewModel(session: .deletionSignedIn(client: client))
		let document = try #require(client.documents["doc-pitch"])
		viewModel.selectedGroupID = "group-archive"
		viewModel.selectedDocumentID = "doc-archive"

		viewModel.applyDeletedDocument(document)

		#expect(viewModel.selectedGroupID == "group-archive")
		#expect(viewModel.selectedDocumentID == "doc-archive")
		#expect(viewModel.groups
			.first(where: { $0.id == "group-product" })?
			.documents.map(\.id) == ["doc-release"])
	}
}

private extension PreviewDownwriteAPIClient {
	static func deletionSampleCopy() -> PreviewDownwriteAPIClient {
		PreviewDownwriteAPIClient(groups: sample.groups, documents: sample.documents)
	}
}

private extension SessionViewModel {
	@MainActor
	static func deletionSignedIn(client: PreviewDownwriteAPIClient) -> SessionViewModel {
		SessionViewModel(
			state: .signedIn(
				InstanceSession(
					instanceURL: client.baseURL,
					identity: Identity(id: "deletion-\(UUID().uuidString)"),
					apiClient: client
				)
			)
		)
	}
}
