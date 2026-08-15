import Foundation
import Testing

@testable import Downwrite

@MainActor
struct DocumentSharingTests {
	@Test func loadsDocumentSharingState() async throws {
		let (client, viewModel, share) = try sharingFixture()

		await viewModel.load()

		#expect(viewModel.share == share)
		#expect(client.shareStates[share.documentID] == share)
	}

	@Test func invitationSubmissionIsTrimmedAndSingleFlight() async throws {
		let (client, viewModel, share) = try sharingFixture()
		await viewModel.load()
		client.sharingMutationDelay = .milliseconds(30)
		viewModel.inviteIdentityID = "  new-editor@example.com  "
		viewModel.inviteRole = .editor

		let firstSubmission = Task { await viewModel.createInvitation() }
		await waitUntil { viewModel.isMutating }
		await viewModel.createInvitation()
		await firstSubmission.value

		#expect(client.invitationInputs == [
			PreviewInvitationInput(
				documentID: share.documentID,
				identityID: "new-editor@example.com",
				role: .editor
			),
		])
		#expect(viewModel.share?.invitations.first?.invitedIdentityID == "new-editor@example.com")
		#expect(viewModel.inviteIdentityID.isEmpty)
	}

	@Test func failedInvitationPreservesInput() async throws {
		let (client, viewModel, _) = try sharingFixture()
		await viewModel.load()
		client.sharingMutationError = DownwriteErrorEnvelope(
			error: "Invitations are closed",
			code: "forbidden",
			status: 403
		)
		viewModel.inviteIdentityID = "blocked@example.com"

		await viewModel.createInvitation()

		#expect(viewModel.inviteIdentityID == "blocked@example.com")
		#expect(viewModel.statusMessage == "Invitations are closed")
		#expect(viewModel.isMutating == false)
	}

	@Test func committedInvitationWithLostResponseIsReconciledWithoutDuplicateRetry() async throws {
		let (client, viewModel, _) = try sharingFixture()
		await viewModel.load()
		client.invitationCommittedError = URLError(.timedOut)
		viewModel.inviteIdentityID = "new-editor@example.com"

		await viewModel.createInvitation()

		#expect(viewModel.share?.invitations.filter {
			$0.invitedIdentityID == "new-editor@example.com"
		}.count == 1)
		#expect(viewModel.inviteIdentityID.isEmpty)
		#expect(viewModel.statusMessage == "Invitation created.")
		#expect(viewModel.isOutcomeUncertain == false)
	}

	@Test func blankPublicLinkLabelCreatesActiveUnlabelledLink() async throws {
		let (client, viewModel, share) = try sharingFixture()
		await viewModel.load()
		viewModel.publicLinkLabel = "   "

		await viewModel.createPublicLink()

		#expect(client.publicLinkInputs == [
			PreviewPublicLinkInput(documentID: share.documentID, label: nil),
		])
		#expect(viewModel.share?.publicLinks.first?.active == true)
		#expect(viewModel.share?.publicLinks.first?.label == nil)
	}

	@Test func committedPublicLinkWithLostResponseIsReconciled() async throws {
		let (client, viewModel, _) = try sharingFixture()
		await viewModel.load()
		client.publicLinkCommittedError = URLError(.timedOut)
		viewModel.publicLinkLabel = "Review link"

		await viewModel.createPublicLink()

		#expect(viewModel.share?.publicLinks.filter { $0.label == "Review link" }.count == 1)
		#expect(viewModel.statusMessage == "Public link created.")
		#expect(viewModel.isOutcomeUncertain == false)
	}

	@Test func publicLinkCanBeDisabledWithoutChangingItsToken() async throws {
		let (client, viewModel, _) = try sharingFixture()
		await viewModel.load()
		let publicLink = try #require(viewModel.share?.publicLinks.first)

		await viewModel.setPublicLink(publicLink, active: false)

		let updated = try #require(viewModel.share?.publicLinks.first)
		#expect(updated.id == publicLink.id)
		#expect(updated.token == publicLink.token)
		#expect(updated.active == false)
		#expect(client.publicLinkUpdates == [
			PreviewPublicLinkUpdate(id: publicLink.id, label: nil, active: false),
		])
	}

	@Test func committedPublicLinkEnablementWithLostResponseIsReconciled() async throws {
		let (client, viewModel, _) = try sharingFixture()
		await viewModel.load()
		let publicLink = try #require(viewModel.share?.publicLinks.first)
		await viewModel.setPublicLink(publicLink, active: false)
		let disabled = try #require(viewModel.share?.publicLinks.first)
		client.publicLinkUpdateCommittedError = URLError(.timedOut)

		await viewModel.setPublicLink(disabled, active: true)

		#expect(viewModel.share?.publicLinks.first?.active == true)
		#expect(viewModel.statusMessage == "Public link enabled.")
		#expect(viewModel.isOutcomeUncertain == false)
	}

	@Test func unresolvedCapabilityMutationFreezesFurtherChangesUntilRefresh() async throws {
		let (client, viewModel, _) = try sharingFixture()
		await viewModel.load()
		client.invitationCommittedError = URLError(.timedOut)
		client.shareStateError = URLError(.networkConnectionLost)
		viewModel.inviteIdentityID = "uncertain@example.com"

		await viewModel.createInvitation()
		await viewModel.createInvitation()

		#expect(viewModel.isOutcomeUncertain)
		#expect(viewModel.isInteractionBlocked)
		#expect(client.invitationInputs.count == 1)

		client.shareStateError = nil
		await viewModel.load()

		#expect(viewModel.isOutcomeUncertain == false)
		#expect(viewModel.share?.invitations.contains {
			$0.invitedIdentityID == "uncertain@example.com"
		} == true)
	}

	@Test func collaboratorAndInvitationCanBeRemoved() async throws {
		let (_, viewModel, _) = try sharingFixture()
		await viewModel.load()
		let collaborator = try #require(viewModel.share?.collaborators.first)
		let invitation = try #require(viewModel.share?.invitations.first)

		await viewModel.removeCollaborator(collaborator)
		await viewModel.revokeInvitation(invitation)

		#expect(viewModel.share?.collaborators.isEmpty == true)
		#expect(viewModel.share?.invitations.isEmpty == true)
	}

	@Test func signedInOwnerCannotRemoveThemself() async throws {
		let (client, viewModel, share) = try sharingFixture()
		var ownerIncludedShare = share
		let owner = DocumentCollaborator(
			identityID: "local-owner",
			displayName: "Owner",
			role: .owner,
			createdAt: PreviewDownwriteAPIClient.timestamp
		)
		ownerIncludedShare.collaborators.insert(owner, at: 0)
		client.shareStates[share.documentID] = ownerIncludedShare
		await viewModel.load()

		#expect(viewModel.currentIdentityID == "local-owner")
		#expect(viewModel.canRemoveCollaborator(owner) == false)
		#expect(viewModel.canRemoveCollaborator(ownerIncludedShare.collaborators[1]))

		await viewModel.removeCollaborator(owner)

		#expect(client.collaboratorRemovals.isEmpty)
		#expect(viewModel.share?.collaborators.contains(owner) == true)
	}

	@Test func staleRefreshCannotUndoInvitationCreation() async throws {
		let (client, viewModel, _) = try sharingFixture()
		await viewModel.load()
		client.shareStateDelay = .milliseconds(40)
		let staleRefresh = Task { await viewModel.load() }
		try await Task.sleep(for: .milliseconds(5))
		viewModel.inviteIdentityID = "new@example.com"

		await viewModel.createInvitation()
		await staleRefresh.value

		#expect(viewModel.share?.invitations.contains { $0.invitedIdentityID == "new@example.com" } == true)
	}

	@Test func sharingURLsUseTheConfiguredInstanceOrigin() async throws {
		let (_, viewModel, _) = try sharingFixture()
		await viewModel.load()
		let invitation = try #require(viewModel.share?.invitations.first)
		let publicLink = try #require(viewModel.share?.publicLinks.first)

		#expect(viewModel.invitationURL(for: invitation)?.absoluteString == "http://localhost:8787/invitations/invite-token")
		#expect(viewModel.publicURL(for: publicLink)?.absoluteString == "http://localhost:8787/public/public-token")
	}

	@Test func editorsCannotManageSharing() async throws {
		let client = PreviewDownwriteAPIClient.sharingSampleCopy()
		let editorDocument = try #require(client.documents["doc-release"])
		let viewModel = DocumentViewModel(
			documentID: editorDocument.id,
			session: .sharingSignedIn(client: client),
			draftStore: .testStore()
		)
		await viewModel.load()

		#expect(viewModel.document?.role == .editor)
		#expect(viewModel.canManageSharing == false)
		#expect(viewModel.makeSharingViewModel() == nil)
	}

	private func sharingFixture() throws -> (
		PreviewDownwriteAPIClient,
		DocumentSharingViewModel,
		DocumentShareState
	) {
		let client = PreviewDownwriteAPIClient.sharingSampleCopy()
		let document = try #require(client.documents["doc-pitch"])
		let share = DocumentShareState.sharingSample(documentID: document.id)
		client.shareStates[document.id] = share
		let viewModel = DocumentSharingViewModel(
			document: document,
			session: .sharingSignedIn(client: client)
		)
		return (client, viewModel, share)
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

private extension DocumentShareState {
	static func sharingSample(documentID: String) -> DocumentShareState {
		DocumentShareState(
			documentID: documentID,
			collaborators: [
				DocumentCollaborator(
					identityID: "editor@example.com",
					displayName: "Editor",
					role: .editor,
					createdAt: PreviewDownwriteAPIClient.timestamp
				),
			],
			invitations: [
				DocumentInvitation(
					id: "invite-1",
					documentID: documentID,
					invitedIdentityID: "pending@example.com",
					role: .editor,
					token: "invite-token",
					status: .pending,
					createdByIdentityID: "local-owner",
					createdAt: PreviewDownwriteAPIClient.timestamp,
					acceptedAt: nil,
					revokedAt: nil
				),
			],
			publicLinks: [
				DocumentPublicLink(
					id: "public-1",
					documentID: documentID,
					token: "public-token",
					label: "Read only",
					active: true,
					createdAt: PreviewDownwriteAPIClient.timestamp
				),
			]
		)
	}
}

private extension PreviewDownwriteAPIClient {
	static func sharingSampleCopy() -> PreviewDownwriteAPIClient {
		PreviewDownwriteAPIClient(groups: sample.groups, documents: sample.documents)
	}
}

private extension SessionViewModel {
	@MainActor
	static func sharingSignedIn(client: PreviewDownwriteAPIClient) -> SessionViewModel {
		SessionViewModel(
			state: .signedIn(
				InstanceSession(
					instanceURL: client.baseURL,
					identity: Identity(id: "local-owner"),
					apiClient: client
				)
			),
			draftStore: .testStore()
		)
	}
}
