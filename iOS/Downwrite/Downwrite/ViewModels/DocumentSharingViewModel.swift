import Foundation
import Observation

@Observable
final class DocumentSharingViewModel: Identifiable {
	let id = UUID()
	let documentTitle: String
	var shareState: LoadState<DocumentShareState> = .idle
	var inviteIdentityID = ""
	var inviteRole: Role = .editor
	var publicLinkLabel = "Public read link"
	var isMutating = false
	var isOutcomeUncertain = false
	var statusMessage: String?

	private let documentID: String
	private let session: SessionViewModel
	private var stateRevision = 0

	init(document: DocumentRecord, session: SessionViewModel) {
		documentID = document.id
		documentTitle = document.title
		self.session = session
	}

	var share: DocumentShareState? {
		guard case .loaded(let share) = shareState else {
			return nil
		}
		return share
	}

	var canInvite: Bool {
		!inviteIdentityID.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty && !isInteractionBlocked
	}

	var canCreatePublicLink: Bool {
		!isInteractionBlocked
	}

	var isInteractionBlocked: Bool {
		isMutating || isOutcomeUncertain
	}

	var currentIdentityID: String? {
		session.activeSession?.identity?.id
	}

	func canRemoveCollaborator(_ collaborator: DocumentCollaborator) -> Bool {
		guard let currentIdentityID else {
			return false
		}
		return collaborator.identityID != currentIdentityID && !isInteractionBlocked
	}

	func load() async {
		stateRevision += 1
		let revision = stateRevision
		guard let apiClient = session.activeSession?.apiClient else {
			shareState = .failed("Sign in before managing sharing.")
			return
		}
		switch shareState {
		case .loaded:
			break
		default:
			shareState = .loading
		}
		do {
			let share = try await apiClient.getDocumentShareState(id: documentID)
			guard revision == stateRevision else {
				return
			}
			shareState = .loaded(share)
			if isOutcomeUncertain {
				statusMessage = "Sharing state refreshed."
			}
			isOutcomeUncertain = false
		}
		catch {
			guard revision == stateRevision else {
				return
			}
			if case .loaded = shareState {
				statusMessage = error.localizedDescription
			}
			else {
				shareState = .failed(error.localizedDescription)
			}
		}
	}

	func createInvitation() async {
		let identityID = inviteIdentityID.trimmingCharacters(in: .whitespacesAndNewlines)
		guard !identityID.isEmpty,
			let apiClient = session.activeSession?.apiClient,
			beginMutation()
		else {
			return
		}
		let baselineInvitationIDs = Set(share?.invitations.map(\.id) ?? [])
		defer { isMutating = false }
		do {
			let invitation = try await apiClient.createDocumentInvitation(
				documentID: documentID,
				identityID: identityID,
				role: inviteRole
			)
			updateShare { share in
				share.invitations.removeAll { $0.id == invitation.id }
				share.invitations.insert(invitation, at: 0)
			}
			inviteIdentityID = ""
			statusMessage = "Invitation created."
		}
		catch {
			guard isAmbiguous(error) else {
				statusMessage = error.localizedDescription
				return
			}
			guard let latest = await reconciledShareState(
				uncertainMessage: "Invitation outcome could not be confirmed. Refresh before making another sharing change."
			) else {
				return
			}
			let matching = latest.invitations.filter {
				!baselineInvitationIDs.contains($0.id)
					&& $0.invitedIdentityID == identityID
					&& $0.role == inviteRole
					&& $0.status == .pending
			}
			if matching.count == 1 {
				inviteIdentityID = ""
				statusMessage = "Invitation created."
			}
			else {
				statusMessage = "Latest sharing state loaded. Review invitations before trying again."
			}
		}
	}

	func revokeInvitation(_ invitation: DocumentInvitation) async {
		guard invitation.status == .pending,
			let apiClient = session.activeSession?.apiClient,
			beginMutation()
		else {
			return
		}
		defer { isMutating = false }
		do {
			try await apiClient.revokeDocumentInvitation(id: invitation.id)
			updateShare { share in
				share.invitations.removeAll { $0.id == invitation.id }
			}
			statusMessage = "Invitation revoked."
		}
		catch {
			statusMessage = error.localizedDescription
		}
	}

	func removeCollaborator(_ collaborator: DocumentCollaborator) async {
		guard canRemoveCollaborator(collaborator),
			let apiClient = session.activeSession?.apiClient,
			beginMutation()
		else {
			return
		}
		defer { isMutating = false }
		do {
			try await apiClient.removeDocumentCollaborator(
				documentID: documentID,
				identityID: collaborator.identityID
			)
			updateShare { share in
				share.collaborators.removeAll { $0.identityID == collaborator.identityID }
			}
			statusMessage = "Collaborator removed."
		}
		catch {
			statusMessage = error.localizedDescription
		}
	}

	func createPublicLink() async {
		guard let apiClient = session.activeSession?.apiClient, beginMutation() else {
			return
		}
		let baselinePublicLinkIDs = Set(share?.publicLinks.map(\.id) ?? [])
		defer { isMutating = false }
		let trimmedLabel = publicLinkLabel.trimmingCharacters(in: .whitespacesAndNewlines)
		do {
			let publicLink = try await apiClient.createPublicLink(
				documentID: documentID,
				label: trimmedLabel.isEmpty ? nil : trimmedLabel
			)
			updateShare { share in
				share.publicLinks.removeAll { $0.id == publicLink.id }
				share.publicLinks.insert(publicLink, at: 0)
			}
			statusMessage = "Public link created."
		}
		catch {
			guard isAmbiguous(error) else {
				statusMessage = error.localizedDescription
				return
			}
			guard let latest = await reconciledShareState(
				uncertainMessage: "Public-link outcome could not be confirmed. Refresh before making another sharing change."
			) else {
				return
			}
			let expectedLabel = trimmedLabel.isEmpty ? nil : trimmedLabel
			let matching = latest.publicLinks.filter {
				!baselinePublicLinkIDs.contains($0.id)
					&& $0.label == expectedLabel
					&& $0.active
			}
			statusMessage = matching.count == 1
				? "Public link created."
				: "Latest sharing state loaded. Review public links before trying again."
		}
	}

	func setPublicLink(_ publicLink: DocumentPublicLink, active: Bool) async {
		guard publicLink.active != active,
			let apiClient = session.activeSession?.apiClient,
			beginMutation()
		else {
			return
		}
		defer { isMutating = false }
		do {
			let updated = try await apiClient.updatePublicLink(
				id: publicLink.id,
				label: nil,
				active: active
			)
			updateShare { share in
				guard let index = share.publicLinks.firstIndex(where: { $0.id == updated.id }) else {
					return
				}
				share.publicLinks[index] = updated
			}
			statusMessage = active ? "Public link enabled." : "Public link disabled."
		}
		catch {
			guard isAmbiguous(error) else {
				statusMessage = error.localizedDescription
				return
			}
			guard let latest = await reconciledShareState(
				uncertainMessage: "Public-link outcome could not be confirmed. Refresh before making another sharing change."
			) else {
				return
			}
			if latest.publicLinks.first(where: { $0.id == publicLink.id })?.active == active {
				statusMessage = active ? "Public link enabled." : "Public link disabled."
			}
			else {
				statusMessage = error.localizedDescription
			}
		}
	}

	func invitationURL(for invitation: DocumentInvitation) -> URL? {
		session.activeSession?.instanceURL
			.appending(path: "invitations")
			.appending(path: invitation.token)
	}

	func publicURL(for publicLink: DocumentPublicLink) -> URL? {
		session.activeSession?.instanceURL
			.appending(path: "public")
			.appending(path: publicLink.token)
	}

	private func beginMutation() -> Bool {
		guard !isInteractionBlocked else {
			return false
		}
		stateRevision += 1
		isMutating = true
		statusMessage = nil
		return true
	}

	private func updateShare(_ update: (inout DocumentShareState) -> Void) {
		guard var share else {
			return
		}
		update(&share)
		shareState = .loaded(share)
	}

	private func isAmbiguous(_ error: Error) -> Bool {
		guard let apiError = error as? DownwriteErrorEnvelope else {
			return true
		}
		return apiError.status >= 500
	}

	private func reconciledShareState(uncertainMessage: String) async -> DocumentShareState? {
		guard let apiClient = session.activeSession?.apiClient else {
			isOutcomeUncertain = true
			statusMessage = uncertainMessage
			return nil
		}
		do {
			let latest = try await apiClient.getDocumentShareState(id: documentID)
			shareState = .loaded(latest)
			return latest
		}
		catch {
			isOutcomeUncertain = true
			statusMessage = uncertainMessage
			return nil
		}
	}
}
