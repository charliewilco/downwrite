import SwiftUI

struct GroupReassignmentView: View {
    @State var viewModel: GroupReassignmentViewModel
    let onComplete: (GroupRemovalResult) -> Void
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationStack {
            Form {
                Section {
                    Text(viewModel.sourceGroup.name)
                        .font(.headline)
                    Text(removalSummary)
                        .foregroundStyle(.secondary)
                } header: {
                    Text("Remove group")
                }

                if viewModel.sourceGroup.documents.isEmpty {
                    Section {
                        Text("No documents need reassignment.")
                            .foregroundStyle(.secondary)
                    }
                } else {
                    Section("Move documents to") {
                        Picker("Target group", selection: $viewModel.targetGroupID) {
                            ForEach(viewModel.candidateGroups) { group in
                                Text(group.name).tag(group.id)
                            }
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
            .navigationTitle(viewModel.sourceGroup.documents.isEmpty ? "Remove Group" : "Reassign Documents")
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

    private var removalSummary: String {
        if viewModel.sourceGroup.documents.isEmpty {
            "This empty group will be removed."
        } else {
            "\(viewModel.sourceGroup.documents.count) documents will move before the group is removed."
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

#Preview("Remove empty group") {
    let group = GroupSummary(
        id: "group-empty",
        name: "Empty",
        description: nil,
        accentColor: nil,
        role: .owner,
        createdAt: PreviewDownwriteAPIClient.timestamp,
        updatedAt: PreviewDownwriteAPIClient.timestamp,
        documents: []
    )
    GroupReassignmentView(
        viewModel: GroupReassignmentViewModel(sourceGroup: group, groups: [group], session: .previewSignedIn),
        onComplete: { _ in }
    )
}
