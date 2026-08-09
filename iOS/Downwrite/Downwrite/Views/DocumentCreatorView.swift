import SwiftUI

struct DocumentCreatorView: View {
	@State var viewModel: DocumentCreatorViewModel
	let onCreate: (DocumentRecord) -> Void
	@Environment(\.dismiss) private var dismiss
	@FocusState private var focusedField: Field?

	var body: some View {
		NavigationStack {
			Form {
				Section("Document") {
					TextField("Title", text: $viewModel.title)
						.focused($focusedField, equals: .title)

					TextEditor(text: $viewModel.content)
						.font(.system(.body, design: .monospaced))
						.frame(minHeight: 220)
						.accessibilityLabel("Markdown content")
				}

				if let statusMessage = viewModel.statusMessage {
					Section {
						Text(statusMessage)
							.foregroundStyle(.secondary)
					}
				}
			}
			.navigationTitle("New Document")
			.toolbar {
				ToolbarItem(placement: .cancellationAction) {
					Button("Cancel") { dismiss() }
				}
				ToolbarItem(placement: .confirmationAction) {
					Button("Create") {
						Task {
							do {
								onCreate(try await viewModel.create())
							}
							catch {
								viewModel.statusMessage = error.localizedDescription
							}
						}
					}
					.disabled(!viewModel.canCreate)
				}
			}
			.task {
				focusedField = .title
			}
		}
		.presentationDetents([.medium, .large])
	}
}

extension DocumentCreatorView {
	fileprivate enum Field {
		case title
	}
}

#Preview("New document") {
	DocumentCreatorView(
		viewModel: DocumentCreatorViewModel(
			group: PreviewDownwriteAPIClient.sample.groups.first!,
			session: .previewSignedIn
		),
		onCreate: { _ in }
	)
}
