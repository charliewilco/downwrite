import SwiftUI

struct WorkspaceCreatorView: View {
    @State var viewModel: WorkspaceCreatorViewModel
    let onCreate: (GroupSummary) -> Void

    @Environment(\.dismiss) private var dismiss
    @FocusState private var focusedField: Field?

    var body: some View {
        NavigationStack {
            Form {
                Section {
                    TextField("Name", text: $viewModel.name)
                        .focused($focusedField, equals: .name)
                    TextField("Description", text: $viewModel.description, axis: .vertical)
                        .lineLimit(3...6)
                    TextField("Accent color", text: $viewModel.accentColor)
                        .textInputAutocapitalization(.never)
                        .autocorrectionDisabled()
                } footer: {
                    Text("Keep a project, topic, or client separated from the rest.")
                }

                if let statusMessage = viewModel.statusMessage {
                    Section {
                        Text(statusMessage)
                            .foregroundStyle(.secondary)
                    }
                }
            }
            .navigationTitle("New Workspace")
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
						.disabled(viewModel.isSaving)
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button(viewModel.isSaving ? "Creating…" : "Create") {
                        Task {
                            guard let workspace = await viewModel.create() else {
                                return
                            }
                            onCreate(workspace)
                            dismiss()
                        }
                    }
                    .disabled(!viewModel.canCreate)
                }
            }
            .task {
                focusedField = .name
            }
        }
        .presentationDetents([.medium, .large])
		.interactiveDismissDisabled(viewModel.isSaving)
    }
}

private extension WorkspaceCreatorView {
    enum Field {
        case name
    }
}

#Preview("New workspace") {
    WorkspaceCreatorView(
        viewModel: WorkspaceCreatorViewModel(session: .previewSignedIn),
        onCreate: { _ in }
    )
}

#Preview("Workspace creation error") {
	let viewModel = WorkspaceCreatorViewModel(session: .previewSignedIn)
	viewModel.name = "Field Notes"
	viewModel.statusMessage = "Workspace could not be created."
	return WorkspaceCreatorView(viewModel: viewModel, onCreate: { _ in })
}
