import SwiftUI

struct GroupReassignmentView: View {
    @State var viewModel: GroupReassignmentViewModel
    let onComplete: (GroupSummary) -> Void
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationStack {
            Form {
                Section {
                    Text(viewModel.sourceGroup.name)
                        .font(.headline)
                    Text("\(viewModel.sourceGroup.documents.count) documents will move before the group is removed.")
                        .foregroundStyle(.secondary)
                } header: {
                    Text("Remove group")
                }

                Section("Move documents to") {
                    Picker("Target group", selection: $viewModel.targetGroupID) {
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
            .navigationTitle("Reassign Documents")
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button(role: .destructive) {
                        Task {
                            do {
                                onComplete(try await viewModel.reassignAndDelete())
                            } catch {
                                viewModel.statusMessage = error.localizedDescription
                            }
                        }
                    } label: {
                        Text("Remove")
                    }
                    .disabled(!viewModel.canSubmit || viewModel.isWorking)
                }
            }
        }
    }
}

#Preview("Reassign") {
    let app = AppViewModel.previewSignedIn
    GroupReassignmentView(
        viewModel: GroupReassignmentViewModel(sourceGroup: app.workspaceModel.groups.first!, groups: app.workspaceModel.groups, session: .previewSignedIn),
        onComplete: { _ in }
    )
}
