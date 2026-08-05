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
                ForEach(groups) { group in
                    GroupRowView(group: group)
                        .tag(group.id)
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
