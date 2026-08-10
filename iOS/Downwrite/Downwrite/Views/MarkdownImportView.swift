import SwiftUI

struct MarkdownImportView: View {
	@Environment(\.dismiss) private var dismiss
	@State var viewModel: MarkdownImportViewModel
	@State private var actionTask: Task<Void, Never>?
	let onImport: ([DocumentRecord]) -> Void

	var body: some View {
		NavigationStack {
			Form {
				Section("Workspace") {
					Text(viewModel.workspace.name)
				}

				switch viewModel.filesState {
				case .idle, .loading:
					Section {
						HStack {
							Spacer()
							ProgressView("Reading files…")
							Spacer()
						}
					}
				case .failed(let message):
					Section {
						ContentUnavailableView(
							"Could Not Read Files",
							systemImage: "doc.badge.ellipsis",
							description: Text(message)
						)
						Button("Try Again") {
							actionTask?.cancel()
							actionTask = Task { await viewModel.loadFiles() }
						}
					}
				case .loaded(let files):
					Section("Markdown files") {
						ForEach(Array(files.enumerated()), id: \.element.id) { index, file in
							LabeledContent {
								if index < viewModel.importedDocuments.count {
									Image(systemName: "checkmark.circle.fill")
										.foregroundStyle(.green)
								}
								else {
									Text("\(file.characterCount.formatted()) characters")
										.foregroundStyle(.secondary)
								}
							} label: {
								Text(file.title)
								Text(file.fileName)
									.foregroundStyle(.secondary)
							}
						}
					}
				}

				if let statusMessage = viewModel.statusMessage {
					Section {
						Text(statusMessage)
							.foregroundStyle(viewModel.isOutcomeUncertain ? .orange : .secondary)
					}
				}
			}
			.navigationTitle("Import Markdown")
			.toolbar {
				if !viewModel.isComplete {
					ToolbarItem(placement: .cancellationAction) {
						Button(viewModel.importedDocuments.isEmpty ? "Cancel" : "Done") {
							dismiss()
						}
						.disabled(viewModel.isImporting)
					}
				}
				ToolbarItem(placement: .confirmationAction) {
					if viewModel.isComplete {
						Button("Done") { dismiss() }
					}
					else {
						Button(viewModel.importedDocuments.isEmpty ? "Import" : "Continue") {
							actionTask?.cancel()
							actionTask = Task {
								onImport(await viewModel.importRemainingFiles())
							}
						}
						.disabled(!viewModel.canImport)
					}
				}
			}
			.interactiveDismissDisabled(viewModel.isImporting)
			.task {
				if case .idle = viewModel.filesState {
					await viewModel.loadFiles()
				}
			}
			.onDisappear {
				actionTask?.cancel()
			}
		}
	}
}

#Preview("Markdown import") {
	let client = PreviewDownwriteAPIClient.sample
	let workspace = client.groups.first!
	let viewModel = MarkdownImportViewModel(
		urls: [],
		workspace: workspace,
		session: .previewSignedIn
	)
	viewModel.filesState = .loaded([
		MarkdownImportFile(
			id: "notes.md",
			fileName: "release-notes.md",
			title: "release notes",
			content: "# Release notes\n",
			byteCount: 16
		),
	])
	return MarkdownImportView(viewModel: viewModel, onImport: { _ in })
}
