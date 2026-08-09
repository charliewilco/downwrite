import SwiftUI

struct DocumentMoveView: View {
	@Environment(\.dismiss) private var dismiss
	@State var viewModel: DocumentMoveViewModel

	var body: some View {
		NavigationStack {
			Form {
				Section("Document") {
					Text(viewModel.documentTitle)
				}

				Section("Move to") {
					Picker("Workspace", selection: $viewModel.targetGroupID) {
						ForEach(viewModel.candidateGroups) { group in
							Text(group.name).tag(group.id)
						}
					}
				}

				if let statusMessage = viewModel.statusMessage {
					Section {
						Text(statusMessage)
							.foregroundStyle(.secondary)
					}
				}
			}
			.navigationTitle("Move Document")
			.toolbar {
				ToolbarItem(placement: .cancellationAction) {
					Button("Cancel") { dismiss() }
						.disabled(viewModel.isMoving)
				}
				ToolbarItem(placement: .confirmationAction) {
					Button("Move") {
						Task {
							if await viewModel.move() {
								dismiss()
							}
						}
					}
					.disabled(!viewModel.canMove)
				}
			}
			.interactiveDismissDisabled(viewModel.isMoving)
		}
	}
}

#Preview("Move document") {
	let document = PreviewDownwriteAPIClient.sample.documents["doc-pitch"]!
	DocumentMoveView(
		viewModel: DocumentMoveViewModel(
			document: document,
			groups: PreviewDownwriteAPIClient.sample.groups,
			moveAction: { _ in nil }
		)
	)
}
