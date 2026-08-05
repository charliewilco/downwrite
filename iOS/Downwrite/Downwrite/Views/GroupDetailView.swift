import SwiftUI

struct GroupDetailView: View {
    let group: GroupSummary
    @Bindable var viewModel: WorkspaceViewModel

    var body: some View {
        List(selection: $viewModel.selectedDocumentID) {
            Section {
                VStack(alignment: .leading, spacing: 10) {
                    Text(group.name)
                        .font(.system(.largeTitle, design: .serif, weight: .semibold))
                    if let description = group.description, !description.isEmpty {
                        Text(description)
                            .font(.body)
                            .foregroundStyle(.secondary)
                    }
                }
                .padding(.vertical, 8)
            }

            Section("Documents") {
                if group.documents.isEmpty {
                    ContentUnavailableView("No Documents", systemImage: "doc")
                } else {
                    ForEach(group.documents) { document in
                        DocumentRowView(document: document)
                            .tag(document.id)
                    }
                }
            }
        }
        .navigationTitle(group.name)
        .toolbar {
            ToolbarItemGroup(placement: .topBarTrailing) {
                Button {
                    viewModel.editSelectedGroup()
                } label: {
                    Label("Edit Group", systemImage: "slider.horizontal.3")
                }

                Button(role: .destructive) {
                    viewModel.reassignAndRemoveSelectedGroup()
                } label: {
                    Label("Remove Group", systemImage: "trash")
                }
                .disabled(viewModel.groups.count < 2)
            }
        }
    }
}

private struct DocumentRowView: View {
    let document: DocumentSummary

    var body: some View {
        VStack(alignment: .leading, spacing: 5) {
            Text(document.title)
                .font(.headline)
            HStack {
                Text("Revision \(document.revision)")
                Text(document.role.displayName)
            }
            .font(.caption)
            .foregroundStyle(.secondary)
        }
        .padding(.vertical, 3)
    }
}

#Preview("Group detail") {
    let app = AppViewModel.previewSignedIn
    NavigationStack {
        GroupDetailView(group: app.workspaceModel.groups.first!, viewModel: app.workspaceModel)
    }
}
