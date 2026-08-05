import SwiftUI

struct GroupEditorView: View {
    @State var viewModel: GroupEditorViewModel
    let onSave: (GroupSummary) -> Void
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationStack {
            Form {
                Section {
                    TextField("Name", text: $viewModel.name)
                    TextField("Description", text: $viewModel.description, axis: .vertical)
                        .lineLimit(3...6)
                    TextField("Accent color", text: $viewModel.accentColor)
                        .textInputAutocapitalization(.never)
                        .autocorrectionDisabled()
                }

                if let statusMessage = viewModel.statusMessage {
                    Section {
                        Text(statusMessage)
                            .foregroundStyle(.secondary)
                    }
                }
            }
            .navigationTitle("Edit Group")
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Save") {
                        Task {
                            do {
                                onSave(try await viewModel.save())
                            } catch {
                                viewModel.statusMessage = error.localizedDescription
                            }
                        }
                    }
                    .disabled(viewModel.name.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty || viewModel.isSaving)
                }
            }
        }
    }
}

#Preview("Group editor") {
    GroupEditorView(
        viewModel: GroupEditorViewModel(group: PreviewDownwriteAPIClient.sample.groups.first!, session: .previewSignedIn),
        onSave: { _ in }
    )
}
