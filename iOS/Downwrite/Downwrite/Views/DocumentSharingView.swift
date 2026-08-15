import SwiftUI

struct DocumentSharingView: View {
	@Environment(\.dismiss) private var dismiss
	@State var viewModel: DocumentSharingViewModel

	var body: some View {
		NavigationStack {
			Form {
				Section("Document") {
					Text(viewModel.documentTitle)
				}

				switch viewModel.shareState {
				case .idle, .loading:
					Section {
						HStack {
							Spacer()
							ProgressView()
							Spacer()
						}
					}
				case .failed(let message):
					Section {
						ContentUnavailableView(
							"Could Not Load Sharing",
							systemImage: "person.2.slash",
							description: Text(message)
						)
						Button("Try Again") {
							Task { await viewModel.load() }
						}
					}
				case .loaded(let share):
					inviteSection
					collaboratorSection(share.collaborators)
					invitationSection(share.invitations)
					publicLinkSection(share.publicLinks)
				}

				if let statusMessage = viewModel.statusMessage {
					Section {
						Text(statusMessage)
							.foregroundStyle(.secondary)
					}
				}
			}
			.navigationTitle("Share Document")
			.toolbar {
				ToolbarItem(placement: .cancellationAction) {
					Button("Done") { dismiss() }
						.disabled(viewModel.isMutating)
				}
				ToolbarItem(placement: .primaryAction) {
					Button("Refresh", systemImage: "arrow.clockwise") {
						Task { await viewModel.load() }
					}
					.disabled(viewModel.isMutating)
				}
			}
			.interactiveDismissDisabled(viewModel.isMutating)
			.task {
				if case .idle = viewModel.shareState {
					await viewModel.load()
				}
			}
		}
	}

	private var inviteSection: some View {
		Section("Invite collaborator") {
			TextField("Identity ID", text: $viewModel.inviteIdentityID)
				.textInputAutocapitalization(.never)
				.autocorrectionDisabled()
			Picker("Role", selection: $viewModel.inviteRole) {
				ForEach(Role.allCases) { role in
					Text(role.rawValue.capitalized).tag(role)
				}
			}
			Button("Create Invitation", systemImage: "person.badge.plus") {
				Task { await viewModel.createInvitation() }
			}
			.disabled(!viewModel.canInvite)
		}
	}

	private func collaboratorSection(_ collaborators: [DocumentCollaborator]) -> some View {
		Section("Collaborators") {
			if collaborators.isEmpty {
				Text("No collaborators yet.")
					.foregroundStyle(.secondary)
			}
			ForEach(collaborators) { collaborator in
				LabeledContent {
					if viewModel.canRemoveCollaborator(collaborator) {
						Button("Remove", role: .destructive) {
							Task { await viewModel.removeCollaborator(collaborator) }
						}
					}
					else if collaborator.identityID == viewModel.currentIdentityID {
						Text("You")
							.foregroundStyle(.secondary)
					}
				} label: {
					Text(collaborator.displayName ?? collaborator.identityID)
					Text(collaborator.role.rawValue.capitalized)
				}
			}
		}
	}

	private func invitationSection(_ invitations: [DocumentInvitation]) -> some View {
		Section("Invitations") {
			if invitations.isEmpty {
				Text("No invitations yet.")
					.foregroundStyle(.secondary)
			}
			ForEach(invitations) { invitation in
				VStack(alignment: .leading, spacing: 8) {
					LabeledContent(invitation.invitedIdentityID) {
						Text(invitation.status.rawValue.capitalized)
							.foregroundStyle(.secondary)
					}
					HStack {
						if let url = viewModel.invitationURL(for: invitation) {
							ShareLink(item: url) {
								Label("Share Invite", systemImage: "square.and.arrow.up")
							}
						}
						Spacer()
						if invitation.status == .pending {
							Button("Revoke", role: .destructive) {
								Task { await viewModel.revokeInvitation(invitation) }
							}
							.disabled(viewModel.isInteractionBlocked)
						}
					}
					.buttonStyle(.borderless)
				}
			}
		}
	}

	private func publicLinkSection(_ publicLinks: [DocumentPublicLink]) -> some View {
		Section("Public links") {
			TextField("Link label", text: $viewModel.publicLinkLabel)
			Button("Create Read-Only Link", systemImage: "link.badge.plus") {
				Task { await viewModel.createPublicLink() }
			}
			.disabled(!viewModel.canCreatePublicLink)

			if publicLinks.isEmpty {
				Text("No public links yet.")
					.foregroundStyle(.secondary)
			}
			ForEach(publicLinks) { publicLink in
				VStack(alignment: .leading, spacing: 8) {
					LabeledContent(publicLink.label ?? "Public read link") {
						Text(publicLink.active ? "Active" : "Disabled")
							.foregroundStyle(.secondary)
					}
					HStack {
						if let url = viewModel.publicURL(for: publicLink), publicLink.active {
							ShareLink(item: url) {
								Label("Share Link", systemImage: "square.and.arrow.up")
							}
						}
						Spacer()
						Button(publicLink.active ? "Disable" : "Enable") {
							Task {
								await viewModel.setPublicLink(publicLink, active: !publicLink.active)
							}
						}
						.disabled(viewModel.isInteractionBlocked)
					}
					.buttonStyle(.borderless)
				}
			}
		}
	}
}

#Preview("Document sharing") {
	DocumentSharingView(viewModel: .preview)
}

private extension DocumentSharingViewModel {
	@MainActor
	static var preview: DocumentSharingViewModel {
		let client = PreviewDownwriteAPIClient(
			groups: PreviewDownwriteAPIClient.sample.groups,
			documents: PreviewDownwriteAPIClient.sample.documents
		)
		let document = client.documents["doc-pitch"]!
		let session = SessionViewModel(
			state: .signedIn(
				InstanceSession(
					instanceURL: client.baseURL,
					identity: Identity(id: "local-owner"),
					apiClient: client
				)
			)
		)
		let viewModel = DocumentSharingViewModel(document: document, session: session)
		viewModel.shareState = .loaded(
			DocumentShareState(
				documentID: document.id,
				collaborators: [
					DocumentCollaborator(
						identityID: "editor@example.com",
						displayName: "Editor",
						role: .editor,
						createdAt: PreviewDownwriteAPIClient.timestamp
					),
				],
				invitations: [],
				publicLinks: []
			)
		)
		return viewModel
	}
}
