import SwiftUI

struct DocumentDetailView: View {
    @State var viewModel: DocumentViewModel
    @State private var mode: DocumentMode = .preview
	@State private var isPresentingDeleteConfirmation = false
	let onDelete: (DocumentRecord) -> Void

    var body: some View {
        Group {
            switch viewModel.documentState {
            case .idle, .loading:
                ProgressView()
            case .failed(let message):
                ContentUnavailableView("Could Not Load Document", systemImage: "exclamationmark.triangle", description: Text(message))
            case .loaded:
                documentBody
            }
        }
        .task {
            if case .idle = viewModel.documentState {
                await viewModel.load()
            }
        }
        .navigationTitle(viewModel.draftTitle.isEmpty ? "Document" : viewModel.draftTitle)
        .toolbar {
            ToolbarItem(placement: .principal) {
                Picker("Mode", selection: $mode) {
                    ForEach(DocumentMode.allCases) { mode in
                        Label(mode.title, systemImage: mode.systemImage).tag(mode)
                    }
                }
                .pickerStyle(.segmented)
                .frame(maxWidth: 240)
            }

            ToolbarItemGroup(placement: .topBarTrailing) {
                Button {
                    Task { await viewModel.save() }
                } label: {
                    Label("Save", systemImage: "square.and.arrow.down")
                }
				.disabled(!viewModel.canSave)

				Menu {
					Button("Delete Document", systemImage: "trash", role: .destructive) {
						isPresentingDeleteConfirmation = true
					}
				} label: {
					Label("More", systemImage: "ellipsis.circle")
				}
				.disabled(!viewModel.canDelete)
            }
        }
		.confirmationDialog(
			"Delete \(deletionTarget)?",
			isPresented: $isPresentingDeleteConfirmation,
			titleVisibility: .visible
		) {
			Button("Delete Document", role: .destructive) {
				Task {
					guard let document = await viewModel.delete() else {
						return
					}
					onDelete(document)
				}
			}
			Button("Cancel", role: .cancel) {}
		} message: {
			Text("This permanently deletes the document.")
		}
    }

	private var deletionTarget: String {
		let title = viewModel.draftTitle.trimmingCharacters(in: .whitespacesAndNewlines)
		return title.isEmpty ? "this document" : "“\(title)”"
	}

    private var documentBody: some View {
        VStack(spacing: 0) {
            if let statusMessage = viewModel.statusMessage {
				HStack {
					Text(statusMessage)
						.frame(maxWidth: .infinity, alignment: .leading)
					if viewModel.isDeleteOutcomeUncertain {
						Button("Reload") {
							Task {
								guard let deleted = await viewModel.reconcileDeleteOutcome() else {
									return
								}
								onDelete(deleted)
							}
						}
						.buttonStyle(.bordered)
					}
				}
				.font(.footnote)
				.foregroundStyle(.secondary)
				.padding(.horizontal)
				.padding(.vertical, 8)
				.background(.thinMaterial)
            }

            switch mode {
            case .preview:
                MarkdownReader(markdown: viewModel.draftContent)
            case .edit:
                DocumentEditor(title: $viewModel.draftTitle, content: $viewModel.draftContent)
            }
        }
    }
}

private enum DocumentMode: String, CaseIterable, Identifiable {
    case preview
    case edit

    var id: String { rawValue }

    var title: String {
        switch self {
        case .preview:
            "Preview"
        case .edit:
            "Edit"
        }
    }

    var systemImage: String {
        switch self {
        case .preview:
            "text.page"
        case .edit:
            "pencil"
        }
    }
}

private struct DocumentEditor: View {
    @Binding var title: String
    @Binding var content: String

    var body: some View {
        VStack(spacing: 0) {
            TextField("Title", text: $title)
                .font(.system(.title, design: .serif, weight: .semibold))
                .textFieldStyle(.plain)
                .padding()
                .background(.background)

            Divider()

            TextEditor(text: $content)
                .font(.system(.body, design: .monospaced))
                .scrollContentBackground(.hidden)
                .padding(.horizontal, 10)
                .background(Color(.systemBackground))
        }
    }
}

#Preview("Document preview") {
    NavigationStack {
		DocumentDetailView(
			viewModel: DocumentViewModel(documentID: "doc-pitch", session: .previewSignedIn),
			onDelete: { _ in }
		)
    }
}

#Preview("Document loading") {
    let viewModel = DocumentViewModel(documentID: "doc-pitch", session: .previewSignedIn)
    viewModel.documentState = .loading
    return NavigationStack {
		DocumentDetailView(viewModel: viewModel, onDelete: { _ in })
    }
}

#Preview("Document error") {
    let viewModel = DocumentViewModel(documentID: "doc-missing", session: .previewSignedIn)
    viewModel.documentState = .failed("Document was not found.")
    return NavigationStack {
		DocumentDetailView(viewModel: viewModel, onDelete: { _ in })
    }
}

#Preview("Document save conflict") {
    let viewModel = DocumentViewModel(documentID: "doc-pitch", session: .previewSignedIn)
    let document = PreviewDownwriteAPIClient.sample.documents["doc-pitch"]!
    viewModel.documentState = .loaded(document)
    viewModel.draftTitle = document.title
    viewModel.draftContent = "\(document.content)\n\nLocal edits are still here."
    viewModel.statusMessage = "Document has changed since it was loaded"
    return NavigationStack {
		DocumentDetailView(viewModel: viewModel, onDelete: { _ in })
    }
}
