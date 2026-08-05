import SwiftUI

struct GroupListView: View {
    @Bindable var viewModel: WorkspaceViewModel

    var body: some View {
        List(selection: $viewModel.selectedGroupID) {
            switch viewModel.groupsState {
            case .idle, .loading:
                ProgressView()
            case .failed(let message):
                ContentUnavailableView("Could Not Load Groups", systemImage: "exclamationmark.triangle", description: Text(message))
            case .loaded(let groups):
                if groups.isEmpty {
                    ContentUnavailableView("No Groups", systemImage: "folder.badge.plus", description: Text("Create a group to start organizing documents."))
                } else {
                    ForEach(groups) { group in
                        GroupRowView(group: group)
                            .tag(group.id)
                    }
                }
            }
        }
        .navigationTitle("Groups")
        .toolbar {
            ToolbarItem(placement: .topBarTrailing) {
                Button {
                    Task { await viewModel.loadGroups() }
                } label: {
                    Label("Refresh", systemImage: "arrow.clockwise")
                }
            }
        }
    }
}

private struct GroupRowView: View {
    let group: GroupSummary

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            HStack {
                Text(group.name)
                    .font(.headline)
                Spacer()
                Text(group.role.displayName)
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
            if let description = group.description, !description.isEmpty {
                Text(description)
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
                    .lineLimit(2)
            }
            Text(group.documentCountText)
                .font(.caption)
                .foregroundStyle(.tertiary)
        }
        .padding(.vertical, 4)
    }
}

#Preview("Groups") {
    NavigationStack {
        GroupListView(viewModel: AppViewModel.previewSignedIn.workspaceModel)
    }
}

#Preview("Groups loading") {
    let viewModel = WorkspaceViewModel(session: .previewSignedOut)
    viewModel.groupsState = .loading
    return NavigationStack {
        GroupListView(viewModel: viewModel)
    }
}

#Preview("Groups error") {
    let viewModel = WorkspaceViewModel(session: .previewSignedOut)
    viewModel.groupsState = .failed("The instance could not be reached.")
    return NavigationStack {
        GroupListView(viewModel: viewModel)
    }
}

#Preview("Groups empty") {
    let client = PreviewDownwriteAPIClient(groups: [], documents: [:])
    let session = SessionViewModel(
        state: .signedIn(
            InstanceSession(
                instanceURL: client.baseURL,
                identity: Identity(id: "local-owner"),
                apiClient: client
            )
        )
    )
    let viewModel = WorkspaceViewModel(session: session)
    viewModel.groupsState = .loaded([])
    return NavigationStack {
        GroupListView(viewModel: viewModel)
    }
}
